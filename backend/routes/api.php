<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

use App\Http\Controllers\Api\PerfilController;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok'
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/perfil/me', [PerfilController::class, 'me']);
    Route::post('/perfil', [PerfilController::class, 'store']);
    Route::put('/perfil', [PerfilController::class, 'update']);
});