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
        'nivel',            // 'basico' | 'intermedio' | 'avanzado' | 'experto'
        'anos_experiencia',
        'categoria',
        'destacado',
        'visibilidad',      // 'publico' | 'privado'
        'eliminado',
    ];

    /**
     * El usuario dueño de esta habilidad.
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id_usuario');
    }

    /**
     * La habilidad base referenciada.
     */
    public function habilidad()
    {
        return $this->belongsTo(Habilidad::class, 'habilidad_id', 'id_habilidad');
    }
}