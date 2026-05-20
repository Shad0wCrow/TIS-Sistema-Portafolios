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
use App\Http\Controllers\Api\VisibilidadController;
use App\Http\Controllers\Api\PortafolioPublicacionController;
use App\Http\Controllers\Api\PortafolioPublicoController;
use App\Http\Controllers\Api\PortafoliosPublicosController;
use App\Http\Controllers\Api\PortafolioGuardadoController;
use App\Http\Controllers\Api\DashboardPortafolioController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ReportePortafolioController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::get('/public/portafolios/{slug}', [PortafolioPublicoController::class, 'show']);
Route::post('/public/portafolios/{slug}/contacto', [PortafolioPublicoController::class, 'registrarContacto']);
Route::post('/public/portafolios/{slug}/visualizacion', [PortafolioPublicoController::class, 'registrarVisualizacion']);

// HU-61: Reportar portafolio â accesible sin autenticación obligatoria
Route::post('/public/portafolios/{slug}/reportar', [ReportePortafolioController::class, 'reportar']);

// Rutas protegidas 
Route::middleware('auth:sanctum')->group(function () {


    Route::get('/me',      [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);


    Route::get('/perfil/me', [PerfilController::class, 'me']);
    Route::post('/perfil',   [PerfilController::class, 'store']);
    Route::put('/perfil',    [PerfilController::class, 'update']);

    // Pantalla "Edición de Portafolio" 
    Route::get('/dashboard/portafolios',          [DashboardPortafolioController::class, 'show']);
    Route::get('/portafolio',                     [PortafolioController::class, 'show']);
    Route::get('/portafolios/publicos',           [PortafoliosPublicosController::class, 'index']);
    Route::get('/portafolios/guardados',          [PortafolioGuardadoController::class, 'index']);
    Route::get('/portafolios/{slug}/guardado',    [PortafolioGuardadoController::class, 'estado']);
    Route::post('/portafolios/{slug}/guardar',    [PortafolioGuardadoController::class, 'store']);
    Route::delete('/portafolios/{slug}/guardar',  [PortafolioGuardadoController::class, 'destroy']);
    Route::get('/portafolio/publicacion',         [PortafolioPublicacionController::class, 'show']);
    Route::post('/portafolio/publicar',           [PortafolioPublicacionController::class, 'publicar']);
    Route::post('/portafolio/despublicar',        [PortafolioPublicacionController::class, 'despublicar']);
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


    Route::get('/cursos/sugerencias', [CursoController::class, 'sugerencias']);
    Route::get('/cursos', [CursoController::class, 'index']);
    Route::get('/cursos/{id}', [CursoController::class, 'show']);
    Route::post('/cursos', [CursoController::class, 'store']);
    Route::delete('/cursos/{id}', [CursoController::class, 'destroy']);

    Route::get('/logros/sugerencias', [LogroController::class, 'sugerencias']);
    Route::get('/logros', [LogroController::class, 'index']);
    Route::get('/logros/{id}', [LogroController::class, 'show']);
    Route::post('/logros', [LogroController::class, 'store']);
    Route::delete('/logros/{id}', [LogroController::class, 'destroy']);

    Route::get('/experiencias/sugerencias', [ExperienciaController::class, 'sugerencias']);
    Route::get('/experiencias', [ExperienciaController::class, 'index']);
    Route::get('/experiencias/{id}', [ExperienciaController::class, 'show']);
    Route::put('/experiencias/{id}', [ExperienciaController::class, 'update']);
    Route::post('/experiencias', [ExperienciaController::class, 'store']);
    Route::delete('/experiencias/{id}', [ExperienciaController::class, 'destroy']);

    Route::get('/certificaciones/sugerencias', [CertificacionController::class, 'sugerencias']);
    Route::get('/certificaciones', [CertificacionController::class, 'index']);
    Route::get('/certificaciones/{id}', [CertificacionController::class, 'show']);
    Route::post('/certificaciones', [CertificacionController::class, 'store']);
    Route::delete('/certificaciones/{id}', [CertificacionController::class, 'destroy']);

    Route::get('/idiomas/sugerencias', [IdiomaController::class, 'sugerencias']);
    Route::get('/idiomas', [IdiomaController::class, 'index']);
    Route::get('/idiomas/{id}', [IdiomaController::class, 'show']);
    Route::post('/idiomas', [IdiomaController::class, 'store']);
    Route::delete('/idiomas/{id}', [IdiomaController::class, 'destroy']);

    // HU-23: Configuración de visibilidad de secciones del portafolio
    Route::get('/visibilidad/secciones',  [VisibilidadController::class, 'show']);
    Route::put('/visibilidad/secciones',  [VisibilidadController::class, 'update']);

    Route::get('/perfil/sugerencias-profesion', [PerfilController::class, 'sugerenciasProfecion']);

    //Para crear enlaces públicos de portafolio
    Route::post('/portafolio/enlace/generar',  [PortafolioPublicacionController::class, 'generarEnlace']);
    Route::post('/portafolio/enlace/revocar',  [PortafolioPublicacionController::class, 'revocarEnlace']);

    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/usuarios', [AdminController::class, 'usuarios']);
        Route::patch('/usuarios/{id}/estado', [AdminController::class, 'actualizarEstadoUsuario']);
        Route::get('/reportes/resumen', [AdminController::class, 'reporteResumen']);

        // HU-40: Estadísticas e indicadores
        Route::get('/estadisticas/usuarios', [AdminController::class, 'estadisticasUsuarios']);
        Route::get('/estadisticas/portafolios', [AdminController::class, 'estadisticasPortafolios']);

        // HU-61: Gestión de reportes de portafolios
        Route::get('/reportes/portafolios', [ReportePortafolioController::class, 'index']);
        Route::patch('/reportes/portafolios/{id}/resolver', [ReportePortafolioController::class, 'resolver']);
    });
    });