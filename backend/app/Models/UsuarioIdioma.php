<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class UsuarioIdioma extends Model
{
    protected $table = 'usuario_idioma';
    protected $primaryKey = 'id_usuario_idioma';
    public $timestamps = false;
 
    protected $fillable = [
        'usuario_id',
        'idioma_id',
        'nivel',
        'visibilidad',
        'eliminado',
    ];
 
    public function idioma()
    {
        return $this->belongsTo(Idioma::class, 'idioma_id', 'id_idioma');
    }
}
 