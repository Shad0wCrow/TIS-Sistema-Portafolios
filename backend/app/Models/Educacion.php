<?php

namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class Educacion extends Model
{
    protected $table = 'educacion';
    protected $primaryKey = 'id_educacion';
    public $timestamps = false;
 
    protected $fillable = [
        'usuario_id',
        'institucion',
        'titulo',
        'area_estudio',
        'grado',
        'fecha_inicio',
        'fecha_fin',
        'descripcion',
        'visibilidad',
        'eliminado',
    ];
}
 