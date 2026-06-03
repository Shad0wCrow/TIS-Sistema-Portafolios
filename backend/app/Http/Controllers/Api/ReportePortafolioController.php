<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotificacionUsuario;
use App\Models\ReportePortafolio;
use App\Models\Usuario;
use App\Repositories\PortafolioPublicacionRepository;
use App\Services\UsuarioEstadoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class ReportePortafolioController extends Controller
{
    private const MOTIVOS_VALIDOS = [
        'contenido_inapropiado',
        'spam',
        'perfil_falso',
        'informacion_falsa',
        'derechos_autor',
        'acoso',
        'otro',
    ];

    private PortafolioPublicacionRepository $publicacionRepository;
    private UsuarioEstadoService $usuarioEstadoService;

    public function __construct(
        PortafolioPublicacionRepository $publicacionRepository,
        UsuarioEstadoService $usuarioEstadoService
    ) {
        $this->publicacionRepository = $publicacionRepository;
        $this->usuarioEstadoService = $usuarioEstadoService;
    }

    // ── POST /public/portafolios/{slug}/reportar ──────────────────────────
    // Accesible por visitantes y usuarios autenticados.

    public function reportar(Request $request, string $slug)
    {
        $data = $request->validate([
            'motivo'     => ['required', Rule::in(self::MOTIVOS_VALIDOS)],
            'comentario' => 'nullable|string|max:500',
        ]);

        // 1. Verificar que el portafolio exista y esté disponible
        $publicacion = $this->publicacionRepository->buscarPublicadoPorSlug($slug)
                    ?? $this->publicacionRepository->buscarPorSlugConEnlaceActivo($slug);

        if (!$publicacion) {
            return response()->json(['message' => 'El portafolio no está disponible.'], 404);
        }

        $usuarioReportado = Usuario::find($publicacion->usuario_id);
        if (!$usuarioReportado) {
            return response()->json(['message' => 'El usuario reportado no está disponible.'], 404);
        }

        // 2. Resolver usuario autenticado (opcional — visitantes también pueden reportar)
        $reportadoPorId = $this->resolverUsuarioId($request);
        $usuarioReportante = $reportadoPorId ? Usuario::find($reportadoPorId) : null;

        // 3. CA #6: No permitir auto-reporte
        if ($reportadoPorId && (int) $reportadoPorId === (int) $publicacion->usuario_id) {
            return response()->json([
                'message' => 'No puedes reportar tu propio portafolio.',
            ], 422);
        }

        // 4. CA #5: Bloquear reporte duplicado (solo si el usuario está autenticado)
        if ($reportadoPorId) {
            $yaReporto = ReportePortafolio::where('publicacion_id', $publicacion->id_publicacion)
                ->where('reportado_por', $reportadoPorId)
                ->exists();

            if ($yaReporto) {
                return response()->json([
                    'message' => 'Ya has reportado este portafolio y está bajo revisión.',
                ], 409);
            }
        }

        // 5. Registrar el reporte
        try {
            $snapshotReportado = $this->snapshotUsuario($usuarioReportado);

            $reporte = ReportePortafolio::create([
                'publicacion_id' => $publicacion->id_publicacion,
                'usuario_reportado_id' => $usuarioReportado->id_usuario,
                'slug_publico_snapshot' => $publicacion->slug_publico,
                'nombre_reportado_snapshot' => $snapshotReportado['nombre'],
                'nombre_usuario_reportado_snapshot' => $usuarioReportado->nombre_usuario,
                'reportado_por'  => $reportadoPorId,
                'reportado_por_snapshot' => $usuarioReportante ? $usuarioReportante->nombre_usuario : null,
                'motivo'         => $data['motivo'],
                'comentario'     => $data['comentario'] ?? null,
                'ip_reportante'  => $request->ip(),
                'user_agent_reportante' => $request->userAgent() ? mb_substr($request->userAgent(), 0, 500) : null,
                'estado'         => 'pendiente',
                'creado_en'      => now(),
            ]);

            NotificacionUsuario::create([
                'usuario_id' => $usuarioReportado->id_usuario,
                'reporte_id' => $reporte->id_reporte,
                'tipo' => 'reporte_portafolio',
                'titulo' => 'Advertencia por reporte recibido',
                'mensaje' => 'Tu portafolio publicado recibio un reporte. Revisa el contenido para asegurarte de que cumple las normas de la plataforma.',
                'slug_publico' => $publicacion->slug_publico,
                'portafolio_nombre' => $snapshotReportado['nombre'],
                'leida' => false,
                'creado_en' => now(),
            ]);

            return response()->json([
                'message' => 'Reporte registrado correctamente. Gracias por ayudarnos a mantener la comunidad.',
                'reporte' => [
                    'id_reporte' => $reporte->id_reporte,
                    'estado' => $reporte->estado,
                    'creado_en' => $reporte->creado_en,
                ],
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Error al registrar reporte de portafolio', [
                'slug'  => $slug,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'No se pudo registrar el reporte. Intenta nuevamente.'], 500);
        }
    }

    // ── GET /admin/reportes/portafolios ───────────────────────────────────
    // Lista paginada de reportes para el panel de administración.

    public function index(Request $request)
    {
        $data = $request->validate([
            'estado'   => ['sometimes', 'nullable', Rule::in(['todos', 'pendiente', 'revisado', 'desestimado'])],
            'per_page' => 'sometimes|integer|min:5|max:100',
        ]);

        $estado   = $data['estado'] ?? 'pendiente';
        $perPage  = $data['per_page'] ?? 8;

        $query = $this->baseReportesQuery();

        if ($estado !== 'todos') {
            $query->where('r.estado', $estado);
        }

        $resultados = $query
            ->orderByRaw("CASE r.estado WHEN 'pendiente' THEN 0 ELSE 1 END")
            ->orderByDesc('r.creado_en')
            ->paginate($perPage);

        $resultados->getCollection()->transform(fn ($row) => $this->formatearReporte($row));

        return response()->json($resultados);
    }

    // ── PATCH /admin/reportes/portafolios/{id}/resolver ───────────────────
    // Resuelve un reporte y opcionalmente actúa sobre la cuenta.

    public function resolver(Request $request, int $id)
    {
        $data = $request->validate([
            'estado'          => ['required', Rule::in(['revisado', 'desestimado'])],
            'nota_moderador'  => 'nullable|string|max:1000',
            'accion_cuenta'   => ['nullable', Rule::in(['inhabilitar', 'habilitar'])],
        ]);

        $reporte = ReportePortafolio::findOrFail($id);

        if ($reporte->estado !== 'pendiente') {
            return response()->json(['message' => 'Este reporte ya fue procesado.'], 422);
        }

        $admin = $request->user();

        try {
            DB::transaction(function () use ($reporte, $data, $admin) {
                $reporte->update([
                    'estado'         => $data['estado'],
                    'nota_moderador' => $data['nota_moderador'] ?? null,
                    'revisado_por'   => $admin->id_usuario,
                    'revisado_en'    => now(),
                ]);

                if (!empty($data['accion_cuenta'])) {
                    $usuarioReportado = $reporte->usuarioReportado
                        ?: ($reporte->publicacion ? Usuario::find($reporte->publicacion->usuario_id) : null);
                    if (!$usuarioReportado) return;

                    $this->usuarioEstadoService->cambiarEstado(
                        $usuarioReportado,
                        $data['accion_cuenta'] === 'inhabilitar',
                        $admin,
                        'resolucion_reporte',
                        $reporte,
                        'Reporte de portafolio',
                        $data['nota_moderador'] ?? null
                    );
                }

                if ($data['estado'] === 'desestimado') {
                    NotificacionUsuario::where('reporte_id', $reporte->id_reporte)
                        ->update([
                            'titulo' => 'Reporte desestimado por administracion',
                            'mensaje' => 'Una advertencia asociada a tu portafolio fue desestimada por administracion. Se conserva en tu historial como referencia.',
                            'leida' => true,
                            'leida_en' => now(),
                        ]);
                }
            });

            $row = $this->baseReportesQuery()
                ->where('r.id_reporte', $id)
                ->first();

            $mensaje = $data['estado'] === 'revisado'
                ? 'Reporte marcado como revisado.'
                : 'Reporte desestimado.';

            if (!empty($data['accion_cuenta'])) {
                $accion   = $data['accion_cuenta'] === 'inhabilitar' ? 'inhabilitada' : 'habilitada';
                $mensaje .= " Cuenta {$accion}.";
            }

            return response()->json([
                'message' => $mensaje,
                'reporte' => $this->formatearReporte($row),
            ]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error('Error al resolver reporte', ['id' => $id, 'error' => $e->getMessage()]);

            return response()->json(['message' => 'No se pudo resolver el reporte. Intenta nuevamente.'], 500);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private function resolverUsuarioId(Request $request): ?int
    {
        $token = $request->bearerToken();
        if (!$token) return null;

        $accessToken = PersonalAccessToken::findToken($token);
        $usuario     = $accessToken ? $accessToken->tokenable : null;

        return $usuario ? (int) $usuario->id_usuario : null;
    }

    private function baseReportesQuery()
    {
        return DB::table('reporte_portafolio as r')
            ->leftJoin('portafolio_publicacion as pp', 'pp.id_publicacion', '=', 'r.publicacion_id')
            ->leftJoin('usuario as u', 'u.id_usuario', '=', 'r.usuario_reportado_id')
            ->leftJoin('perfil as p', function ($join) {
                $join->on('p.usuario_id', '=', 'u.id_usuario')
                    ->where('p.eliminado', false);
            })
            ->leftJoin('usuario as reporter', 'reporter.id_usuario', '=', 'r.reportado_por')
            ->select([
                'r.id_reporte',
                'r.publicacion_id',
                DB::raw('COALESCE(pp.slug_publico, r.slug_publico_snapshot) as slug_publico'),
                'r.usuario_reportado_id as usuario_id_reportado',
                'u.nombre_usuario as nombre_usuario_reportado_actual',
                'r.nombre_usuario_reportado_snapshot',
                'u.eliminado',
                'p.nombre_perfil',
                'p.apellido_perfil',
                'r.nombre_reportado_snapshot',
                'r.motivo',
                'r.comentario',
                'r.ip_reportante',
                'r.user_agent_reportante',
                'r.estado',
                'r.nota_moderador',
                'r.reportado_por as usuario_reportante_id',
                'reporter.nombre_usuario as reportado_por_nombre_actual',
                'r.reportado_por_snapshot',
                'r.creado_en',
                'r.revisado_en',
            ]);
    }

    private function snapshotUsuario(Usuario $usuario): array
    {
        $perfil = DB::table('perfil')
            ->where('usuario_id', $usuario->id_usuario)
            ->where('eliminado', false)
            ->first(['nombre_perfil', 'apellido_perfil']);

        $nombre = trim(($perfil->nombre_perfil ?? '') . ' ' . ($perfil->apellido_perfil ?? ''));

        return [
            'nombre' => $nombre !== '' ? $nombre : $usuario->nombre_usuario,
        ];
    }

    private function formatearReporte(object $row): array
    {
        $nombre = trim(($row->nombre_perfil ?? '') . ' ' . ($row->apellido_perfil ?? ''));
        $nombreUsuarioReportado = $row->nombre_usuario_reportado_actual
            ?? $row->nombre_usuario_reportado_snapshot
            ?? 'usuario-no-disponible';
        $nombreReportado = $nombre !== ''
            ? $nombre
            : ($row->nombre_reportado_snapshot ?: $nombreUsuarioReportado);
        $eliminado = (bool) ($row->eliminado ?? false);

        return [
            'id_reporte'               => $row->id_reporte,
            'publicacion_id'           => $row->publicacion_id,
            'slug_publico'             => $row->slug_publico,
            'usuario_id_reportado'     => $row->usuario_id_reportado,
            'nombre_usuario_reportado' => $nombreUsuarioReportado,
            'nombre_reportado'         => $nombreReportado,
            'estado_cuenta'            => $eliminado ? 'inhabilitado' : 'activo',
            'eliminado'                => $eliminado,
            'motivo'                   => $row->motivo,
            'comentario'               => $row->comentario,
            'ip_reportante'            => $row->ip_reportante,
            'user_agent_reportante'    => $row->user_agent_reportante,
            'estado'                   => $row->estado,
            'nota_moderador'           => $row->nota_moderador,
            'usuario_reportante_id'    => $row->usuario_reportante_id,
            'reportado_por_nombre'     => $row->reportado_por_nombre_actual ?? $row->reportado_por_snapshot,
            'creado_en'                => $row->creado_en,
            'revisado_en'              => $row->revisado_en,
        ];
    }
}
