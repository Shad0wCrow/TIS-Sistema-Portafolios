<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PerfilController;
use App\Http\Controllers\Api\HabilidadController;
use App\Http\Controllers\Api\ProyectoController;
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

// Rutas protegidas 
Route::middleware('auth:sanctum')->group(function () {


    Route::get('/me',      [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);


    Route::get('/perfil/me', [PerfilController::class, 'me']);
    Route::post('/perfil',   [PerfilController::class, 'store']);
    Route::put('/perfil',    [PerfilController::class, 'update']);

    // Pantalla "Edición de Portafolio" 
    Route::get('/portafolio',                     [PortafolioController::class, 'show']);
    Route::put('/portafolio/perfil',              [PortafolioController::class, 'updatePerfil']);
    Route::post('/portafolio/habilidades',         [PortafolioController::class, 'addHabilidad']);
    Route::delete('/portafolio/habilidades/{id}', [PortafolioController::class, 'removeHabilidad']);
    Route::post('/portafolio/proyectos',           [PortafolioController::class, 'addProyecto']);
    Route::put('/portafolio/proyectos/{id}',      [PortafolioController::class, 'updateProyecto']);
    Route::delete('/portafolio/proyectos/{id}',   [PortafolioController::class, 'removeProyecto']);

    // CRUD habilidades 
    Route::get('/catalogo/habilidades',     [HabilidadController::class, 'catalogo']);
    Route::get('/habilidades',              [HabilidadController::class, 'index']);
    Route::post('/habilidades',             [HabilidadController::class, 'store']);
    Route::get('/habilidades/{id}',         [HabilidadController::class, 'show']);
    Route::put('/habilidades/{id}',         [HabilidadController::class, 'update']);
    Route::delete('/habilidades/{id}',      [HabilidadController::class, 'destroy']);

    // CRUD proyectos 
    Route::get('/proyectos',                [ProyectoController::class, 'index']);
    Route::post('/proyectos',               [ProyectoController::class, 'store']);
    Route::get('/proyectos/{id}',           [ProyectoController::class, 'show']);
    Route::put('/proyectos/{id}',           [ProyectoController::class, 'update']);
    Route::delete('/proyectos/{id}',        [ProyectoController::class, 'destroy']);

   

    Route::get('/educacion/sugerencias', [EducacionController::class, 'sugerencias']);
    Route::get('/educacion', [EducacionController::class, 'index']);
    Route::get('/educacion/{id}', [EducacionController::class, 'show']);
    Route::post('/educacion', [EducacionController::class, 'store']);
    Route::delete('/educacion/{id}', [EducacionController::class, 'destroy']);


    Route::get('/cursos', [CursoController::class, 'index']);
    Route::get('/cursos/{id}', [CursoController::class, 'show']);
    Route::post('/cursos', [CursoController::class, 'store']);
    Route::delete('/cursos/{id}', [CursoController::class, 'destroy']);


    Route::get('/logros', [LogroController::class, 'index']);
    Route::get('/logros/{id}', [LogroController::class, 'show']);
    Route::post('/logros', [LogroController::class, 'store']);
    Route::delete('/logros/{id}', [LogroController::class, 'destroy']);


    Route::get('/experiencias', [ExperienciaController::class, 'index']);
    Route::get('/experiencias/{id}', [ExperienciaController::class, 'show']);
    Route::post('/experiencias', [ExperienciaController::class, 'store']);
    Route::delete('/experiencias/{id}', [ExperienciaController::class, 'destroy']);     


    Route::get('/certificaciones', [CertificacionController::class, 'index']);
    Route::get('/certificaciones/{id}', [CertificacionController::class, 'show']);
    Route::post('/certificaciones', [CertificacionController::class, 'store']);
    Route::delete('/certificaciones/{id}', [CertificacionController::class, 'destroy']);        



    Route::get('/idiomas', [IdiomaController::class, 'index']);
    Route::get('/idiomas/{id}', [IdiomaController::class, 'show']);
    Route::post('/idiomas', [IdiomaController::class, 'store']);
    Route::delete('/idiomas/{id}', [IdiomaController::class, 'destroy']);

    });