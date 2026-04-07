<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Habilidad extends Model
{
    protected $table = 'habilidad';
    protected $primaryKey = 'id_habilidad';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'tipo',        // 'tecnica' | 'blanda'
        'descripcion',
    ];

    /**
     * Relación: una habilidad puede pertenecer a muchos usuarios (pivot).
     */
    public function usuarios()
    {
        return $this->belongsToMany(
            Usuario::class,
            'usuario_habilidad',
            'habilidad_id',
            'usuario_id'
        )->withPivot([
            'id_usuario_habilidad',
            'nivel',
            'anos_experiencia',
            'categoria',
            'destacado',
            'visibilidad',
            'eliminado',
            'creado_en',
            'actualizado_en',
        ]);
    }
}