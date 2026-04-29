<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Educacion;
use Illuminate\Http\Request;

class CursoController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $cursos = Educacion::where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->where('area_estudio', Educacion::TIPO_CURSO)
            ->orderByDesc('fecha_inicio')
            ->get();

        return response()->json(['cursos' => $cursos]);
    }

    public function sugerencias(Request $request)
    {
        $q = $request->query('q', '');

        if (strlen(trim($q)) < 3) {
            return response()->json(['sugerencias' => []]);
        }

        $sugerencias = Educacion::where('eliminado', false)
            ->where('area_estudio', Educacion::TIPO_CURSO)
            ->where('institucion', 'like', '%' . $q . '%')
            ->distinct()
            ->orderBy('institucion')
            ->limit(8)
            ->pluck('institucion');

        return response()->json(['sugerencias' => $sugerencias]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'nombre_curso' => 'required|string|max:150',
            'institucion'  => 'required|string|max:150',
            'fecha_inicio' => 'required|date',
            'fecha_fin'    => 'nullable|date|after_or_equal:fecha_inicio',
            'es_actual'    => 'nullable|boolean',
            'descripcion'  => 'nullable|string',
            'visibilidad'  => 'nullable|in:publico,privado',
        ]);

        $esActual = filter_var($data['es_actual'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if (!$esActual && isset($data['fecha_fin']) && $data['fecha_fin'] > now()->toDateString()) {
            return response()->json([
                'message' => 'La fecha de finalización no puede ser futura si el curso no está en curso.',
                'errors'  => ['fecha_fin' => ['La fecha de finalización no puede ser futura si el curso no está en curso.']],
            ], 422);
        }

        $curso = Educacion::create([
            'usuario_id'   => $user->id_usuario,
            'institucion'  => $data['institucion'],
            'titulo'       => $data['nombre_curso'],
            'area_estudio' => Educacion::TIPO_CURSO,
            'fecha_inicio' => $data['fecha_inicio'],
            'fecha_fin'    => $esActual ? null : ($data['fecha_fin'] ?? null),
            'descripcion'  => $data['descripcion'] ?? null,
            'visibilidad'  => $data['visibilidad'] ?? 'privado',
            'eliminado'    => false,
        ]);

        return response()->json([
            'message' => 'Curso registrado correctamente',
            'curso'   => $curso,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();

        $curso = Educacion::where('id_educacion', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->where('area_estudio', Educacion::TIPO_CURSO)
            ->first();

        if (!$curso) {
            return response()->json(['message' => 'Curso no encontrado'], 404);
        }

        return response()->json(['curso' => $curso]);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();

        $curso = Educacion::where('id_educacion', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->where('area_estudio', Educacion::TIPO_CURSO)
            ->first();

        if (!$curso) {
            return response()->json(['message' => 'Curso no encontrado'], 404);
        }

        $data = $request->validate([
            'nombre_curso' => 'sometimes|string|max:150',
            'institucion'  => 'sometimes|string|max:150',
            'fecha_inicio' => 'sometimes|date',
            'fecha_fin'    => 'sometimes|nullable|date|after_or_equal:fecha_inicio',
            'es_actual'    => 'sometimes|boolean',
            'descripcion'  => 'sometimes|nullable|string',
            'visibilidad'  => 'sometimes|in:publico,privado',
        ]);

        if (isset($data['nombre_curso'])) {
            $data['titulo'] = $data['nombre_curso'];
            unset($data['nombre_curso']);
        }

        if (isset($data['es_actual']) && $data['es_actual']) {
            $data['fecha_fin'] = null;
        }
        unset($data['es_actual']);

        $curso->update($data);

        return response()->json([
            'message' => 'Curso actualizado correctamente',
            'curso'   => $curso,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $curso = Educacion::where('id_educacion', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('area_estudio', Educacion::TIPO_CURSO)
            ->where('eliminado', false)
            ->first();

        if (!$curso) {
            return response()->json(['message' => 'Curso no encontrado'], 404);
        }

        $curso->update(['eliminado' => true]);

        return response()->json(['message' => 'Curso eliminado correctamente']);
    }
}