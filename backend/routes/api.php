<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PerfilController;
use App\Http\Controllers\Api\HabilidadController;
use App\Http\Controllers\Api\PortafolioController;
use App\Http\Controllers\Api\EducacionController;
use App\Http\Controllers\Api\ExperienciaController;
use App\Http\Controllers\Api\CertificacionController;
use App\Http\Controllers\Api\CursoController;
use App\Http\Controllers\Api\LogroController;
use App\Http\Controllers\Api\IdiomaController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me',      [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Perfil
    Route::get('/perfil/me',                        [PerfilController::class, 'me']);
    Route::get('/perfil/sugerencias-profesion',     [PerfilController::class, 'sugerenciasProfecion']);
    Route::post('/perfil',                          [PerfilController::class, 'store']);

    // Portafolio
    Route::get('/portafolio',                       [PortafolioController::class, 'show']);
    Route::put('/portafolio/perfil',                [PortafolioController::class, 'updatePerfil']);
    Route::post('/portafolio/habilidades',          [PortafolioController::class, 'addHabilidad']);
    Route::delete('/portafolio/habilidades/{id}',   [PortafolioController::class, 'removeHabilidad']);
    Route::post('/portafolio/proyectos',            [PortafolioController::class, 'addProyecto']);
    Route::put('/portafolio/proyectos/{id}',        [PortafolioController::class, 'updateProyecto']);
    Route::delete('/portafolio/proyectos/{id}',     [PortafolioController::class, 'removeProyecto']);

    // Habilidades
    Route::get('/catalogo/habilidades',             [HabilidadController::class, 'catalogo']);
    Route::put('/habilidades/{id}',                 [HabilidadController::class, 'update']);

    // Educación
    Route::get('/educacion/sugerencias',            [EducacionController::class, 'sugerencias']);
    Route::get('/educacion',                        [EducacionController::class, 'index']);
    Route::get('/educacion/{id}',                   [EducacionController::class, 'show']);
    Route::post('/educacion',                       [EducacionController::class, 'store']);
    Route::put('/educacion/{id}',                   [EducacionController::class, 'update']);
    Route::delete('/educacion/{id}',                [EducacionController::class, 'destroy']);

    // Cursos
    Route::get('/cursos/sugerencias',               [CursoController::class, 'sugerencias']);
    Route::get('/cursos',                           [CursoController::class, 'index']);
    Route::get('/cursos/{id}',                      [CursoController::class, 'show']);
    Route::post('/cursos',                          [CursoController::class, 'store']);
    Route::put('/cursos/{id}',                      [CursoController::class, 'update']);
    Route::delete('/cursos/{id}',                   [CursoController::class, 'destroy']);

    // Logros
    Route::get('/logros/sugerencias',               [LogroController::class, 'sugerencias']);
    Route::get('/logros',                           [LogroController::class, 'index']);
    Route::get('/logros/{id}',                      [LogroController::class, 'show']);
    Route::post('/logros',                          [LogroController::class, 'store']);
    Route::put('/logros/{id}',                      [LogroController::class, 'update']);
    Route::delete('/logros/{id}',                   [LogroController::class, 'destroy']);

    // Experiencias
    Route::get('/experiencias/sugerencias',         [ExperienciaController::class, 'sugerencias']);
    Route::get('/experiencias',                     [ExperienciaController::class, 'index']);
    Route::get('/experiencias/{id}',                [ExperienciaController::class, 'show']);
    Route::post('/experiencias',                    [ExperienciaController::class, 'store']);
    Route::put('/experiencias/{id}',                [ExperienciaController::class, 'update']);
    Route::delete('/experiencias/{id}',             [ExperienciaController::class, 'destroy']);

    // Certificaciones
    Route::get('/certificaciones/sugerencias',      [CertificacionController::class, 'sugerencias']);
    Route::get('/certificaciones',                  [CertificacionController::class, 'index']);
    Route::get('/certificaciones/{id}',             [CertificacionController::class, 'show']);
    Route::post('/certificaciones',                 [CertificacionController::class, 'store']);
    Route::put('/certificaciones/{id}',             [CertificacionController::class, 'update']);
    Route::delete('/certificaciones/{id}',          [CertificacionController::class, 'destroy']);

    // Idiomas
    Route::get('/idiomas/sugerencias',              [IdiomaController::class, 'sugerencias']);
    Route::get('/idiomas',                          [IdiomaController::class, 'index']);
    Route::get('/idiomas/{id}',                     [IdiomaController::class, 'show']);
    Route::post('/idiomas',                         [IdiomaController::class, 'store']);
    Route::put('/idiomas/{id}',                     [IdiomaController::class, 'update']);
    Route::delete('/idiomas/{id}',                  [IdiomaController::class, 'destroy']);
});