<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsuarioEstadoHistorial extends Model
{
    protected $table = 'usuario_estado_historial';
    protected $primaryKey = 'id_evento';

    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'admin_id',
        'reporte_id',
        'accion',
        'estado_anterior',
        'estado_nuevo',
        'origen',
        'motivo',
        'detalle',
        'creado_en',
    ];

    protected $casts = [
        'creado_en' => 'datetime',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id_usuario');
    }

    public function admin()
    {
        return $this->belongsTo(Usuario::class, 'admin_id', 'id_usuario');
    }

    public function reporte()
    {
        return $this->belongsTo(ReportePortafolio::class, 'reporte_id', 'id_reporte');
    }
}
