<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Habilidad;
use App\Models\UsuarioHabilidad;
use Illuminate\Http\Request;

/**
 * HabilidadController
 *
 * Gestiona las habilidades del usuario autenticado.
 * La tabla `habilidad` es un catálogo global; la relación
 * usuario-habilidad vive en `usuario_habilidad`.
 *
 * Rutas sugeridas (todas bajo auth:sanctum):
 *   GET    /habilidades              → index()   (mis habilidades)
 *   POST   /habilidades              → store()   (agregar habilidad a mi perfil)
 *   GET    /habilidades/{id}         → show()    (detalle de una de mis habilidades)
 *   PUT    /habilidades/{id}         → update()  (editar nivel/visibilidad, etc.)
 *   DELETE /habilidades/{id}         → destroy() (soft-delete de mi habilidad)
 *
 *   GET    /catalogo/habilidades     → catalogo() (ver todas las habilidades del catálogo)
 */
class HabilidadController extends Controller
{
    // ─────────────────────────────────────────────────────────────
    // CATÁLOGO GLOBAL
    // ─────────────────────────────────────────────────────────────

    /**
     * Lista todas las habilidades disponibles en el catálogo global.
     * Útil para que el frontend muestre un selector al agregar una habilidad.
     */
    public function catalogo()
    {
        $habilidades = Habilidad::orderBy('nombre')->get();

        return response()->json([
            'habilidades' => $habilidades,
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // CRUD DE MIS HABILIDADES (usuario_habilidad)
    // ─────────────────────────────────────────────────────────────

    /**
     * GET /habilidades
     * Devuelve todas las habilidades activas del usuario autenticado,
     * incluyendo los datos del catálogo (nombre, tipo, descripción).
     */
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

    /**
     * GET /habilidades/{id}
     * Devuelve el detalle de UNA habilidad del usuario.
     * El {id} es el id_usuario_habilidad (no el id_habilidad del catálogo).
     */
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

    /**
     * POST /habilidades
     * Agrega una habilidad del catálogo al perfil del usuario.
     *
     * Body esperado:
     * {
     *   "habilidad_id": 3,
     *   "nivel": "intermedio",       // basico | intermedio | avanzado | experto
     *   "anos_experiencia": 2,
     *   "categoria": "Backend",
     *   "destacado": "Mi habilidad estrella",
     *   "visibilidad": "privado"     // publico | privado
     * }
     */
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

        // Verificar que el usuario no tenga ya esa habilidad (índice UNIQUE)
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

    /**
     * PUT /habilidades/{id}
     * Actualiza los datos de una habilidad del usuario.
     * El {id} es el id_usuario_habilidad.
     *
     * Body (todos opcionales con 'sometimes'):
     * {
     *   "nivel": "avanzado",
     *   "anos_experiencia": 3,
     *   "categoria": "Frontend",
     *   "destacado": "...",
     *   "visibilidad": "publico"
     * }
     */
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

    /**
     * DELETE /habilidades/{id}
     * Soft-delete: marca eliminado = true en usuario_habilidad.
     * El {id} es el id_usuario_habilidad.
     */
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