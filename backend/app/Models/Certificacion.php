<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class Certificacion extends Model
{
    protected $table = 'certificacion';
    protected $primaryKey = 'id_certificacion';
    public $timestamps = false;
 
    protected $fillable = [
        'usuario_id',
        'entidad_emisora_id',
        'nombre',
        'fecha_obtencion',
        'fecha_expiracion',
        'url_certificado',
        'url_imagen',
        'visibilidad',
        'eliminado',
    ];
 
    public function entidadEmisora()
    {
        return $this->belongsTo(EntidadEmisora::class, 'entidad_emisora_id', 'id_entidad_emisora');
    }
}
