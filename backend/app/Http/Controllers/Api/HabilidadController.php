<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Habilidad;
use App\Models\UsuarioHabilidad;
use Illuminate\Http\Request;

class HabilidadController extends Controller
{
    
     //Lista todas las habilidades disponibles en el catálogo global.
     
    public function catalogo()
    {
        $habilidades = Habilidad::orderBy('nombre')->get();

        return response()->json([
            'habilidades' => $habilidades,
        ]);
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $habilidades = UsuarioHabilidad::with('habilidad')
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->get();

        return response()->json([
            'habilidades' => $habilidades,
        ]);
    }

 
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $usuarioHabilidad = UsuarioHabilidad::with('habilidad')
            ->where('id_usuario_habilidad', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->first();

        if (!$usuarioHabilidad) {
            return response()->json(['message' => 'Habilidad no encontrada'], 404);
        }

        return response()->json(['habilidad' => $usuarioHabilidad]);
    }


    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'habilidad_id'     => 'required|integer|exists:habilidad,id_habilidad',
            'nivel'            => 'required|in:basico,intermedio,avanzado,experto',
            'anos_experiencia' => 'nullable|integer|min:0',
            'categoria'        => 'nullable|string|max:50',
            'destacado'        => 'nullable|string|max:100',
            'visibilidad'      => 'nullable|in:publico,privado',
        ]);

        // Verificar que el usuario no tenga ya esa habilidad
        $existe = UsuarioHabilidad::where('usuario_id', $user->id_usuario)
            ->where('habilidad_id', $data['habilidad_id'])
            ->where('eliminado', false)
            ->first();

        if ($existe) {
            return response()->json([
                'message' => 'Ya tienes esta habilidad agregada',
            ], 400);
        }
        

        try {
            $usuarioHabilidad = UsuarioHabilidad::create([
                'usuario_id'       => $user->id_usuario,
                'habilidad_id'     => $data['habilidad_id'],
                'nivel'            => $data['nivel'],
                'anos_experiencia' => $data['anos_experiencia'] ?? null,
                'categoria'        => $data['categoria'] ?? null,
                'destacado'        => $data['destacado'] ?? null,
                'visibilidad'      => $data['visibilidad'] ?? 'privado',
                'eliminado'        => false,
            ]);

            return response()->json([
                'message'   => 'Habilidad agregada correctamente',
                'habilidad' => $usuarioHabilidad->load('habilidad'),
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

        $usuarioHabilidad = UsuarioHabilidad::where('id_usuario_habilidad', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->first();

        if (!$usuarioHabilidad) {
            return response()->json(['message' => 'Habilidad no encontrada'], 404);
        }

        $data = $request->validate([
            'nivel'            => 'sometimes|in:basico,intermedio,avanzado,experto',
            'anos_experiencia' => 'sometimes|nullable|integer|min:0',
            'categoria'        => 'sometimes|nullable|string|max:50',
            'destacado'        => 'sometimes|nullable|string|max:100',
            'visibilidad'      => 'sometimes|in:publico,privado',
        ]);

        $usuarioHabilidad->update($data);

        return response()->json([
            'message'   => 'Habilidad actualizada correctamente',
            'habilidad' => $usuarioHabilidad->load('habilidad'),
        ]);
    }

    //Soft delete
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $usuarioHabilidad = UsuarioHabilidad::where('id_usuario_habilidad', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->first();

        if (!$usuarioHabilidad) {
            return response()->json(['message' => 'Habilidad no encontrada'], 404);
        }

        $usuarioHabilidad->update(['eliminado' => true]);

        return response()->json([
            'message' => 'Habilidad eliminada correctamente',
        ]);
    }
}