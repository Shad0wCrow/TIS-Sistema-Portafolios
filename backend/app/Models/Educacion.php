<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Educacion extends Model
{
    /**
     * Discriminador para registros que corresponden a cursos.
     * Usar esta constante en vez del literal 'curso' en queries
     * para evitar errores de tipeo y facilitar futuros cambios.
     */
    const TIPO_CURSO = 'curso';

    protected $table = 'educacion';
    protected $primaryKey = 'id_educacion';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'institucion',
        'titulo',
        'area_estudio',
        'fecha_inicio',
        'fecha_fin',
        'descripcion',
        'visibilidad',
        'eliminado',
    ];
}