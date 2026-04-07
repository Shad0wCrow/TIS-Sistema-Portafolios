<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proyecto;
use Illuminate\Http\Request;


class ProyectoController extends Controller
{

    public function index(Request $request)
    {
        $user = $request->user();

        $proyectos = Proyecto::where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->orderBy('creado_en', 'desc')
            ->get();

        return response()->json([
            'proyectos' => $proyectos,
        ]);
    }


    public function show(Request $request, $id)
    {
        $user = $request->user();

        $proyecto = Proyecto::where('id_proyecto', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->first();

        if (!$proyecto) {
            return response()->json(['message' => 'Proyecto no encontrado'], 404);
        }

        return response()->json(['proyecto' => $proyecto]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'titulo'               => 'required|string|max:255',
            'descripcion'          => 'nullable|string',
            'fecha_inicio'         => 'nullable|date',
            'fecha_fin'            => 'nullable|date|after_or_equal:fecha_inicio',
            'estado'               => 'nullable|in:en_progreso,finalizado,pausado',
            'repositorio_url'      => 'nullable|string|max:500',
            'demo_url'             => 'nullable|string|max:500',
            'imagen_principal_url' => 'nullable|string|max:500',
            'visibilidad'          => 'nullable|in:publico,privado',
            'categoria_id'         => 'nullable|integer|exists:categoria_proyecto,id_categoria',
        ]);

        try {
            $proyecto = Proyecto::create([
                'usuario_id'           => $user->id_usuario,
                'categoria_id'         => $data['categoria_id'] ?? null,
                'titulo'               => $data['titulo'],
                'descripcion'          => $data['descripcion'] ?? null,
                'fecha_inicio'         => $data['fecha_inicio'] ?? null,
                'fecha_fin'            => $data['fecha_fin'] ?? null,
                'estado'               => $data['estado'] ?? 'en_progreso',
                'repositorio_url'      => $data['repositorio_url'] ?? null,
                'demo_url'             => $data['demo_url'] ?? null,
                'imagen_principal_url' => $data['imagen_principal_url'] ?? null,
                'visibilidad'          => $data['visibilidad'] ?? 'publico',
                'eliminado'            => false,
            ]);

            return response()->json([
                'message'  => 'Proyecto creado correctamente',
                'proyecto' => $proyecto,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();

        $proyecto = Proyecto::where('id_proyecto', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->first();

        if (!$proyecto) {
            return response()->json(['message' => 'Proyecto no encontrado'], 404);
        }

        $data = $request->validate([
            'titulo'               => 'sometimes|string|max:255',
            'descripcion'          => 'sometimes|nullable|string',
            'fecha_inicio'         => 'sometimes|nullable|date',
            'fecha_fin'            => 'sometimes|nullable|date',
            'estado'               => 'sometimes|in:en_progreso,finalizado,pausado',
            'repositorio_url'      => 'sometimes|nullable|string|max:500',
            'demo_url'             => 'sometimes|nullable|string|max:500',
            'imagen_principal_url' => 'sometimes|nullable|string|max:500',
            'visibilidad'          => 'sometimes|in:publico,privado',
            'categoria_id'         => 'sometimes|nullable|integer|exists:categoria_proyecto,id_categoria',
        ]);

        $proyecto->update($data);

        return response()->json([
            'message'  => 'Proyecto actualizado correctamente',
            'proyecto' => $proyecto,
        ]);
    }

    //soft delete
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $proyecto = Proyecto::where('id_proyecto', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->first();

        if (!$proyecto) {
            return response()->json(['message' => 'Proyecto no encontrado'], 404);
        }

        $proyecto->update(['eliminado' => true]);

        return response()->json([
            'message' => 'Proyecto eliminado correctamente',
        ]);
    }
}
