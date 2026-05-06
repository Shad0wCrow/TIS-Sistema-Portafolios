<?php

namespace App\Repositories;

use App\Models\PortafolioPublicacion;
use Illuminate\Support\Facades\DB;

class PortafolioPublicacionRepository
{
    public function buscarPorUsuario(int $usuarioId): ?PortafolioPublicacion
    {
        return PortafolioPublicacion::where('usuario_id', $usuarioId)->first();
    }

    public function buscarPublicadoPorSlug(string $slug): ?PortafolioPublicacion
    {
        return PortafolioPublicacion::where('slug_publico', $slug)
            ->where('publicado', true)
            ->first();
    }

    public function buscarPorSlug(string $slug): ?PortafolioPublicacion
    {
        return PortafolioPublicacion::where('slug_publico', $slug)->first();
    }

    public function existeSlug(string $slug): bool
    {
        return PortafolioPublicacion::where('slug_publico', $slug)->exists();
    }

    public function listarPublicadosAjenos(?int $usuarioId, int $limite)
    {
        $query = DB::table('portafolio_publicacion as publicacion')
            ->join('usuario', 'usuario.id_usuario', '=', 'publicacion.usuario_id')
            ->leftJoin('perfil', function ($join) {
                $join->on('perfil.usuario_id', '=', 'publicacion.usuario_id')
                    ->where('perfil.eliminado', false);
            })
            ->leftJoin('configuracion_privacidad as privacidad', 'privacidad.usuario_id', '=', 'publicacion.usuario_id')
            ->where('publicacion.publicado', true)
            ->where('usuario.eliminado', false);

        if ($usuarioId) {
            $query->where('publicacion.usuario_id', '!=', $usuarioId);
        }

        return $query
            ->orderByDesc('publicacion.publicado_en')
            ->orderByDesc('publicacion.id_publicacion')
            ->limit($limite)
            ->get([
                'publicacion.id_publicacion',
                'publicacion.usuario_id',
                'publicacion.slug_publico',
                'publicacion.publicado_en',
                'usuario.nombre_usuario',
                'perfil.nombre_perfil',
                'perfil.apellido_perfil',
                'perfil.profesion',
                'perfil.descripcion',
                'perfil.foto_url',
                'privacidad.seccion_perfil',
            ]);
    }

    public function guardarPublicacion(int $usuarioId, string $slug): PortafolioPublicacion
    {
        return PortafolioPublicacion::updateOrCreate(
            ['usuario_id' => $usuarioId],
            [
                'slug_publico' => $slug,
                'publicado' => true,
                'publicado_en' => now(),
                'despublicado_en' => null,
            ]
        );
    }

    public function despublicar(PortafolioPublicacion $publicacion): PortafolioPublicacion
    {
        $publicacion->update([
            'publicado' => false,
            'despublicado_en' => now(),
        ]);

        return $publicacion;
    }
}
