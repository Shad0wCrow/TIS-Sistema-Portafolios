<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PortafolioContactoEvento extends Model
{
    protected $table = 'portafolio_contacto_evento';
    protected $primaryKey = 'id_contacto_evento';
    public $timestamps = false;

    protected $fillable = [
        'publicacion_id',
        'usuario_id_propietario',
        'slug_publico',
        'medio',
        'ip_hash',
        'user_agent',
    ];
}
