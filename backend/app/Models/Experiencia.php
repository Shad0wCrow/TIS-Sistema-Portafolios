<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Experiencia extends Model
{
    protected $table = 'experiencia';
    protected $primaryKey = 'id_experiencia';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'empresa_id',
        'tipo',
        'puesto',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'es_actual',
        'ubicacion',
        'visibilidad',
        'eliminado',
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'empresa_id', 'id_empresa');
    }
}