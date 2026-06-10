<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerfilEnlace extends Model
{
    protected $table = 'perfil_enlace';
    protected $primaryKey = 'id_perfil_enlace';
    public $timestamps = false;

    protected $fillable = [
        'perfil_id',
        'titulo',
        'url',
        'orden',
        'eliminado',
    ];
}
