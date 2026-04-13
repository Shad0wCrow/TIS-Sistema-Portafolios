<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Proyecto extends Model
{
    protected $table = 'proyecto';
    protected $primaryKey = 'id_proyecto';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'categoria_id',
        'titulo',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'estado',         
        'repositorio_url',
        'demo_url',
        'imagen_principal_url',
        'visibilidad',    
        'eliminado',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id_usuario');
    }

}