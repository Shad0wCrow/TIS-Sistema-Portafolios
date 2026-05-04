<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConfiguracionPrivacidad;
use Illuminate\Http\Request;

class VisibilidadController extends Controller
{
    private const VALORES_VALIDOS = ['publico', 'privado'];

    private const DEFAULTS = [
        'mostrar_correo'                       => false,
        'mostrar_ubicacion'                    => false,
        'visibilidad_proyectos_por_defecto'    => 'privado',
        'visibilidad_habilidades_por_defecto'  => 'privado',
        'visibilidad_experiencias_por_defecto' => 'privado',
        'visibilidad_logros_por_defecto'       => 'privado',
        'seccion_perfil'                       => 'publico',
        'seccion_habilidades'                  => 'publico',
        'seccion_proyectos'                    => 'publico',
        'seccion_educacion'                    => 'publico',
        'seccion_experiencia'                  => 'publico',
        'seccion_cursos'                       => 'publico',
        'seccion_certificaciones'              => 'publico',
        'seccion_logros'                       => 'publico',
        'seccion_idiomas'                      => 'publico',
    ];

    /**
     * GET /api/visibilidad/secciones
     * Devuelve solo los campos de sección de configuracion_privacidad.
     */
    public function show(Request $request)
    {
        $user = $request->user();

        $config = ConfiguracionPrivacidad::firstOrCreate(
            ['usuario_id' => $user->id_usuario],
            self::DEFAULTS
        );

        return response()->json([
            'configuracion' => $config->only(ConfiguracionPrivacidad::SECCIONES),
        ]);
    }

    /**
     * PUT /api/visibilidad/secciones
     * Actualiza los campos de sección. Valida que al menos uno sea 'publico' (CA-4).
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'seccion_perfil'          => 'required|in:publico,privado',
            'seccion_habilidades'     => 'required|in:publico,privado',
            'seccion_proyectos'       => 'required|in:publico,privado',
            'seccion_educacion'       => 'required|in:publico,privado',
            'seccion_experiencia'     => 'required|in:publico,privado',
            'seccion_cursos'          => 'required|in:publico,privado',
            'seccion_certificaciones' => 'required|in:publico,privado',
            'seccion_logros'          => 'required|in:publico,privado',
            'seccion_idiomas'         => 'required|in:publico,privado',
        ]);

        // CA-4: al menos una sección debe estar pública
        $algunaPublica = collect($data)->contains('publico');
        if (!$algunaPublica) {
            return response()->json([
                'message' => 'Debes activar al menos una sección antes de guardar la configuración.',
            ], 422);
        }

        $config = ConfiguracionPrivacidad::updateOrCreate(
            ['usuario_id' => $user->id_usuario],
            $data
        );

        return response()->json([
            'message'       => 'Configuración de visibilidad guardada correctamente.',
            'configuracion' => $config->only(ConfiguracionPrivacidad::SECCIONES),
        ]);
    }
}
