<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Educacion;
use Illuminate\Http\Request;

class EducacionController extends Controller
{
    /**
     * Lista todas las educaciones del usuario autenticado (sin filtro por area_estudio).
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $educaciones = Educacion::where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->orderByDesc('fecha_inicio')
            ->get();

        return response()->json(['educaciones' => $educaciones]);
    }

    /**
     * Devuelve sugerencias de instituciones ya registradas en el sistema
     * que coincidan con el término buscado (para autocompletar sin datos estáticos).
     */
    public function sugerencias(Request $request)
    {
        $q = $request->query('q', '');

        if (strlen(trim($q)) < 3) {
            return response()->json(['sugerencias' => []]);
        }

        $sugerencias = Educacion::where('eliminado', false)
            ->where('institucion', 'like', '%' . $q . '%')
            ->distinct()
            ->orderBy('institucion')
            ->limit(8)
            ->pluck('institucion');

        return response()->json(['sugerencias' => $sugerencias]);
    }

    /**
     * Registra una nueva educación para el usuario autenticado.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'institucion'  => 'required|string|max:150',
            'titulo'       => 'required|string|max:150',
            'area_estudio' => 'nullable|string|max:150',
            'fecha_inicio' => 'required|date',
            'fecha_fin'    => 'nullable|date|after_or_equal:fecha_inicio',
            'descripcion'  => 'nullable|string',
            'visibilidad'  => 'nullable|in:publico,privado',
        ]);

        $educacion = Educacion::create([
            'usuario_id'   => $user->id_usuario,
            'institucion'  => $data['institucion'],
            'titulo'       => $data['titulo'],
            'area_estudio' => $data['area_estudio'] ?? null,
            'fecha_inicio' => $data['fecha_inicio'],
            'fecha_fin'    => $data['fecha_fin'] ?? null,
            'descripcion'  => $data['descripcion'] ?? null,
            'visibilidad'  => $data['visibilidad'] ?? 'privado',
            'eliminado'    => false,
        ]);

        return response()->json([
            'message'   => 'Educación registrada correctamente',
            'educacion' => $educacion,
        ], 201);
    }

    /**
     * Muestra un registro de educación específico del usuario.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $educacion = Educacion::where('id_educacion', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->first();

        if (!$educacion) {
            return response()->json(['message' => 'Educación no encontrada'], 404);
        }

        return response()->json(['educacion' => $educacion]);
    }

    /**
     * Soft-delete de un registro de educación.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $educacion = Educacion::where('id_educacion', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->first();

        if (!$educacion) {
            return response()->json(['message' => 'Registro de educación no encontrado'], 404);
        }

        $educacion->update(['eliminado' => true]);

        return response()->json(['message' => 'Educación eliminada correctamente']);
    }
}