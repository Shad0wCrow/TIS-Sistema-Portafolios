<?php
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\Experiencia;
use App\Models\Empresa;
use Illuminate\Http\Request;
 
class ExperienciaController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
 
        $data = $request->validate([
            'nombre_empresa' => 'required|string|max:150',
            'puesto'         => 'required|string|max:150',
            'tipo'           => 'nullable|string|max:50',
            'descripcion'    => 'nullable|string',
            'fecha_inicio'   => 'required|date',
            'fecha_fin'      => 'nullable|date|after_or_equal:fecha_inicio',
            'es_actual'      => 'nullable|boolean',
            'ubicacion'      => 'nullable|string|max:150',
            'visibilidad'    => 'nullable|in:publico,privado',
        ]);
 
        $empresa = Empresa::firstOrCreate(
            ['nombre' => $data['nombre_empresa']],
            ['nombre' => $data['nombre_empresa']]
        );
 
        $experiencia = Experiencia::create([
            'usuario_id'   => $user->id_usuario,
            'empresa_id'   => $empresa->id_empresa,
            'puesto'       => $data['puesto'],
            'tipo'         => $data['tipo'] ?? null,
            'descripcion'  => $data['descripcion'] ?? null,
            'fecha_inicio' => $data['fecha_inicio'],
            'fecha_fin'    => $data['fecha_fin'] ?? null,
            'es_actual'    => $data['es_actual'] ?? false,
            'ubicacion'    => $data['ubicacion'] ?? null,
            'visibilidad'  => $data['visibilidad'] ?? 'privado',
            'eliminado'    => false,
        ]);
 
        return response()->json([
            'message'     => 'Experiencia laboral registrada correctamente',
            'experiencia' => $experiencia->load('empresa'),
        ], 201);
    }
 
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
 
        $experiencia = Experiencia::where('id_experiencia', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->first();
 
        if (!$experiencia) {
            return response()->json(['message' => 'Experiencia laboral no encontrada'], 404);
        }
 
        $experiencia->update(['eliminado' => true]);
 
        return response()->json(['message' => 'Experiencia laboral eliminada correctamente']);
    }

    public function sugerencias(Request $request)
{
    $q = $request->query('q', '');

    if (strlen(trim($q)) < 3) {
        return response()->json(['sugerencias' => []]);
    }

    $sugerencias = Empresa::where('nombre', 'like', '%' . $q . '%')
        ->orderBy('nombre')
        ->limit(8)
        ->pluck('nombre');

    return response()->json(['sugerencias' => $sugerencias]);
}

public function index(Request $request)
{
    $user = $request->user();

    $experiencias = Experiencia::with('empresa')
        ->where('usuario_id', $user->id_usuario)
        ->where('eliminado', false)
        ->orderByDesc('fecha_inicio')
        ->get()
        ->map(function ($experiencia) {
            return [
                'id_experiencia' => $experiencia->id_experiencia,
                'nombre_empresa' => $experiencia->empresa->nombre ?? null,
                'puesto' => $experiencia->puesto,
                'tipo' => $experiencia->tipo,
                'descripcion' => $experiencia->descripcion,
                'fecha_inicio' => $experiencia->fecha_inicio,
                'fecha_fin' => $experiencia->fecha_fin,
                'es_actual' => $experiencia->es_actual,
                'ubicacion' => $experiencia->ubicacion,
                'visibilidad' => $experiencia->visibilidad,
            ];
        });

    return response()->json(['experiencias' => $experiencias]);
}

public function show(Request $request, $id)
{
    $user = $request->user();

    $experiencia = Experiencia::with('empresa')
        ->where('id_experiencia', $id)
        ->where('usuario_id', $user->id_usuario)
        ->where('eliminado', false)
        ->first();

    if (!$experiencia) {
        return response()->json(['message' => 'Experiencia no encontrada'], 404);
    }

    return response()->json([
        'experiencia' => [
            'id_experiencia' => $experiencia->id_experiencia,
            'nombre_empresa' => $experiencia->empresa->nombre ?? null,
            'puesto' => $experiencia->puesto,
            'tipo' => $experiencia->tipo,
            'descripcion' => $experiencia->descripcion,
            'fecha_inicio' => $experiencia->fecha_inicio,
            'fecha_fin' => $experiencia->fecha_fin,
            'es_actual' => $experiencia->es_actual,
            'ubicacion' => $experiencia->ubicacion,
            'visibilidad' => $experiencia->visibilidad,
        ],
    ]);
}

public function update(Request $request, $id)
{
    $user = $request->user();

    $experiencia = Experiencia::where('id_experiencia', $id)
        ->where('usuario_id', $user->id_usuario)
        ->where('eliminado', false)
        ->first();

    if (!$experiencia) {
        return response()->json(['message' => 'Experiencia no encontrada'], 404);
    }

    $data = $request->validate([
        'nombre_empresa' => 'required|string|max:150',
        'puesto'         => 'required|string|max:150',
        'tipo'           => 'nullable|string|max:50',
        'descripcion'    => 'nullable|string',
        'fecha_inicio'   => 'required|date',
        'fecha_fin'      => 'nullable|date|after_or_equal:fecha_inicio',
        'es_actual'      => 'nullable|boolean',
        'ubicacion'      => 'nullable|string|max:150',
        'visibilidad'    => 'nullable|in:publico,privado',
    ]);

    $empresa = Empresa::firstOrCreate(
        ['nombre' => $data['nombre_empresa']],
        ['nombre' => $data['nombre_empresa']]
    );

    $experiencia->update([
        'empresa_id'   => $empresa->id_empresa,
        'puesto'       => $data['puesto'],
        'tipo'         => $data['tipo'] ?? null,
        'descripcion'  => $data['descripcion'] ?? null,
        'fecha_inicio' => $data['fecha_inicio'],
        'fecha_fin'    => $data['fecha_fin'] ?? null,
        'es_actual'    => $data['es_actual'] ?? false,
        'ubicacion'    => $data['ubicacion'] ?? null,
        'visibilidad'  => $data['visibilidad'] ?? 'privado',
    ]);

    return response()->json([
        'message'     => 'Experiencia actualizada correctamente',
        'experiencia' => $experiencia->load('empresa'),
    ]);
}
}
