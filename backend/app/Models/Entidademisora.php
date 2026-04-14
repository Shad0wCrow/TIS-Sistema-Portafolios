<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class EntidadEmisora extends Model
{
    protected $table = 'entidad_emisora';
    protected $primaryKey = 'id_entidad_emisora';
    public $timestamps = false;
 
    protected $fillable = [
        'nombre',
        'sitio_web',
    ];
}