<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PortafolioExploracionService;
use App\Services\PortafolioPublicacionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DashboardPortafolioController extends Controller
{
    private $publicacionService;
    private $exploracionService;

    public function __construct(
        PortafolioPublicacionService $publicacionService,
        PortafolioExploracionService $exploracionService
    ) {
        $this->publicacionService = $publicacionService;
        $this->exploracionService = $exploracionService;
    }

    public function show(Request $request)
    {
        $data = $request->validate([
            'limite' => 'sometimes|integer|min:1|max:30',
        ]);

        try {
            $usuario = $request->user();

            return response()->json([
                'publicacion' => $this->publicacionService->obtenerEstado($usuario),
                'portafolios' => $this->exploracionService->listarPortafoliosAjenos(
                    $usuario->id_usuario,
                    $data['limite'] ?? null
                ),
            ]);
        } catch (\Throwable $exception) {
            Log::error('Error al cargar dashboard de portafolios', [
                'usuario_id' => $request->user()->id_usuario,
                'error' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudo cargar el dashboard. Intenta nuevamente.',
            ], 500);
        }
    }
}
