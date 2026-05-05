<?php

namespace App\Repositories;

use App\Models\PortafolioPublicacion;

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

    public function existeSlug(string $slug): bool
    {
        return PortafolioPublicacion::where('slug_publico', $slug)->exists();
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
