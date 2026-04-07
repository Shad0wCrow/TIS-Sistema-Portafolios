<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsuarioHabilidad extends Model
{
    protected $table = 'usuario_habilidad';
    protected $primaryKey = 'id_usuario_habilidad';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'habilidad_id',
        'nivel',          
        'anos_experiencia',
        'categoria',
        'destacado',
        'visibilidad',     
        'eliminado',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id_usuario');
    }

    public function habilidad()
    {
        return $this->belongsTo(Habilidad::class, 'habilidad_id', 'id_habilidad');
    }
}