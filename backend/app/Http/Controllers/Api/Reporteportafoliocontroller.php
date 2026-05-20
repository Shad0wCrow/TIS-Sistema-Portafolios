<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReportePortafolio;
use App\Models\Usuario;
use App\Repositories\PortafolioPublicacionRepository;
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

    public function __construct(PortafolioPublicacionRepository $publicacionRepository)
    {
        $this->publicacionRepository = $publicacionRepository;
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

        // 2. Resolver usuario autenticado (opcional — visitantes también pueden reportar)
        $reportadoPorId = $this->resolverUsuarioId($request);

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
            ReportePortafolio::create([
                'publicacion_id' => $publicacion->id_publicacion,
                'reportado_por'  => $reportadoPorId,
                'motivo'         => $data['motivo'],
                'comentario'     => $data['comentario'] ?? null,
                'estado'         => 'pendiente',
                'creado_en'      => now(),
            ]);

            return response()->json([
                'message' => 'Reporte registrado correctamente. Gracias por ayudarnos a mantener la comunidad.',
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

        $query = DB::table('reporte_portafolio as r')
            ->join('portafolio_publicacion as pp', 'pp.id_publicacion', '=', 'r.publicacion_id')
            ->join('usuario as u', 'u.id_usuario', '=', 'pp.usuario_id')
            ->leftJoin('perfil as p', function ($join) {
                $join->on('p.usuario_id', '=', 'u.id_usuario')
                    ->where('p.eliminado', false);
            })
            ->leftJoin('usuario as reporter', 'reporter.id_usuario', '=', 'r.reportado_por')
            ->select([
                'r.id_reporte',
                'r.publicacion_id',
                'pp.slug_publico',
                'u.id_usuario as usuario_id_reportado',
                'u.nombre_usuario as nombre_usuario_reportado',
                'u.eliminado',
                'p.nombre_perfil',
                'p.apellido_perfil',
                'r.motivo',
                'r.comentario',
                'r.estado',
                'r.nota_moderador',
                'reporter.nombre_usuario as reportado_por_nombre',
                'r.creado_en',
                'r.revisado_en',
            ]);

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
                // Actualizar el reporte
                $reporte->update([
                    'estado'         => $data['estado'],
                    'nota_moderador' => $data['nota_moderador'] ?? null,
                    'revisado_por'   => $admin->id_usuario,
                    'revisado_en'    => now(),
                ]);

                // Actuar sobre la cuenta si se solicitó
                if (!empty($data['accion_cuenta'])) {
                    $publicacion = $reporte->publicacion;
                    if (!$publicacion) return;

                    $usuarioReportado = Usuario::find($publicacion->usuario_id);
                    if (!$usuarioReportado) return;

                    // No inhabilitar al propio admin ni al último admin activo
                    if ($data['accion_cuenta'] === 'inhabilitar') {
                        if ((int) $admin->id_usuario === (int) $usuarioReportado->id_usuario) {
                            throw ValidationException::withMessages([
                                'accion_cuenta' => ['No puedes inhabilitarte a ti mismo.'],
                            ]);
                        }

                        if ($usuarioReportado->rol === 'admin') {
                            $otrosAdminsActivos = Usuario::where('rol', 'admin')
                                ->where('eliminado', false)
                                ->where('id_usuario', '!=', $usuarioReportado->id_usuario)
                                ->exists();

                            if (!$otrosAdminsActivos) {
                                throw ValidationException::withMessages([
                                    'accion_cuenta' => ['No puedes inhabilitar al último administrador activo.'],
                                ]);
                            }
                        }

                        $usuarioReportado->update(['eliminado' => true]);

                        // Revocar tokens activos
                        \Laravel\Sanctum\PersonalAccessToken::where('tokenable_type', Usuario::class)
                            ->where('tokenable_id', $usuarioReportado->id_usuario)
                            ->delete();
                    } elseif ($data['accion_cuenta'] === 'habilitar') {
                        $usuarioReportado->update(['eliminado' => false]);
                    }
                }
            });

            // Recargar con relaciones para devolver el reporte actualizado
            $row = DB::table('reporte_portafolio as r')
                ->join('portafolio_publicacion as pp', 'pp.id_publicacion', '=', 'r.publicacion_id')
                ->join('usuario as u', 'u.id_usuario', '=', 'pp.usuario_id')
                ->leftJoin('perfil as p', function ($join) {
                    $join->on('p.usuario_id', '=', 'u.id_usuario')->where('p.eliminado', false);
                })
                ->leftJoin('usuario as reporter', 'reporter.id_usuario', '=', 'r.reportado_por')
                ->where('r.id_reporte', $id)
                ->select([
                    'r.id_reporte', 'r.publicacion_id', 'pp.slug_publico',
                    'u.id_usuario as usuario_id_reportado', 'u.nombre_usuario as nombre_usuario_reportado',
                    'u.eliminado', 'p.nombre_perfil', 'p.apellido_perfil',
                    'r.motivo', 'r.comentario', 'r.estado', 'r.nota_moderador',
                    'reporter.nombre_usuario as reportado_por_nombre',
                    'r.creado_en', 'r.revisado_en',
                ])
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

    private function formatearReporte(object $row): array
    {
        $nombre = trim(($row->nombre_perfil ?? '') . ' ' . ($row->apellido_perfil ?? ''));

        return [
            'id_reporte'               => $row->id_reporte,
            'publicacion_id'           => $row->publicacion_id,
            'slug_publico'             => $row->slug_publico,
            'usuario_id_reportado'     => $row->usuario_id_reportado,
            'nombre_usuario_reportado' => $row->nombre_usuario_reportado,
            'nombre_reportado'         => $nombre !== '' ? $nombre : $row->nombre_usuario_reportado,
            'estado_cuenta'            => $row->eliminado ? 'inhabilitado' : 'activo',
            'eliminado'                => (bool) $row->eliminado,
            'motivo'                   => $row->motivo,
            'comentario'               => $row->comentario,
            'estado'                   => $row->estado,
            'nota_moderador'           => $row->nota_moderador,
            'reportado_por_nombre'     => $row->reportado_por_nombre,
            'creado_en'                => $row->creado_en,
            'revisado_en'              => $row->revisado_en,
        ];
    }
}