<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\PortafolioPublicacionRepository;
use App\Services\PortafolioPublicoService;
use Illuminate\Support\Facades\Log;

class PortafolioPublicoController extends Controller
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

    public function show(string $slug)
    {
        try {
            $publicacion = $this->publicacionRepository->buscarPublicadoPorSlug($slug);

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
                'slug' => $slug,
                'error' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudo cargar el portafolio publico. Intenta nuevamente.',
            ], 500);
        }
    }
}
