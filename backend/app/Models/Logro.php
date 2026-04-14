<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class Logro extends Model
{
    protected $table = 'logro';
    protected $primaryKey = 'id_logro';
    public $timestamps = false;
 
    protected $fillable = [
        'usuario_id',
        'entidad_emisora_id',
        'titulo',
        'descripcion',
        'fecha_obtencion',
        'url_credencial',
        'identificador',
        'visibilidad',
        'eliminado',
    ];
 
    public function entidadEmisora()
    {
        return $this->belongsTo(EntidadEmisora::class, 'entidad_emisora_id', 'id_entidad_emisora');
    }
}