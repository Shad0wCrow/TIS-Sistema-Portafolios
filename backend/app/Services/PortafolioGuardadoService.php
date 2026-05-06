<?php

namespace App\Services;

use App\Models\ConfiguracionPrivacidad;
use App\Models\PortafolioPublicacion;
use App\Models\Usuario;
use App\Repositories\PortafolioGuardadoRepository;
use App\Repositories\PortafolioPublicacionRepository;
use Illuminate\Validation\ValidationException;

class PortafolioGuardadoService
{
    private $guardadoRepository;
    private $publicacionRepository;

    public function __construct(
        PortafolioGuardadoRepository $guardadoRepository,
        PortafolioPublicacionRepository $publicacionRepository
    ) {
        $this->guardadoRepository = $guardadoRepository;
        $this->publicacionRepository = $publicacionRepository;
    }

    public function listar(Usuario $usuario): array
    {
        return $this->guardadoRepository
            ->listarPorUsuario($usuario->id_usuario)
            ->map(function ($guardado) {
                return $this->formatearGuardado($guardado);
            })
            ->values()
            ->all();
    }

    public function estado(Usuario $usuario, string $slug): array
    {
        $publicacion = $this->publicacionRepository->buscarPublicadoPorSlug($slug);

        if (!$publicacion || $publicacion->usuario_id === $usuario->id_usuario) {
            return ['guardado' => false];
        }

        return [
            'guardado' => $this->guardadoRepository->existe($usuario->id_usuario, $publicacion->id_publicacion),
        ];
    }

    public function guardar(Usuario $usuario, string $slug): array
    {
        $publicacion = $this->obtenerPublicacionDisponible($slug);

        if ($publicacion->usuario_id === $usuario->id_usuario) {
            throw ValidationException::withMessages([
                'portafolio' => ['No puedes guardar tu propio portafolio.'],
            ]);
        }

        if ($this->guardadoRepository->existe($usuario->id_usuario, $publicacion->id_publicacion)) {
            throw ValidationException::withMessages([
                'portafolio' => ['Este portafolio ya esta en tu lista de guardados.'],
            ]);
        }

        $this->guardadoRepository->guardar($usuario->id_usuario, $publicacion->id_publicacion);

        return [
            'guardado' => true,
            'portafolio' => $this->formatearDesdePublicacion($publicacion),
        ];
    }

    public function eliminar(Usuario $usuario, string $slug): array
    {
        $publicacion = $this->publicacionRepository->buscarPorSlug($slug);

        if (!$publicacion) {
            return ['guardado' => false];
        }

        $this->guardadoRepository->eliminar($usuario->id_usuario, $publicacion->id_publicacion);

        return ['guardado' => false];
    }

    private function obtenerPublicacionDisponible(string $slug): PortafolioPublicacion
    {
        $publicacion = $this->publicacionRepository->buscarPublicadoPorSlug($slug);

        if (!$publicacion) {
            throw ValidationException::withMessages([
                'portafolio' => ['El portafolio no esta disponible.'],
            ]);
        }

        return $publicacion;
    }

    private function formatearGuardado($guardado): array
    {
        $perfilPublico = ($guardado->seccion_perfil ?? ConfiguracionPrivacidad::PUBLICO) === ConfiguracionPrivacidad::PUBLICO;

        return [
            'id_guardado' => $guardado->id_guardado,
            'id_publicacion' => $guardado->id_publicacion,
            'slug_publico' => $guardado->slug_publico,
            'url_publica' => $this->construirUrlPublica($guardado->slug_publico),
            'disponible' => (bool) $guardado->publicado,
            'nombre' => $perfilPublico ? $this->nombreVisible($guardado) : $guardado->nombre_usuario,
            'profesion' => $perfilPublico ? $guardado->profesion : null,
            'descripcion' => $perfilPublico ? $guardado->descripcion : null,
            'foto_url' => $perfilPublico ? $guardado->foto_url : null,
            'guardado_en' => $guardado->guardado_en,
            'publicado_en' => $guardado->publicado_en,
        ];
    }

    private function formatearDesdePublicacion(PortafolioPublicacion $publicacion): array
    {
        return [
            'id_publicacion' => $publicacion->id_publicacion,
            'slug_publico' => $publicacion->slug_publico,
            'url_publica' => $this->construirUrlPublica($publicacion->slug_publico),
        ];
    }

    private function nombreVisible($registro): string
    {
        $nombre = trim(($registro->nombre_perfil ?? '') . ' ' . ($registro->apellido_perfil ?? ''));

        return $nombre !== '' ? $nombre : $registro->nombre_usuario;
    }

    private function construirUrlPublica(string $slug): string
    {
        $baseUrl = rtrim(config('app.frontend_url') ?: config('app.url'), '/');

        return $baseUrl . '/portafolio/publico/' . $slug;
    }
}
