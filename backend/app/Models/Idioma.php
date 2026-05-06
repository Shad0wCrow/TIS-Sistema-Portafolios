<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class Idioma extends Model
{
    protected $table = 'idioma';
    protected $primaryKey = 'id_idioma';
    public $timestamps = false;
 
    protected $fillable = [
        'nombre',
    ];

    
}