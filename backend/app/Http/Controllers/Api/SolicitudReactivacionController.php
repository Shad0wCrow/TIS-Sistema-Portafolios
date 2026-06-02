<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SolicitudReactivacion;
use App\Models\Usuario;
use Illuminate\Http\Request;

class SolicitudReactivacionController extends Controller
{
    /**
     * POST /api/solicitudes-reactivacion
     * El usuario inhabilitado envía su solicitud.
     * No requiere token, se identifica por correo.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'mensaje' => 'required|string|min:10|max:1000',
            'correo'  => 'required|email',
        ]);

        $usuario = Usuario::where('correo', $data['correo'])
            ->where('eliminado', true)
            ->first();

        if (!$usuario) {
            return response()->json([
                'message' => 'No se encontró una cuenta inhabilitada con ese correo.',
            ], 404);
        }

        $pendiente = SolicitudReactivacion::where('usuario_id', $usuario->id_usuario)
            ->where('estado', 'pendiente')
            ->exists();

        if ($pendiente) {
            return response()->json([
                'message' => 'Ya tienes una solicitud de reactivación pendiente de revisión.',
            ], 409);
        }

        $solicitud = SolicitudReactivacion::create([
            'usuario_id' => $usuario->id_usuario,
            'mensaje'    => $data['mensaje'],
            'estado'     => 'pendiente',
            'creado_en'  => now(),
        ]);

        return response()->json([
            'message'      => 'Solicitud enviada correctamente.',
            'id_solicitud' => $solicitud->id_solicitud,
        ], 201);
    }

    /**
     * GET /api/admin/solicitudes-reactivacion
     * El admin lista las solicitudes.
     */
    public function index(Request $request)
    {
        $estado  = $request->query('estado', 'todos');
        $perPage = (int) $request->query('per_page', 15);

        $query = SolicitudReactivacion::with([
                'usuario:id_usuario,nombre_usuario,correo',
                'admin:id_usuario,nombre_usuario',
            ])
            ->orderByRaw("CASE WHEN estado = 'pendiente' THEN 0 ELSE 1 END")
            ->orderByDesc('creado_en');

        if ($estado !== 'todos') {
            $query->where('estado', $estado);
        }

        $paginated = $query->paginate($perPage);

        $data = $paginated->map(function ($s) {
            $nombreUsuario   = $s->usuario ? $s->usuario->nombre_usuario : null;
            $correo          = $s->usuario ? $s->usuario->correo : null;
            $adminNombre     = $s->admin   ? $s->admin->nombre_usuario   : null;

            return [
                'id_solicitud'         => $s->id_solicitud,
                'usuario_id'           => $s->usuario_id,
                'nombre_usuario'       => $nombreUsuario,
                'nombre_completo'      => null,
                'correo'               => $correo,
                'mensaje'              => $s->mensaje,
                'estado'               => $s->estado,
                'creado_en'            => $s->creado_en,
                'revisado_en'          => $s->revisado_en,
                'admin_id'             => $s->admin_id,
                'admin_nombre_usuario' => $adminNombre,
            ];
        });

        return response()->json([
            'data'         => $data,
            'current_page' => $paginated->currentPage(),
            'last_page'    => $paginated->lastPage(),
            'total'        => $paginated->total(),
        ]);
    }

    /**
     * PATCH /api/admin/solicitudes-reactivacion/{id}/resolver
     * El admin acepta o rechaza la solicitud.
     */
    public function resolver(Request $request, $id)
    {
        $data = $request->validate([
            'accion' => 'required|in:aceptar,rechazar',
        ]);

        $solicitud = SolicitudReactivacion::findOrFail($id);

        if ($solicitud->estado !== 'pendiente') {
            return response()->json([
                'message' => 'Esta solicitud ya fue procesada.',
            ], 409);
        }

        $admin       = $request->user();
        $nuevoEstado = $data['accion'] === 'aceptar' ? 'aceptada' : 'rechazada';

        $solicitud->estado      = $nuevoEstado;
        $solicitud->revisado_en = now();
        $solicitud->admin_id    = $admin->id_usuario;
        $solicitud->save();

        if ($data['accion'] === 'aceptar') {
            Usuario::where('id_usuario', $solicitud->usuario_id)
                ->update(['eliminado' => false]);
        }

        $solicitud->load(['usuario:id_usuario,nombre_usuario,correo', 'admin:id_usuario,nombre_usuario']);

        $nombreUsuario = $solicitud->usuario ? $solicitud->usuario->nombre_usuario : null;
        $correo        = $solicitud->usuario ? $solicitud->usuario->correo : null;
        $adminNombre   = $solicitud->admin   ? $solicitud->admin->nombre_usuario   : null;

        return response()->json([
            'message'   => $data['accion'] === 'aceptar'
                ? 'Cuenta reactivada correctamente.'
                : 'Solicitud rechazada.',
            'solicitud' => [
                'id_solicitud'         => $solicitud->id_solicitud,
                'usuario_id'           => $solicitud->usuario_id,
                'nombre_usuario'       => $nombreUsuario,
                'nombre_completo'      => null,
                'correo'               => $correo,
                'mensaje'              => $solicitud->mensaje,
                'estado'               => $solicitud->estado,
                'creado_en'            => $solicitud->creado_en,
                'revisado_en'          => $solicitud->revisado_en,
                'admin_id'             => $solicitud->admin_id,
                'admin_nombre_usuario' => $adminNombre,
            ],
        ]);
    }
}