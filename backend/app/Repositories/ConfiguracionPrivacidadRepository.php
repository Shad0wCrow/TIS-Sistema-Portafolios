<?php

namespace App\Repositories;

use App\Models\ConfiguracionPrivacidad;

class ConfiguracionPrivacidadRepository
{
    public function obtenerOCrearPorUsuario(int $usuarioId): ConfiguracionPrivacidad
    {
        return ConfiguracionPrivacidad::firstOrCreate(
            ['usuario_id' => $usuarioId],
            $this->defaults()
        );
    }

    public function defaults(): array
    {
        return [
            'mostrar_correo' => false,
            'mostrar_ubicacion' => false,
            'visibilidad_proyectos_por_defecto' => 'privado',
            'visibilidad_habilidades_por_defecto' => 'privado',
            'visibilidad_experiencias_por_defecto' => 'privado',
            'visibilidad_logros_por_defecto' => 'privado',
            'seccion_perfil' => 'publico',
            'seccion_habilidades' => 'publico',
            'seccion_proyectos' => 'publico',
            'seccion_educacion' => 'publico',
            'seccion_experiencia' => 'publico',
            'seccion_cursos' => 'publico',
            'seccion_certificaciones' => 'publico',
            'seccion_logros' => 'publico',
            'seccion_idiomas' => 'publico',
        ];
    }
}
