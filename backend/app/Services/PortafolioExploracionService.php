<?php

namespace App\Services;

use App\Models\ConfiguracionPrivacidad;
use App\Repositories\PortafolioPublicacionRepository;
use Illuminate\Support\Facades\Cache;

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

    /**
     * Devuelve el Top 3 del mes anterior (ya cerrado y persistido en ranking_mensual).
     * El resultado se cachea por 1 día; el comando ranking:cerrar-mes lo invalida al ejecutarse.
     * Incluye el label del periodo para mostrarlo en la UI (ej: "Mayo 2026").
     */
    public function obtenerTopMensual(): array
    {
        $periodo = now()->subMonth();
        $anio    = $periodo->year;
        $mes     = $periodo->month;
        $clave   = 'ranking_top3_' . $periodo->format('Y_m');

        $medallas = ['oro', 'plata', 'bronce'];

        $resultados = Cache::remember($clave, now()->addDay(), function () use ($anio, $mes) {
            return $this->publicacionRepository->listarTopMensualCerrado($anio, $mes);
        });

        return $resultados
            ->values()
            ->map(function ($publicacion, $indice) use ($medallas, $periodo) {
                return array_merge(
                    $this->formatearTarjeta($publicacion),
                    [
                        'posicion'              => $indice + 1,
                        'medalla'               => $medallas[$indice],
                        'total_visualizaciones' => (int) $publicacion->total_visualizaciones,
                        // Label legible del mes al que pertenece el ranking
                        'periodo_label'         => ucfirst($periodo->locale('es')->translatedFormat('F Y')),
                    ]
                );
            })
            ->all();
    }

    private function normalizarLimite(?int $limite): int
    {
        if (!$limite || $limite < 1) {
            return self::LIMITE_POR_DEFECTO;
        }

        return min($limite, self::LIMITE_MAXIMO);
    }

    private function formatearTarjeta($publicacion): array
    {
        $perfilPublico = ($publicacion->seccion_perfil ?? ConfiguracionPrivacidad::PUBLICO) === ConfiguracionPrivacidad::PUBLICO;

        return [
            'id_publicacion' => $publicacion->id_publicacion,
            'slug_publico'   => $publicacion->slug_publico,
            'url_publica'    => $this->construirUrlPublica($publicacion->slug_publico),
            'nombre'         => $perfilPublico
                ? $this->nombreVisible($publicacion)
                : $publicacion->nombre_usuario,
            'profesion'      => $perfilPublico ? $publicacion->profesion : null,
            'descripcion'    => $perfilPublico ? $publicacion->descripcion : null,
            'foto_url'       => $perfilPublico ? $publicacion->foto_url : null,
            'perfil_privado' => !$perfilPublico,
            'publicado_en'   => $publicacion->publicado_en,
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
}