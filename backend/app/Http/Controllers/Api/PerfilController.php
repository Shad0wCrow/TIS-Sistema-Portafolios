<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Perfil;
use Illuminate\Http\Request;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class PerfilController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $existingPerfil = Perfil::where('usuario_id', $user->id_usuario)->first();

        if ($existingPerfil) {
            return response()->json(['message' => 'El perfil ya existe'], 400);
        }

        $data = $request->validate([
            'nombre_perfil'   => 'required|string|max:255',
            'apellido_perfil' => 'required|string|max:255',
            'profesion'       => 'required|string|max:150',
            'celular'         => 'required|string|max:20',
            'descripcion'     => 'required|string|max:1000',
            'foto_url'        => 'nullable|string|max:500',
            'foto_file'       => 'nullable|image|max:5120',
        ]);

        $fotoUrl = $data['foto_url'] ?? null;

        if ($request->hasFile('foto_file')) {
            $resultado = Cloudinary::upload($request->file('foto_file')->getRealPath(), [
                'folder' => 'portafolios/perfiles',
            ]);
            $fotoUrl = $resultado->getSecurePath();
        }

        try {
            $perfil = Perfil::create([
                'usuario_id'      => $user->id_usuario,
                'nombre_perfil'   => $data['nombre_perfil'],
                'apellido_perfil' => $data['apellido_perfil'],
                'profesion'       => $data['profesion'],
                'celular'         => $data['celular'],
                'descripcion'     => $data['descripcion'],
                'foto_url'        => $fotoUrl,
                'eliminado'       => false,
                'visibilidad'     => 'privado',
            ]);

            return response()->json([
                'message' => 'Perfil creado correctamente',
                'perfil'  => $perfil,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    }

    public function update(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $perfil = Perfil::where('usuario_id', $user->id_usuario)->firstOrFail();

        $data = $request->validate([
            'nombre_perfil'   => 'sometimes|string|max:255',
            'apellido_perfil' => 'sometimes|string|max:255',
            'profesion'       => 'sometimes|string|max:150',
            'celular'         => 'sometimes|string|max:20',
            'descripcion'     => 'sometimes|string|max:1000',
            'foto_url'        => 'nullable|string|max:500',
            'foto_file'       => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('foto_file')) {
            $resultado = Cloudinary::upload($request->file('foto_file')->getRealPath(), [
                'folder' => 'portafolios/perfiles',
            ]);
            $data['foto_url'] = $resultado->getSecurePath();
        }

        unset($data['foto_file']);

        $perfil->update($data);

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'perfil'  => $perfil,
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        $perfil = Perfil::where('usuario_id', $user->id_usuario)->first();

        return response()->json([
            'has_profile' => $perfil ? true : false,
            'perfil'      => $perfil,
        ]);
    }

    public function sugerenciasProfecion(Request $request)
    {
        $q = $request->query('q', '');

        if (strlen(trim($q)) < 2) {
            return response()->json(['sugerencias' => []]);
        }

        $sugerencias = Perfil::where('eliminado', false)
            ->where('profesion', 'like', '%' . $q . '%')
            ->distinct()
            ->orderBy('profesion')
            ->limit(8)
            ->pluck('profesion');

        return response()->json(['sugerencias' => $sugerencias]);
    }
}