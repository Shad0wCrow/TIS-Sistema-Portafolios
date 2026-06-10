<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PortafolioExploracionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PortafoliosPublicosController extends Controller
{
    private $exploracionService;

    public function __construct(PortafolioExploracionService $exploracionService)
    {
        $this->exploracionService = $exploracionService;
    }

    public function index(Request $request)
    {
        $data = $request->validate([
            'limite' => 'sometimes|integer|min:1|max:30',
            'q'      => 'sometimes|nullable|string|min:2|max:80',
        ]);

        try {
            return response()->json([
                'portafolios' => $this->exploracionService->listarPortafoliosAjenos(
                    $request->user()->id_usuario,
                    $data['limite'] ?? null,
                    $data['q'] ?? null
                ),
            ]);
        } catch (\Throwable $exception) {
            Log::error('Error al listar portafolios publicos', [
                'usuario_id' => $request->user()->id_usuario,
                'error'      => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudieron cargar los portafolios. Intenta nuevamente.',
            ], 500);
        }
    }

    /**
     * Top 3 del mes anterior. Los datos provienen de ranking_mensual (ya calculado y cerrado).
     * Si aún no existe el ranking del mes anterior devuelve un array vacío.
     */
    public function ranking()
    {
        try {
            $periodo = now()->subMonth();

            return response()->json([
                'portafolios' => $this->exploracionService->obtenerTopMensual(),
                'periodo'     => [
                    'mes'   => $periodo->month,
                    'anio'  => $periodo->year,
                    'label' => ucfirst($periodo->locale('es')->translatedFormat('F Y')),
                ],
            ]);
        } catch (\Throwable $exception) {
            Log::error('Error al obtener ranking mensual', [
                'error' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudo cargar el ranking. Intenta nuevamente.',
            ], 500);
        }
    }
}