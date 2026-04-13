<?php
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\Educacion;
use Illuminate\Http\Request;
 
class CursoController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
 
        $data = $request->validate([
            'nombre_curso'  => 'required|string|max:150',
            'institucion'   => 'required|string|max:150',
            'fecha_inicio'  => 'required|date',
            'fecha_fin'     => 'nullable|date|after_or_equal:fecha_inicio',
            'es_actual'     => 'nullable|boolean',
            'descripcion'   => 'nullable|string',
            'visibilidad'   => 'nullable|in:publico,privado',
        ]);
 
        $esCursoActual = $data['es_actual'] ?? false;
 
        if (!$esCursoActual && isset($data['fecha_fin']) && $data['fecha_fin'] > now()->toDateString()) {
            return response()->json([
                'message' => 'La fecha de finalización no puede ser futura si el curso no está marcado como en curso',
            ], 422);
        }
 
        $educacion = Educacion::create([
            'usuario_id'   => $user->id_usuario,
            'institucion'  => $data['institucion'],
            'titulo'       => $data['nombre_curso'],
            'area_estudio' => 'curso',
            'fecha_inicio' => $data['fecha_inicio'],
            'fecha_fin'    => $esCursoActual ? null : ($data['fecha_fin'] ?? null),
            'descripcion'  => $data['descripcion'] ?? null,
            'visibilidad'  => $data['visibilidad'] ?? 'privado',
            'eliminado'    => false,
        ]);
 
        return response()->json([
            'message' => 'Curso registrado correctamente',
            'curso'   => $educacion,
        ], 201);
    }
 
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
 
        $curso = Educacion::where('id_educacion', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('area_estudio', 'curso')
            ->where('eliminado', false)
            ->first();
 
        if (!$curso) {
            return response()->json(['message' => 'Curso no encontrado'], 404);
        }
 
        $curso->update(['eliminado' => true]);
 
        return response()->json(['message' => 'Curso eliminado correctamente']);
    }

    public function index(Request $request)
{
    $user = $request->user();

    $cursos = Educacion::where('usuario_id', $user->id_usuario)
        ->where('eliminado', false)
        ->where('area_estudio', 'curso')
        ->orderByDesc('fecha_inicio')
        ->get();

    return response()->json(['cursos' => $cursos]);
}

public function show(Request $request, $id)
{
    $user = $request->user();

    $curso = Educacion::where('id_educacion', $id)
        ->where('usuario_id', $user->id_usuario)
        ->where('eliminado', false)
        ->where('area_estudio', 'curso')
        ->first();

    if (!$curso) {
        return response()->json(['message' => 'Curso no encontrado'], 404);
    }

    return response()->json(['curso' => $curso]);
}
}