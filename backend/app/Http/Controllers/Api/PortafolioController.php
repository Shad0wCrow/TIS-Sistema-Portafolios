<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Perfil;
use App\Models\UsuarioHabilidad;
use App\Models\Proyecto;
use App\Models\ProyectoUsuario;
use Illuminate\Http\Request;

/**
 * PortafolioController
 *
 * Maneja la pantalla "Edición de Portafolio".
 * Agrupa en un solo endpoint los datos que muestra esa vista:
 *   - Datos del perfil (foto, nombre, profesión, teléfono, descripción)
 *   - Habilidades técnicas y blandas del usuario
 *   - Proyectos del usuario con sus roles
 *
 * Rutas (todas bajo auth:sanctum):
 *   GET  /portafolio          → show()           ver portafolio completo
 *   PUT  /portafolio/perfil   → updatePerfil()   editar sección perfil
 *   POST /portafolio/habilidades         → addHabilidad()
 *   DELETE /portafolio/habilidades/{id}  → removeHabilidad()
 *   POST /portafolio/proyectos           → addProyecto()
 *   PUT  /portafolio/proyectos/{id}      → updateProyecto()
 *   DELETE /portafolio/proyectos/{id}    → removeProyecto()
 */
class PortafolioController extends Controller
{
    // ──────────────────────────────────────────────────────────────────
    // GET /portafolio
    // Devuelve TODO lo que necesita la pantalla de edición en un solo
    // llamado: perfil + habilidades (por tipo) + proyectos con roles.
    // ──────────────────────────────────────────────────────────────────
    public function show(Request $request)
    {
        $user = $request->user();

        // 1. Datos del perfil
        $perfil = Perfil::where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->first();

        // 2. Habilidades separadas por tipo (tecnica / blanda)
        $todasHabilidades = UsuarioHabilidad::with('habilidad')
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->get();

        $habilidadesTecnicas = $todasHabilidades
            ->filter(fn($uh) => $uh->habilidad && $uh->habilidad->tipo === 'tecnica')
            ->values()
            ->map(fn($uh) => [
                'id_usuario_habilidad' => $uh->id_usuario_habilidad,
                'nombre'               => $uh->habilidad->nombre,
                'nivel'                => $uh->nivel,
            ]);

        $habilidadesBlandas = $todasHabilidades
            ->filter(fn($uh) => $uh->habilidad && $uh->habilidad->tipo === 'blanda')
            ->values()
            ->map(fn($uh) => [
                'id_usuario_habilidad' => $uh->id_usuario_habilidad,
                'nombre'               => $uh->habilidad->nombre,
                'nivel'                => $uh->nivel,
            ]);

        // 3. Proyectos con roles del usuario en cada uno
        $proyectos = Proyecto::where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->orderBy('creado_en', 'desc')
            ->get()
            ->map(function ($proyecto) use ($user) {
                // Roles que el usuario tiene en este proyecto
                $roles = ProyectoUsuario::where('proyecto_id', $proyecto->id_proyecto)
                    ->where('usuario_id', $user->id_usuario)
                    ->pluck('rol_proyecto')
                    ->filter()
                    ->values();

                return [
                    'id_proyecto'   => $proyecto->id_proyecto,
                    'titulo'        => $proyecto->titulo,
                    'descripcion'   => $proyecto->descripcion,
                    'fecha_inicio'  => $proyecto->fecha_inicio,
                    'fecha_fin'     => $proyecto->fecha_fin,
                    'demo_url'      => $proyecto->demo_url,
                    'repositorio_url' => $proyecto->repositorio_url,
                    'imagen_principal_url' => $proyecto->imagen_principal_url,
                    'estado'        => $proyecto->estado,
                    'roles'         => $roles,   // ["Desarrollador", "Diseñador", ...]
                ];
            });

        return response()->json([
            'perfil'                => $perfil,
            'habilidades_tecnicas'  => $habilidadesTecnicas,
            'habilidades_blandas'   => $habilidadesBlandas,
            'proyectos'             => $proyectos,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────
    // PUT /portafolio/perfil
    // Edita los datos del perfil visibles en la pantalla:
    //   foto, nombre, apellido, profesión, celular, descripción (max 200)
    // ──────────────────────────────────────────────────────────────────
    public function updatePerfil(Request $request)
    {
        $user = $request->user();

        $perfil = Perfil::where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->firstOrFail();

        $data = $request->validate([
            'nombre_perfil'   => 'sometimes|string|max:255',
            'apellido_perfil' => 'sometimes|string|max:255',
            'profesion'       => 'sometimes|string|max:150',
            'celular'         => 'sometimes|string|max:20',
            // La pantalla muestra max 200 caracteres para la descripción
            'descripcion'     => 'sometimes|string|max:200',
            'foto_url'        => 'sometimes|nullable|string|max:500',
        ]);

        $perfil->update($data);

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'perfil'  => $perfil,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────
    // POST /portafolio/habilidades
    // Agrega una habilidad (técnica o blanda) al portafolio.
    //
    // Body:
    // {
    //   "habilidad_id": 5,
    //   "nivel": "intermedio"   // opcional
    // }
    // ──────────────────────────────────────────────────────────────────
    public function addHabilidad(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'habilidad_id' => 'required|integer|exists:habilidad,id_habilidad',
            'nivel'        => 'nullable|in:basico,intermedio,avanzado,experto',
        ]);

        // Evitar duplicados
        $existe = UsuarioHabilidad::where('usuario_id', $user->id_usuario)
            ->where('habilidad_id', $data['habilidad_id'])
            ->where('eliminado', false)
            ->exists();

        if ($existe) {
            return response()->json(['message' => 'Ya tienes esta habilidad'], 400);
        }

        try {
            $uh = UsuarioHabilidad::create([
                'usuario_id'   => $user->id_usuario,
                'habilidad_id' => $data['habilidad_id'],
                'nivel'        => $data['nivel'] ?? null,
                'visibilidad'  => 'privado',
                'eliminado'    => false,
            ]);

            return response()->json([
                'message'   => 'Habilidad agregada',
                'habilidad' => $uh->load('habilidad'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ──────────────────────────────────────────────────────────────────
    // DELETE /portafolio/habilidades/{id}
    // Elimina (soft-delete) una habilidad del portafolio.
    // {id} = id_usuario_habilidad
    // ──────────────────────────────────────────────────────────────────
    public function removeHabilidad(Request $request, $id)
    {
        $user = $request->user();

        $uh = UsuarioHabilidad::where('id_usuario_habilidad', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->first();

        if (!$uh) {
            return response()->json(['message' => 'Habilidad no encontrada'], 404);
        }

        $uh->update(['eliminado' => true]);

        return response()->json(['message' => 'Habilidad eliminada']);
    }

    // ──────────────────────────────────────────────────────────────────
    // POST /portafolio/proyectos
    // Crea un proyecto nuevo. También registra los roles del usuario
    // en proyecto_usuario.
    //
    // Body:
    // {
    //   "titulo": "Proyecto ECOMODA",
    //   "descripcion": "...",
    //   "fecha_inicio": "2024-01-01",
    //   "fecha_fin": "2024-06-01",
    //   "demo_url": "https://...",
    //   "roles": ["Desarrollador", "Diseñador"]   // array de strings
    // }
    // ──────────────────────────────────────────────────────────────────
    public function addProyecto(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'titulo'       => 'required|string|max:255',
            'descripcion'  => 'nullable|string',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin'    => 'nullable|date',
            'demo_url'     => 'nullable|string|max:500',
            'repositorio_url'      => 'nullable|string|max:500',
            'imagen_principal_url' => 'nullable|string|max:500',
            // roles es un array de strings; cada rol max 50 chars
            'roles'        => 'nullable|array',
            'roles.*'      => 'string|max:50',
        ]);

        try {
            $proyecto = Proyecto::create([
                'usuario_id'           => $user->id_usuario,
                'titulo'               => $data['titulo'],
                'descripcion'          => $data['descripcion'] ?? null,
                'fecha_inicio'         => $data['fecha_inicio'] ?? null,
                'fecha_fin'            => $data['fecha_fin'] ?? null,
                'demo_url'             => $data['demo_url'] ?? null,
                'repositorio_url'      => $data['repositorio_url'] ?? null,
                'imagen_principal_url' => $data['imagen_principal_url'] ?? null,
                'estado'               => 'en_progreso',
                'visibilidad'          => 'publico',
                'eliminado'            => false,
            ]);

            // Registrar cada rol en proyecto_usuario
            if (!empty($data['roles'])) {
                foreach ($data['roles'] as $rol) {
                    ProyectoUsuario::create([
                        'usuario_id'    => $user->id_usuario,
                        'proyecto_id'   => $proyecto->id_proyecto,
                        'rol_proyecto'  => $rol,
                        'es_propietario' => true,
                    ]);
                }
            } else {
                // Si no se especifican roles, registrar como propietario sin rol
                ProyectoUsuario::create([
                    'usuario_id'     => $user->id_usuario,
                    'proyecto_id'    => $proyecto->id_proyecto,
                    'rol_proyecto'   => null,
                    'es_propietario' => true,
                ]);
            }

            // Devolver el proyecto con sus roles formateados igual que show()
            $roles = ProyectoUsuario::where('proyecto_id', $proyecto->id_proyecto)
                ->where('usuario_id', $user->id_usuario)
                ->pluck('rol_proyecto')
                ->filter()
                ->values();

            return response()->json([
                'message'  => 'Proyecto creado correctamente',
                'proyecto' => array_merge($proyecto->toArray(), ['roles' => $roles]),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ──────────────────────────────────────────────────────────────────
    // PUT /portafolio/proyectos/{id}
    // Edita un proyecto. Si se envían roles, reemplaza los existentes.
    // ──────────────────────────────────────────────────────────────────
    public function updateProyecto(Request $request, $id)
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
            'demo_url'             => 'sometimes|nullable|string|max:500',
            'repositorio_url'      => 'sometimes|nullable|string|max:500',
            'imagen_principal_url' => 'sometimes|nullable|string|max:500',
            'estado'               => 'sometimes|in:en_progreso,finalizado,pausado',
            'roles'                => 'sometimes|array',
            'roles.*'              => 'string|max:50',
        ]);

        // Actualizar campos del proyecto (sin 'roles')
        $proyecto->update(collect($data)->except('roles')->toArray());

        // Si se enviaron roles, reemplazar todos los registros en proyecto_usuario
        if (isset($data['roles'])) {
            // Borrar roles anteriores del usuario en este proyecto
            ProyectoUsuario::where('proyecto_id', $proyecto->id_proyecto)
                ->where('usuario_id', $user->id_usuario)
                ->delete();

            foreach ($data['roles'] as $rol) {
                ProyectoUsuario::create([
                    'usuario_id'     => $user->id_usuario,
                    'proyecto_id'    => $proyecto->id_proyecto,
                    'rol_proyecto'   => $rol,
                    'es_propietario' => true,
                ]);
            }
        }

        $roles = ProyectoUsuario::where('proyecto_id', $proyecto->id_proyecto)
            ->where('usuario_id', $user->id_usuario)
            ->pluck('rol_proyecto')
            ->filter()
            ->values();

        return response()->json([
            'message'  => 'Proyecto actualizado correctamente',
            'proyecto' => array_merge($proyecto->fresh()->toArray(), ['roles' => $roles]),
        ]);
    }

    // ──────────────────────────────────────────────────────────────────
    // DELETE /portafolio/proyectos/{id}
    // Soft-delete del proyecto.
    // ──────────────────────────────────────────────────────────────────
    public function removeProyecto(Request $request, $id)
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

        return response()->json(['message' => 'Proyecto eliminado correctamente']);
    }
}