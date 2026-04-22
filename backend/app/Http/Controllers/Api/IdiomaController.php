<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Idioma;
use App\Models\UsuarioIdioma;
use Illuminate\Http\Request;

class IdiomaController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'nombre_idioma' => 'required|string|max:100|regex:/^[\pL\s\-]+$/u',
            'nivel'         => 'required|in:a1,a2,b1,b2,c1,c2,nativo',
            'visibilidad'   => 'nullable|in:publico,privado',
        ]);

        $idioma = Idioma::firstOrCreate(
            ['nombre' => $data['nombre_idioma']],
            ['nombre' => $data['nombre_idioma']]
        );

        $duplicado = UsuarioIdioma::where('usuario_id', $user->id_usuario)
            ->where('idioma_id', $idioma->id_idioma)
            ->where('eliminado', false)
            ->exists();

        if ($duplicado) {
            return response()->json(['message' => 'Ya tienes registrado ese idioma'], 400);
        }

        $usuarioIdioma = UsuarioIdioma::create([
            'usuario_id'  => $user->id_usuario,
            'idioma_id'   => $idioma->id_idioma,
            'nivel'       => $data['nivel'],
            'visibilidad' => $data['visibilidad'] ?? 'publico',
            'eliminado'   => false,
        ]);

        return response()->json([
            'message' => 'Idioma registrado correctamente',
            'idioma'  => $usuarioIdioma->load('idioma'),
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $usuarioIdioma = UsuarioIdioma::where('id_usuario_idioma', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->first();

        if (!$usuarioIdioma) {
            return response()->json(['message' => 'Idioma no encontrado'], 404);
        }

        $usuarioIdioma->update(['eliminado' => true]);

        return response()->json(['message' => 'Idioma eliminado correctamente']);
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $idiomas = UsuarioIdioma::where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->with('idioma')
            ->get();

        return response()->json(['idiomas' => $idiomas]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();

        $usuarioIdioma = UsuarioIdioma::where('id_usuario_idioma', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->with('idioma')
            ->first();

        if (!$usuarioIdioma) {
            return response()->json(['message' => 'Idioma no encontrado'], 404);
        }

        return response()->json(['idioma' => $usuarioIdioma]);
    }

    public function sugerencias(Request $request)
    {
        $q = $request->query('q', '');

        if (strlen(trim($q)) < 2) {
            return response()->json(['sugerencias' => []]);
        }

        $sugerencias = Idioma::where('nombre', 'like', '%' . $q . '%')
            ->orderBy('nombre')
            ->limit(10)
            ->pluck('nombre');

        return response()->json(['sugerencias' => $sugerencias]);
    }
}