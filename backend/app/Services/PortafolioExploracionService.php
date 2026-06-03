<?php

namespace App\Services;

use App\Models\ConfiguracionPrivacidad;
use App\Repositories\PortafolioPublicacionRepository;

class PortafolioExploracionService
{
    private const LIMITE_POR_DEFECTO = 12;
    private const LIMITE_MAXIMO = 30;

    private $publicacionRepository;

    public function __construct(PortafolioPublicacionRepository $publicacionRepository)
    {
        $this->publicacionRepository = $publicacionRepository;
    }

    public function listarPortafoliosAjenos(?int $usuarioId, ?int $limite = null, ?string $busqueda = null): array
    {
        $limiteSeguro = $this->normalizarLimite($limite);

        return $this->publicacionRepository
            ->listarPublicadosAjenos($usuarioId, $limiteSeguro, $this->normalizarBusqueda($busqueda))
            ->map(function ($publicacion) {
                return $this->formatearTarjeta($publicacion);
            })
            ->values()
            ->all();
    }

    private function normalizarLimite(?int $limite): int
    {
        if (!$limite || $limite < 1) {
            return self::LIMITE_POR_DEFECTO;
        }

        return min($limite, self::LIMITE_MAXIMO);
    }

    protected function formatearTarjeta($publicacion): array
    {
        $perfilPublico = ($publicacion->seccion_perfil ?? ConfiguracionPrivacidad::PUBLICO) === ConfiguracionPrivacidad::PUBLICO;

        return [
            'id_publicacion' => $publicacion->id_publicacion,
            'slug_publico' => $publicacion->slug_publico,
            'url_publica' => $this->construirUrlPublica($publicacion->slug_publico),
            'nombre' => $perfilPublico
                ? $this->nombreVisible($publicacion)
                : $publicacion->nombre_usuario,
            'profesion' => $perfilPublico ? $publicacion->profesion : null,
            'descripcion' => $perfilPublico ? $publicacion->descripcion : null,
            'foto_url' => $perfilPublico ? $publicacion->foto_url : null,
            'perfil_privado' => !$perfilPublico,
            'publicado_en' => $publicacion->publicado_en,
        ];
    }

    private function normalizarBusqueda(?string $busqueda): ?string
    {
        $criterio = trim((string) $busqueda);

        return $criterio !== '' ? $criterio : null;
    }

    private function nombreVisible($publicacion): string
    {
        $nombre = trim(($publicacion->nombre_perfil ?? '') . ' ' . ($publicacion->apellido_perfil ?? ''));

        return $nombre !== '' ? $nombre : $publicacion->nombre_usuario;
    }

    private function construirUrlPublica(string $slug): string
    {
        $baseUrl = rtrim(config('app.frontend_url') ?: config('app.url'), '/');

        return $baseUrl . '/portafolio/publico/' . $slug;
    }

    public function obtenerTopMensual(): array
{
    $medallas = ['oro', 'plata', 'bronce'];

    return $this->publicacionRepository
        ->listarTopMensual()
        ->values()
        ->map(function ($publicacion, $indice) use ($medallas) {
            return array_merge(
                $this->formatearTarjeta($publicacion),
                [
                    'posicion'             => $indice + 1,
                    'medalla'              => $medallas[$indice],
                    'total_visualizaciones' => (int) $publicacion->total_visitas, // ← nombre que espera el frontend
                ]
            );
        })
        ->all();
}
}
