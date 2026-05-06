<?php

namespace App\Repositories;

use App\Models\PortafolioGuardado;
use Illuminate\Support\Facades\DB;

class PortafolioGuardadoRepository
{
    public function buscar(int $usuarioId, int $publicacionId): ?PortafolioGuardado
    {
        return PortafolioGuardado::where('usuario_id', $usuarioId)
            ->where('publicacion_id', $publicacionId)
            ->first();
    }

    public function existe(int $usuarioId, int $publicacionId): bool
    {
        return PortafolioGuardado::where('usuario_id', $usuarioId)
            ->where('publicacion_id', $publicacionId)
            ->exists();
    }

    public function guardar(int $usuarioId, int $publicacionId): PortafolioGuardado
    {
        return PortafolioGuardado::create([
            'usuario_id' => $usuarioId,
            'publicacion_id' => $publicacionId,
        ]);
    }

    public function eliminar(int $usuarioId, int $publicacionId): bool
    {
        return PortafolioGuardado::where('usuario_id', $usuarioId)
            ->where('publicacion_id', $publicacionId)
            ->delete() > 0;
    }

    public function listarPorUsuario(int $usuarioId)
    {
        return DB::table('portafolio_guardado as guardado')
            ->join('portafolio_publicacion as publicacion', 'publicacion.id_publicacion', '=', 'guardado.publicacion_id')
            ->join('usuario as propietario', 'propietario.id_usuario', '=', 'publicacion.usuario_id')
            ->leftJoin('perfil', function ($join) {
                $join->on('perfil.usuario_id', '=', 'publicacion.usuario_id')
                    ->where('perfil.eliminado', false);
            })
            ->leftJoin('configuracion_privacidad as privacidad', 'privacidad.usuario_id', '=', 'publicacion.usuario_id')
            ->where('guardado.usuario_id', $usuarioId)
            ->where('propietario.eliminado', false)
            ->orderByDesc('guardado.creado_en')
            ->orderByDesc('guardado.id_guardado')
            ->get([
                'guardado.id_guardado',
                'guardado.creado_en as guardado_en',
                'publicacion.id_publicacion',
                'publicacion.usuario_id as propietario_id',
                'publicacion.slug_publico',
                'publicacion.publicado',
                'publicacion.publicado_en',
                'propietario.nombre_usuario',
                'perfil.nombre_perfil',
                'perfil.apellido_perfil',
                'perfil.profesion',
                'perfil.descripcion',
                'perfil.foto_url',
                'privacidad.seccion_perfil',
            ]);
    }
}
