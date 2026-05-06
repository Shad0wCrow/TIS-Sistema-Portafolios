<?php

namespace App\Services;

use App\Models\ConfiguracionPrivacidad;
use App\Repositories\ConfiguracionPrivacidadRepository;
use App\Repositories\PortafolioRepository;

class PortafolioPublicoService
{
    private $configuracionRepository;
    private $portafolioRepository;

    public function __construct(
        ConfiguracionPrivacidadRepository $configuracionRepository,
        PortafolioRepository $portafolioRepository
    ) {
        $this->configuracionRepository = $configuracionRepository;
        $this->portafolioRepository = $portafolioRepository;
    }

    public function construirPortafolioPublico(int $usuarioId): array
    {
        $configuracion = $this->configuracionRepository->obtenerOCrearPorUsuario($usuarioId);
        $data = [
            'configuracion' => $configuracion->only(ConfiguracionPrivacidad::SECCIONES),
        ];

        if ($this->seccionPublica($configuracion, 'seccion_perfil')) {
            $data['perfil'] = $this->portafolioRepository->perfil($usuarioId);
        }

        if ($this->seccionPublica($configuracion, 'seccion_habilidades')) {
            $habilidades = $this->portafolioRepository->habilidadesPublicas($usuarioId);
            $data['habilidades_tecnicas'] = $habilidades
                ->filter(function ($uh) {
                    return $uh->habilidad && $uh->habilidad->tipo === 'tecnica';
                })
                ->values()
                ->map(function ($uh) {
                    return [
                        'id_usuario_habilidad' => $uh->id_usuario_habilidad,
                        'nombre' => $uh->habilidad->nombre,
                        'nivel' => $uh->nivel,
                    ];
                });
            $data['habilidades_blandas'] = $habilidades
                ->filter(function ($uh) {
                    return $uh->habilidad && $uh->habilidad->tipo === 'blanda';
                })
                ->values()
                ->map(function ($uh) {
                    return [
                        'id_usuario_habilidad' => $uh->id_usuario_habilidad,
                        'nombre' => $uh->habilidad->nombre,
                        'nivel' => $uh->nivel,
                    ];
                });
        }

        if ($this->seccionPublica($configuracion, 'seccion_proyectos')) {
            $data['proyectos'] = $this->portafolioRepository->proyectosPublicos($usuarioId);
        }

        if ($this->seccionPublica($configuracion, 'seccion_educacion')) {
            $data['educaciones'] = $this->portafolioRepository->educacionesPublicas($usuarioId);
        }

        if ($this->seccionPublica($configuracion, 'seccion_experiencia')) {
            $data['experiencias'] = $this->portafolioRepository->experienciasPublicas($usuarioId);
        }

        if ($this->seccionPublica($configuracion, 'seccion_cursos')) {
            $data['cursos'] = $this->portafolioRepository->cursosPublicos($usuarioId);
        }

        if ($this->seccionPublica($configuracion, 'seccion_certificaciones')) {
            $data['certificaciones'] = $this->portafolioRepository->certificacionesPublicas($usuarioId);
        }

        if ($this->seccionPublica($configuracion, 'seccion_logros')) {
            $data['logros'] = $this->portafolioRepository->logrosPublicos($usuarioId);
        }

        if ($this->seccionPublica($configuracion, 'seccion_idiomas')) {
            $data['idiomas'] = $this->portafolioRepository->idiomasPublicos($usuarioId);
        }

        return $data;
    }

    public function tieneContenidoPublicable(int $usuarioId): bool
    {
        $configuracion = $this->configuracionRepository->obtenerOCrearPorUsuario($usuarioId);

        if ($this->seccionPublica($configuracion, 'seccion_perfil') && $this->portafolioRepository->perfil($usuarioId)) {
            return true;
        }

        if ($this->seccionPublica($configuracion, 'seccion_habilidades')
            && $this->portafolioRepository->habilidadesPublicas($usuarioId)->isNotEmpty()) {
            return true;
        }

        if ($this->seccionPublica($configuracion, 'seccion_proyectos')
            && $this->portafolioRepository->proyectosPublicos($usuarioId)->isNotEmpty()) {
            return true;
        }

        if ($this->seccionPublica($configuracion, 'seccion_educacion')
            && $this->portafolioRepository->educacionesPublicas($usuarioId)->isNotEmpty()) {
            return true;
        }

        if ($this->seccionPublica($configuracion, 'seccion_experiencia')
            && $this->portafolioRepository->experienciasPublicas($usuarioId)->isNotEmpty()) {
            return true;
        }

        if ($this->seccionPublica($configuracion, 'seccion_cursos')
            && $this->portafolioRepository->cursosPublicos($usuarioId)->isNotEmpty()) {
            return true;
        }

        if ($this->seccionPublica($configuracion, 'seccion_certificaciones')
            && $this->portafolioRepository->certificacionesPublicas($usuarioId)->isNotEmpty()) {
            return true;
        }

        if ($this->seccionPublica($configuracion, 'seccion_logros')
            && $this->portafolioRepository->logrosPublicos($usuarioId)->isNotEmpty()) {
            return true;
        }

        return $this->seccionPublica($configuracion, 'seccion_idiomas')
            && $this->portafolioRepository->idiomasPublicos($usuarioId)->isNotEmpty();
    }

    private function seccionPublica(ConfiguracionPrivacidad $configuracion, string $seccion): bool
    {
        return ($configuracion->{$seccion} ?? ConfiguracionPrivacidad::PRIVADO) === ConfiguracionPrivacidad::PUBLICO;
    }
}
