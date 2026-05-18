<?php

namespace App\Repositories;

use App\Models\Certificacion;
use App\Models\Educacion;
use App\Models\Experiencia;
use App\Models\Logro;
use App\Models\Perfil;
use App\Models\Proyecto;
use App\Models\ProyectoUsuario;
use App\Models\Usuario;
use App\Models\UsuarioHabilidad;
use App\Models\UsuarioIdioma;

class PortafolioRepository
{
    public function perfil(int $usuarioId): ?Perfil
    {
        return Perfil::with('enlacesPersonalizados')
            ->where('usuario_id', $usuarioId)
            ->where('eliminado', false)
            ->first();
    }

    public function correoContacto(int $usuarioId): ?string
    {
        $perfil = $this->perfil($usuarioId);
        $correoPerfil = trim((string) ($perfil->correo_contacto ?? ''));

        if ($correoPerfil !== '') {
            return $correoPerfil;
        }

        $correoUsuario = Usuario::where('id_usuario', $usuarioId)
            ->where('eliminado', false)
            ->value('correo');

        $correoUsuario = trim((string) $correoUsuario);

        return $correoUsuario !== '' ? $correoUsuario : null;
    }

    public function habilidadesPublicas(int $usuarioId)
    {
        return UsuarioHabilidad::with('habilidad')
            ->where('usuario_id', $usuarioId)
            ->where('eliminado', false)
            ->where('visibilidad', 'publico')
            ->get();
    }

    public function proyectosPublicos(int $usuarioId)
    {
        return Proyecto::where('usuario_id', $usuarioId)
            ->where('eliminado', false)
            ->where('visibilidad', 'publico')
            ->orderBy('creado_en', 'desc')
            ->get()
            ->map(function ($proyecto) use ($usuarioId) {
                $roles = ProyectoUsuario::where('proyecto_id', $proyecto->id_proyecto)
                    ->where('usuario_id', $usuarioId)
                    ->pluck('rol_proyecto')
                    ->filter()
                    ->values();

                return array_merge($proyecto->toArray(), ['roles' => $roles]);
            });
    }

    public function educacionesPublicas(int $usuarioId)
    {
        return Educacion::where('usuario_id', $usuarioId)
            ->where('eliminado', false)
            ->where('visibilidad', 'publico')
            ->where(function ($query) {
                $query->whereNull('area_estudio')->orWhere('area_estudio', '!=', 'curso');
            })
            ->orderByDesc('fecha_inicio')
            ->get();
    }

    public function cursosPublicos(int $usuarioId)
    {
        return Educacion::where('usuario_id', $usuarioId)
            ->where('eliminado', false)
            ->where('visibilidad', 'publico')
            ->where('area_estudio', 'curso')
            ->orderByDesc('fecha_inicio')
            ->get();
    }

    public function experienciasPublicas(int $usuarioId)
    {
        return Experiencia::with('empresa')
            ->where('usuario_id', $usuarioId)
            ->where('eliminado', false)
            ->where('visibilidad', 'publico')
            ->orderByDesc('fecha_inicio')
            ->get()
            ->map(function ($experiencia) {
                return [
                    'id_experiencia' => $experiencia->id_experiencia,
                    'nombre_empresa' => $experiencia->empresa->nombre ?? null,
                    'puesto' => $experiencia->puesto,
                    'tipo' => $experiencia->tipo,
                    'descripcion' => $experiencia->descripcion,
                    'fecha_inicio' => $experiencia->fecha_inicio,
                    'fecha_fin' => $experiencia->fecha_fin,
                    'es_actual' => $experiencia->es_actual,
                    'ubicacion' => $experiencia->ubicacion,
                    'visibilidad' => $experiencia->visibilidad,
                ];
            });
    }

    public function certificacionesPublicas(int $usuarioId)
    {
        return Certificacion::with('entidadEmisora')
            ->where('usuario_id', $usuarioId)
            ->where('eliminado', false)
            ->where('visibilidad', 'publico')
            ->orderByDesc('fecha_obtencion')
            ->get();
    }

    public function logrosPublicos(int $usuarioId)
    {
        return Logro::with('entidadEmisora')
            ->where('usuario_id', $usuarioId)
            ->where('eliminado', false)
            ->where('visibilidad', 'publico')
            ->orderByDesc('fecha_obtencion')
            ->get();
    }

    public function idiomasPublicos(int $usuarioId)
    {
        return UsuarioIdioma::with('idioma')
            ->where('usuario_id', $usuarioId)
            ->where('eliminado', false)
            ->where('visibilidad', 'publico')
            ->get()
            ->map(function ($usuarioIdioma) {
                return [
                    'id_usuario_idioma' => $usuarioIdioma->id_usuario_idioma,
                    'nombre' => $usuarioIdioma->idioma->nombre ?? null,
                    'nivel' => $usuarioIdioma->nivel,
                    'visibilidad' => $usuarioIdioma->visibilidad,
                ];
            });
    }
}
