<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PortafolioPublicacion extends Model
{
    protected $table = 'portafolio_publicacion';
    protected $primaryKey = 'id_publicacion';

    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'usuario_id',
        'slug_publico',
        'publicado',
        'publicado_en',
        'despublicado_en',
    ];

    protected $casts = [
        'publicado' => 'boolean',
        'publicado_en' => 'datetime',
        'despublicado_en' => 'datetime',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id_usuario');
    }
}
