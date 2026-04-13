<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Perfil extends Model
{
    protected $table = 'perfil';
    protected $primaryKey = 'id_perfil';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'nombre_perfil',
        'apellido_perfil',
        'profesion',
        'celular',
        'descripcion',
        'foto_url',
        'correo_contacto',
        'linkedin_url',
        'visibilidad',
        'eliminado',
    ];
}