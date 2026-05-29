<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Perfil;
use App\Models\PerfilEnlace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        if ($request->filled('enlaces_personalizados_json')) {
            $decodedLinks = json_decode($request->input('enlaces_personalizados_json'), true);

            if (json_last_error() === JSON_ERROR_NONE && is_array($decodedLinks)) {
                $request->merge(['enlaces_personalizados' => $decodedLinks]);
            }
        }

        $data = $request->validate([
            'nombre_perfil'   => 'required|string|max:255',
            'apellido_perfil' => 'required|string|max:255',
            'profesion'       => 'required|string|max:150',
            'celular'         => 'required|string|max:20',
            'descripcion'     => 'required|string|max:1000',
            'foto_url'        => 'nullable|string|max:500',
            'foto_file'       => 'nullable|image|max:5120',
            'ciudad'          => 'nullable|string|max:100',
            'pais'            => 'nullable|string|max:100',
            'correo_contacto' => 'nullable|email|max:255',
            'enlaces_personalizados' => 'sometimes|array|max:8',
            'enlaces_personalizados.*.titulo' => 'required_with:enlaces_personalizados|string|max:80',
            'enlaces_personalizados.*.url' => 'required_with:enlaces_personalizados|url|max:500',
        ]);

        $fotoUrl = $data['foto_url'] ?? null;

        if ($request->hasFile('foto_file')) {
            $resultado = Cloudinary::upload($request->file('foto_file')->getRealPath(), [
                'folder' => 'portafolios/perfiles',
            ]);
            $fotoUrl = $resultado->getSecurePath();
        }

        $enlaces = $data['enlaces_personalizados'] ?? null;
        unset($data['foto_file'], $data['enlaces_personalizados']);

        try {
            $perfil = DB::transaction(function () use ($user, $data, $fotoUrl, $enlaces) {
                $perfil = Perfil::create([
                    'usuario_id'      => $user->id_usuario,
                    'nombre_perfil'   => $data['nombre_perfil'],
                    'apellido_perfil' => $data['apellido_perfil'],
                    'profesion'       => $data['profesion'],
                    'celular'         => $data['celular'],
                    'descripcion'     => $data['descripcion'],
                    'foto_url'        => $fotoUrl,
                    'ciudad'          => $data['ciudad'] ?? null,
                    'pais'            => $data['pais'] ?? null,
                    'correo_contacto' => $data['correo_contacto'] ?? null,
                    'eliminado'       => false,
                    'visibilidad'     => 'privado',
                ]);

                if (is_array($enlaces)) {
                    foreach (array_values($enlaces) as $index => $enlace) {
                        PerfilEnlace::create([
                            'perfil_id' => $perfil->id_perfil,
                            'titulo' => trim($enlace['titulo']),
                            'url' => trim($enlace['url']),
                            'orden' => $index,
                            'eliminado' => false,
                        ]);
                    }
                }

                return $perfil;
            });

            return response()->json([
                'message' => 'Perfil creado correctamente',
                'perfil'  => $perfil->load('enlacesPersonalizados'),
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
            'ciudad'          => 'sometimes|nullable|string|max:100',
            'pais'            => 'sometimes|nullable|string|max:100',
            'correo_contacto' => 'sometimes|nullable|email|max:255',
        ]);

        if ($request->hasFile('foto_file')) {
            $resultado = Cloudinary::upload($request->file('foto_file')->getRealPath(), [
                'folder' => 'portafolios/perfiles',
            ]);
            $data['foto_url'] = $resultado->getSecurePath();
        }

        unset($data['foto_file']);

        // Prevent modifying restricted fields if they are already set
        foreach (['nombre_perfil', 'apellido_perfil', 'profesion', 'pais'] as $restrictedField) {
            if (isset($data[$restrictedField]) && !empty($perfil->$restrictedField)) {
                unset($data[$restrictedField]);
            }
        }

        $perfil->update($data);

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'perfil'  => $perfil,
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        $perfil = Perfil::with('enlacesPersonalizados')->where('usuario_id', $user->id_usuario)->first();

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
