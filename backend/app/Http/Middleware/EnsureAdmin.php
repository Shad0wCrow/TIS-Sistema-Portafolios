<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $usuario = $request->user();

        if (!$usuario || $usuario->rol !== 'admin' || (bool) $usuario->eliminado) {
            return response()->json([
                'message' => 'No tienes permisos para acceder al panel de administración.',
            ], 403);
        }

        return $next($request);
    }
}
