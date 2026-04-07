<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProyectoUsuario extends Model
{
    protected $table = 'proyecto_usuario';
    protected $primaryKey = 'id_proyecto_usuario';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'proyecto_id',
        'rol_proyecto',  
        'es_propietario',
    ];

    public function proyecto()
    {
        return $this->belongsTo(Proyecto::class, 'proyecto_id', 'id_proyecto');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id_usuario');
    }
}