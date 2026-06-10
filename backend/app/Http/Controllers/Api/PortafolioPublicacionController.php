<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\PortafolioPublicacionRepository;
use App\Services\PortafolioPublicacionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PortafolioPublicacionController extends Controller
{
    private $publicacionService;
    private $publicacionRepository;

    public function __construct(
        PortafolioPublicacionService $publicacionService,
        PortafolioPublicacionRepository $publicacionRepository
    ) {
        $this->publicacionService   = $publicacionService;
        $this->publicacionRepository = $publicacionRepository;
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
                'message'     => 'Portafolio publicado correctamente.',
                'publicacion' => $this->publicacionService->publicar($request->user()),
            ]);
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (\Throwable $exception) {
            Log::error('Error al publicar portafolio', [
                'usuario_id' => $request->user()->id_usuario,
                'error'      => $exception->getMessage(),
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
                'message'     => 'Portafolio despublicado correctamente.',
                'publicacion' => $this->publicacionService->despublicar($request->user()),
            ]);
        } catch (\Throwable $exception) {
            Log::error('Error al despublicar portafolio', [
                'usuario_id' => $request->user()->id_usuario,
                'error'      => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudo despublicar el portafolio. Intenta nuevamente.',
            ], 500);
        }
    }

    public function generarEnlace(Request $request)
    {
        try {
            return response()->json([
                'message'     => 'Enlace publico generado correctamente.',
                'publicacion' => $this->publicacionService->generarEnlace($request->user()),
            ]);
        } catch (\Throwable $exception) {
            Log::error('Error al generar enlace publico', [
                'usuario_id' => $request->user()->id_usuario,
                'error'      => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudo generar el enlace. Intenta nuevamente.',
            ], 500);
        }
    }

    public function revocarEnlace(Request $request)
    {
        try {
            return response()->json([
                'message'     => 'Enlace revocado correctamente.',
                'publicacion' => $this->publicacionService->revocarEnlace($request->user()),
            ]);
        } catch (\Throwable $exception) {
            Log::error('Error al revocar enlace publico', [
                'usuario_id' => $request->user()->id_usuario,
                'error'      => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudo revocar el enlace. Intenta nuevamente.',
            ], 500);
        }
    }

    public function guardarColor(Request $request)
    {
        $request->validate([
            'color_acento' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);

        try {
            $this->publicacionRepository->guardarColorAcento(
                $request->user()->id_usuario,
                $request->input('color_acento')
            );

            return response()->json(['message' => 'Color guardado correctamente.']);
        } catch (\Throwable $exception) {
            Log::error('Error al guardar color de acento', [
                'usuario_id' => $request->user()->id_usuario,
                'error'      => $exception->getMessage(),
            ]);

            return response()->json(['message' => 'No se pudo guardar el color.'], 500);
        }
    }
}