<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PortafolioContactoEvento;
use App\Repositories\ConfiguracionPrivacidadRepository;
use App\Repositories\PortafolioPublicacionRepository;
use App\Repositories\PortafolioRepository;
use App\Services\PortafolioPublicoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PortafolioPublicoController extends Controller
{
    private $publicacionRepository;
    private $portafolioPublicoService;
    private $configuracionRepository;
    private $portafolioRepository;

    public function __construct(
        PortafolioPublicacionRepository $publicacionRepository,
        PortafolioPublicoService $portafolioPublicoService,
        ConfiguracionPrivacidadRepository $configuracionRepository,
        PortafolioRepository $portafolioRepository
    ) {
        $this->publicacionRepository = $publicacionRepository;
        $this->portafolioPublicoService = $portafolioPublicoService;
        $this->configuracionRepository = $configuracionRepository;
        $this->portafolioRepository = $portafolioRepository;
    }

    public function show(string $slug)
    {
        try {
            // Acepta el portafolio si está publicado en plataforma O si tiene enlace activo.
            $publicacion = $this->publicacionRepository->buscarPublicadoPorSlug($slug)
                        ?? $this->publicacionRepository->buscarPorSlugConEnlaceActivo($slug);

            if (!$publicacion) {
                return response()->json([
                    'message' => 'El portafolio no esta disponible.',
                ], 404);
            }

            return response()->json([
                'portafolio' => $this->portafolioPublicoService->construirPortafolioPublico($publicacion->usuario_id),
            ]);
        } catch (\Throwable $exception) {
            Log::error('Error al consultar portafolio publico', [
                'slug'  => $slug,
                'error' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudo cargar el portafolio publico. Intenta nuevamente.',
            ], 500);
        }
    }

    public function registrarContacto(Request $request, string $slug)
    {
        try {
            $publicacion = $this->publicacionRepository->buscarPublicadoPorSlug($slug)
                        ?? $this->publicacionRepository->buscarPorSlugConEnlaceActivo($slug);

            if (!$publicacion) {
                return response()->json([
                    'message' => 'El portafolio no esta disponible.',
                ], 404);
            }

            $configuracion = $this->configuracionRepository->obtenerOCrearPorUsuario($publicacion->usuario_id);
            $correo = $this->portafolioRepository->correoContacto($publicacion->usuario_id);

            if (
                !$configuracion->seccionEsPublica('seccion_perfil') ||
                !$configuracion->mostrar_correo ||
                $correo === null
            ) {
                return response()->json([
                    'message' => 'El contacto directo no esta disponible.',
                ], 404);
            }

            PortafolioContactoEvento::create([
                'publicacion_id' => $publicacion->id_publicacion,
                'usuario_id_propietario' => $publicacion->usuario_id,
                'slug_publico' => $publicacion->slug_publico,
                'medio' => 'email',
                'ip_hash' => $request->ip() ? hash('sha256', $request->ip()) : null,
                'user_agent' => substr((string) $request->userAgent(), 0, 500),
            ]);

            return response()->json([
                'message' => 'Contacto registrado correctamente.',
                'mailto' => 'mailto:' . $correo,
            ]);
        } catch (\Throwable $exception) {
            Log::error('Error al registrar contacto directo', [
                'slug' => $slug,
                'error' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudo registrar el contacto directo.',
            ], 500);
        }
    }
}
