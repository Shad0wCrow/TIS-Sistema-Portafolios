<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PortafolioGuardado extends Model
{
    protected $table = 'portafolio_guardado';
    protected $primaryKey = 'id_guardado';

    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'usuario_id',
        'publicacion_id',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id_usuario');
    }

    public function publicacion()
    {
        return $this->belongsTo(PortafolioPublicacion::class, 'publicacion_id', 'id_publicacion');
    }
}
