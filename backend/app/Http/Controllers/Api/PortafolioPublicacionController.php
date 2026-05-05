<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PortafolioPublicacionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PortafolioPublicacionController extends Controller
{
    private $publicacionService;

    public function __construct(PortafolioPublicacionService $publicacionService)
    {
        $this->publicacionService = $publicacionService;
    }

    public function show(Request $request)
    {
        return response()->json([
            'publicacion' => $this->publicacionService->obtenerEstado($request->user()),
        ]);
    }

    public function publicar(Request $request)
    {
        try {
            return response()->json([
                'message' => 'Portafolio publicado correctamente.',
                'publicacion' => $this->publicacionService->publicar($request->user()),
            ]);
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (\Throwable $exception) {
            Log::error('Error al publicar portafolio', [
                'usuario_id' => $request->user()->id_usuario,
                'error' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudo publicar el portafolio. Intenta nuevamente.',
            ], 500);
        }
    }

    public function despublicar(Request $request)
    {
        try {
            return response()->json([
                'message' => 'Portafolio despublicado correctamente.',
                'publicacion' => $this->publicacionService->despublicar($request->user()),
            ]);
        } catch (\Throwable $exception) {
            Log::error('Error al despublicar portafolio', [
                'usuario_id' => $request->user()->id_usuario,
                'error' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudo despublicar el portafolio. Intenta nuevamente.',
            ], 500);
        }
    }
}
