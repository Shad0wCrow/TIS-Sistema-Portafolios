<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReportePortafolio extends Model
{
    protected $table      = 'reporte_portafolio';
    protected $primaryKey = 'id_reporte';

    public $timestamps = false;

    protected $fillable = [
        'publicacion_id',
        'reportado_por',
        'motivo',
        'comentario',
        'estado',
        'revisado_por',
        'nota_moderador',
        'creado_en',
        'revisado_en',
    ];

    protected $casts = [
        'creado_en'   => 'datetime',
        'revisado_en' => 'datetime',
    ];

    // ── Relaciones ────────────────────────────────────────────────────────

    public function publicacion()
    {
        return $this->belongsTo(PortafolioPublicacion::class, 'publicacion_id', 'id_publicacion');
    }

    public function reportadoPor()
    {
        return $this->belongsTo(Usuario::class, 'reportado_por', 'id_usuario');
    }

    public function revisadoPor()
    {
        return $this->belongsTo(Usuario::class, 'revisado_por', 'id_usuario');
    }

    // ── Scopes ────────────────────────────────────────────────────────────

    public function scopePendientes($query)
    {
        return $query->where('estado', 'pendiente');
    }
}