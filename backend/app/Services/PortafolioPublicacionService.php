<?php

namespace App\Services;

use App\Models\PortafolioPublicacion;
use App\Models\Usuario;
use App\Repositories\PortafolioPublicacionRepository;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PortafolioPublicacionService
{
    private $publicacionRepository;
    private $portafolioPublicoService;

    public function __construct(
        PortafolioPublicacionRepository $publicacionRepository,
        PortafolioPublicoService $portafolioPublicoService
    ) {
        $this->publicacionRepository = $publicacionRepository;
        $this->portafolioPublicoService = $portafolioPublicoService;
    }

    public function obtenerEstado(Usuario $usuario): array
    {
        $publicacion = $this->publicacionRepository->buscarPorUsuario($usuario->id_usuario);

        if (!$publicacion) {
            return [
                'publicado' => false,
                'slug_publico' => null,
                'url_publica' => null,
                'publicado_en' => null,
                'despublicado_en' => null,
            ];
        }

        return $this->formatearEstado($publicacion);
    }

    public function publicar(Usuario $usuario): array
    {
        if (!$this->portafolioPublicoService->tieneContenidoPublicable($usuario->id_usuario)) {
            throw ValidationException::withMessages([
                'portafolio' => ['Debes activar al menos una seccion con contenido publico antes de publicar.'],
            ]);
        }

        $publicacionActual = $this->publicacionRepository->buscarPorUsuario($usuario->id_usuario);
        $slug = $publicacionActual ? $publicacionActual->slug_publico : $this->generarSlug($usuario);

        $publicacion = $this->publicacionRepository->guardarPublicacion($usuario->id_usuario, $slug);

        return $this->formatearEstado($publicacion);
    }

    public function despublicar(Usuario $usuario): array
    {
        $publicacion = $this->publicacionRepository->buscarPorUsuario($usuario->id_usuario);

        if (!$publicacion) {
            return $this->obtenerEstado($usuario);
        }

        return $this->formatearEstado($this->publicacionRepository->despublicar($publicacion));
    }

    private function generarSlug(Usuario $usuario): string
    {
        $base = Str::slug($usuario->nombre_usuario ?: 'portafolio');

        if (!$base) {
            $base = 'portafolio';
        }

        do {
            $slug = $base . '-' . Str::lower(Str::random(8));
        } while ($this->publicacionRepository->existeSlug($slug));

        return $slug;
    }

    private function formatearEstado(PortafolioPublicacion $publicacion): array
    {
        return [
            'publicado' => (bool) $publicacion->publicado,
            'slug_publico' => $publicacion->slug_publico,
            'url_publica' => $this->construirUrlPublica($publicacion->slug_publico),
            'api_url_publica' => url('/api/public/portafolios/' . $publicacion->slug_publico),
            'publicado_en' => $publicacion->publicado_en,
            'despublicado_en' => $publicacion->despublicado_en,
        ];
    }

    private function construirUrlPublica(string $slug): string
    {
        $baseUrl = rtrim(config('app.frontend_url') ?: config('app.url'), '/');

        return $baseUrl . '/portafolio/publico/' . $slug;
    }
}
