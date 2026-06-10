<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PortafolioVisualizacionEvento extends Model
{
    protected $table = 'portafolio_visualizacion_evento';
    protected $primaryKey = 'id_visualizacion_evento';
    public $timestamps = false;

    protected $fillable = [
        'publicacion_id',
        'usuario_id_propietario',
        'usuario_id_visitante',
        'slug_publico',
        'session_key',
        'fecha_visita',
        'ip_hash',
        'user_agent',
    ];
}
