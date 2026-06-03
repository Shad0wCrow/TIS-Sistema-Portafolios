<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotificacionUsuario;
use Illuminate\Http\Request;

class NotificacionUsuarioController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate([
            'estado' => 'sometimes|nullable|in:todas,no_leidas,leidas',
            'per_page' => 'sometimes|integer|min:5|max:50',
        ]);

        $usuario = $request->user();
        $estado = $data['estado'] ?? 'todas';

        $query = NotificacionUsuario::where('usuario_id', $usuario->id_usuario);

        if ($estado === 'no_leidas') {
            $query->where('leida', false);
        } elseif ($estado === 'leidas') {
            $query->where('leida', true);
        }

        $notificaciones = $query
            ->orderByDesc('creado_en')
            ->paginate($data['per_page'] ?? 10);

        return response()->json([
            'notificaciones' => $notificaciones,
            'no_leidas' => $this->contarNoLeidas($usuario->id_usuario),
        ]);
    }

    public function resumen(Request $request)
    {
        return response()->json([
            'no_leidas' => $this->contarNoLeidas($request->user()->id_usuario),
        ]);
    }

    public function marcarLeida(Request $request, int $id)
    {
        $usuario = $request->user();

        $notificacion = NotificacionUsuario::where('id_notificacion', $id)
            ->where('usuario_id', $usuario->id_usuario)
            ->firstOrFail();

        if (!$notificacion->leida) {
            $notificacion->update([
                'leida' => true,
                'leida_en' => now(),
            ]);
        }

        return response()->json([
            'notificacion' => $notificacion->fresh(),
            'no_leidas' => $this->contarNoLeidas($usuario->id_usuario),
        ]);
    }

    public function marcarTodasLeidas(Request $request)
    {
        $usuario = $request->user();

        NotificacionUsuario::where('usuario_id', $usuario->id_usuario)
            ->where('leida', false)
            ->update([
                'leida' => true,
                'leida_en' => now(),
            ]);

        return response()->json([
            'no_leidas' => 0,
        ]);
    }

    private function contarNoLeidas(int $usuarioId): int
    {
        return NotificacionUsuario::where('usuario_id', $usuarioId)
            ->where('leida', false)
            ->count();
    }
}
