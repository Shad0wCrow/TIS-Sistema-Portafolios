<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SolicitudReactivacion extends Model
{
    protected $table      = 'solicitud_reactivacion';
    protected $primaryKey = 'id_solicitud';
    public    $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'mensaje',
        'estado',
        'creado_en',
        'revisado_en',
        'admin_id',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id_usuario');
    }

    public function admin()
    {
        return $this->belongsTo(Usuario::class, 'admin_id', 'id_usuario');
    }
}