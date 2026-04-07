<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PerfilController;
use App\Http\Controllers\Api\HabilidadController;
use App\Http\Controllers\Api\ProyectoController;
use App\Http\Controllers\Api\PortafolioController;


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
});