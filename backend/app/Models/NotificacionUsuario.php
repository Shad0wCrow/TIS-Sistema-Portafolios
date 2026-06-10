<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificacionUsuario extends Model
{
    protected $table = 'notificacion_usuario';
    protected $primaryKey = 'id_notificacion';

    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'reporte_id',
        'tipo',
        'titulo',
        'mensaje',
        'slug_publico',
        'portafolio_nombre',
        'leida',
        'leida_en',
        'creado_en',
    ];

    protected $casts = [
        'leida' => 'boolean',
        'leida_en' => 'datetime',
        'creado_en' => 'datetime',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id_usuario');
    }

    public function reporte()
    {
        return $this->belongsTo(ReportePortafolio::class, 'reporte_id', 'id_reporte');
    }
}
