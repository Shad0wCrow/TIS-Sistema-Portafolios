<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Perfil;
use App\Models\PortafolioPublicacion;
use App\Models\Usuario;
use App\Services\PortafolioExploracionService;
use App\Services\PortafolioPublicacionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
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

    public function register(Request $request)
    {
        $request->validate([
            'nombre_usuario' => 'required|string|max:100|unique:usuario,nombre_usuario',
            'correo' => 'required|string|email|max:255|unique:usuario,correo',
            'contrasenia' => 'required|string|min:8',
        ]);

        $usuario = Usuario::create([
            'nombre_usuario' => $request->nombre_usuario,
            'correo' => $request->correo,
            'contrasenia' => Hash::make($request->contrasenia),
            'rol' => 'usuario',
            'eliminado' => false,
        ]);

        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'token' => $token,
            'user' => $usuario,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'correo' => 'required|email',
            'contrasenia' => 'required',
        ]);

        $usuario = Usuario::where('correo', $request->correo)
            ->where('eliminado', false)
            ->first();

        if (!$usuario || !Hash::check($request->contrasenia, $usuario->contrasenia)) {
            throw ValidationException::withMessages([
                'correo' => ['Credenciales incorrectas.'],
            ]);
        }

        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login correcto',
            'token' => $token,
            'user' => $usuario,
            'has_profile' => $this->usuarioTienePerfil($usuario),
            'has_portafolio' => $this->usuarioTienePortafolio($usuario),
            'dashboard' => $this->dashboardInicial($usuario),
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    private function dashboardInicial(Usuario $usuario): ?array
    {
        try {
            return [
                'publicacion' => $this->publicacionService->obtenerEstado($usuario),
                'portafolios' => $this->exploracionService->listarPortafoliosAjenos($usuario->id_usuario, 12),
            ];
        } catch (\Throwable $exception) {
            Log::warning('No se pudo precargar dashboard durante login', [
                'usuario_id' => $usuario->id_usuario,
                'error' => $exception->getMessage(),
            ]);

            return null;
        }
    }

    private function usuarioTienePerfil(Usuario $usuario): bool
    {
        return Perfil::where('usuario_id', $usuario->id_usuario)
            ->where('eliminado', false)
            ->exists();
    }

    private function usuarioTienePortafolio(Usuario $usuario): bool
    {
        return $this->usuarioTienePerfil($usuario)
            || PortafolioPublicacion::where('usuario_id', $usuario->id_usuario)->exists();
    }
}
