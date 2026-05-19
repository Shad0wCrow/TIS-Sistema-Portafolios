<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Educacion;
use Illuminate\Http\Request;

class EducacionController extends Controller
{
    // Valores válidos del ENUM grado_educacion (HU-8)
    private const GRADOS_VALIDOS = [
        'titulo_bachiller',
        'tecnico_medio',
        'titulo_superior',
        'licenciado',
        'especialidad',
        'maestria',
        'doctorado',
        'post_doctorado',
    ];

    /**
     * Lista todas las formaciones académicas del usuario autenticado.
     * Excluye cursos (area_estudio = 'curso'), que tienen su propio endpoint.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $educaciones = Educacion::where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->where('area_estudio', '!=', 'curso')
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
            ->where('area_estudio', '!=', 'curso')
            ->where('institucion', 'like', '%' . $q . '%')
            ->distinct()
            ->orderBy('institucion')
            ->limit(8)
            ->pluck('institucion');

        return response()->json(['sugerencias' => $sugerencias]);
    }

    /**
     * Registra un nuevo grado de formación para el usuario autenticado.
     * HU-8: el campo "grado" es obligatorio y debe ser uno de los valores del ENUM.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'institucion'  => 'required|string|max:150',
            'titulo'       => 'required|string|max:150',
            'area_estudio' => 'nullable|string|max:150',
            'grado'        => 'required|in:' . implode(',', self::GRADOS_VALIDOS),
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
            'grado'        => $data['grado'],
            'fecha_inicio' => $data['fecha_inicio'],
            'fecha_fin'    => $data['fecha_fin'] ?? null,
            'descripcion'  => $data['descripcion'] ?? null,
            'visibilidad'  => $data['visibilidad'] ?? 'privado',
            'eliminado'    => false,
        ]);

        return response()->json([
            'message'   => 'Grado de formación registrado correctamente',
            'educacion' => $educacion,
        ], 201);
    }

    /**
     * Muestra un registro de formación académica específico del usuario.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $educacion = Educacion::where('id_educacion', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->first();

        if (!$educacion) {
            return response()->json(['message' => 'Registro de formación no encontrado'], 404);
        }

        return response()->json(['educacion' => $educacion]);
    }

    /**
     * Actualiza un registro de formación académica existente.
     * HU-8: el campo "grado" es obligatorio también en la edición.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();

        $educacion = Educacion::where('id_educacion', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->first();

        if (!$educacion) {
            return response()->json(['message' => 'Registro de formación no encontrado'], 404);
        }

        $data = $request->validate([
            'institucion'  => 'sometimes|required|string|max:150',
            'titulo'       => 'sometimes|required|string|max:150',
            'area_estudio' => 'nullable|string|max:150',
            'grado'        => 'sometimes|required|in:' . implode(',', self::GRADOS_VALIDOS),
            'fecha_inicio' => 'sometimes|required|date',
            'fecha_fin'    => 'nullable|date|after_or_equal:fecha_inicio',
            'descripcion'  => 'nullable|string',
            'visibilidad'  => 'nullable|in:publico,privado',
        ]);

        $educacion->update($data);

        return response()->json([
            'message'   => 'Grado de formación actualizado correctamente',
            'educacion' => $educacion->fresh(),
        ]);
    }

    /**
     * Soft-delete de un registro de formación académica.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $educacion = Educacion::where('id_educacion', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->first();

        if (!$educacion) {
            return response()->json(['message' => 'Registro de formación no encontrado'], 404);
        }

        $educacion->update(['eliminado' => true]);

        return response()->json(['message' => 'Registro de formación eliminado correctamente']);
    }
}