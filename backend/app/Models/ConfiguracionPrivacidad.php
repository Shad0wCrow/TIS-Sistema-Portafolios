<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConfiguracionPrivacidad extends Model
{
    protected $table      = 'configuracion_privacidad';
    protected $primaryKey = 'id_configuracion';

    protected $fillable = [
        'usuario_id',
        // Campos anteriores
        'mostrar_correo',
        'mostrar_ubicacion',
        'visibilidad_proyectos_por_defecto',
        'visibilidad_habilidades_por_defecto',
        'visibilidad_experiencias_por_defecto',
        'visibilidad_logros_por_defecto',
        // Nuevos campos HU-23 (visibilidad de sección completa)
        'seccion_perfil',
        'seccion_habilidades',
        'seccion_proyectos',
        'seccion_educacion',
        'seccion_experiencia',
        'seccion_cursos',
        'seccion_certificaciones',
        'seccion_logros',
        'seccion_idiomas',
    ];

    protected $casts = [
        'mostrar_correo' => 'boolean',
        'mostrar_ubicacion' => 'boolean',
    ];

    // Valores válidos para campos de sección
    public const PUBLICO  = 'publico';
    public const PRIVADO  = 'privado';
    public const SECCIONES = [
        'seccion_perfil',
        'seccion_habilidades',
        'seccion_proyectos',
        'seccion_educacion',
        'seccion_experiencia',
        'seccion_cursos',
        'seccion_certificaciones',
        'seccion_logros',
        'seccion_idiomas',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id_usuario');
    }

    /** Devuelve true si la sección está habilitada para mostrarse públicamente. */
    public function seccionEsPublica(string $seccion): bool
    {
        return ($this->{$seccion} ?? self::PRIVADO) === self::PUBLICO;
    }
}
