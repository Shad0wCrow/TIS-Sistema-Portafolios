<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PortafolioGuardadoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PortafolioGuardadoController extends Controller
{
    private $guardadoService;

    public function __construct(PortafolioGuardadoService $guardadoService)
    {
        $this->guardadoService = $guardadoService;
    }

    public function index(Request $request)
    {
        try {
            return response()->json([
                'guardados' => $this->guardadoService->listar($request->user()),
            ]);
        } catch (\Throwable $exception) {
            Log::error('Error al listar portafolios guardados', [
                'usuario_id' => $request->user()->id_usuario,
                'error' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudieron cargar los portafolios guardados. Intenta nuevamente.',
            ], 500);
        }
    }

    public function estado(Request $request, string $slug)
    {
        return response()->json($this->guardadoService->estado($request->user(), $slug));
    }

    public function store(Request $request, string $slug)
    {
        try {
            return response()->json([
                'message' => 'Portafolio guardado correctamente.',
                'data' => $this->guardadoService->guardar($request->user(), $slug),
            ], 201);
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (\Throwable $exception) {
            Log::error('Error al guardar portafolio', [
                'usuario_id' => $request->user()->id_usuario,
                'slug' => $slug,
                'error' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudo guardar el portafolio. Intenta nuevamente.',
            ], 500);
        }
    }

    public function destroy(Request $request, string $slug)
    {
        try {
            return response()->json([
                'message' => 'Portafolio eliminado de guardados correctamente.',
                'data' => $this->guardadoService->eliminar($request->user(), $slug),
            ]);
        } catch (\Throwable $exception) {
            Log::error('Error al eliminar portafolio guardado', [
                'usuario_id' => $request->user()->id_usuario,
                'slug' => $slug,
                'error' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudo eliminar el portafolio guardado. Intenta nuevamente.',
            ], 500);
        }
    }
}
