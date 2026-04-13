<?php
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\Educacion;
use Illuminate\Http\Request;
 
class EducacionController extends Controller
{
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