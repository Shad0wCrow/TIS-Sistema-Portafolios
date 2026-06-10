<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Illuminate\Support\Facades\DB;

class AdminEstadisticasTest extends TestCase
{
    use DatabaseTransactions;

    protected function crearAdmin()
    {
        $admin = new Usuario();
        $admin->forceFill([
            'correo' => 'admin_test@test.com',
            'nombre_usuario' => 'admin_test',
            'contrasenia' => bcrypt('password'),
            'rol' => 'admin',
            'eliminado' => false,
        ]);
        $admin->save();
        return $admin;
    }

    protected function crearUsuarioEstandar()
    {
        $usuario = new Usuario();
        $usuario->forceFill([
            'correo' => 'usuario_test@test.com',
            'nombre_usuario' => 'usuario_test',
            'contrasenia' => bcrypt('password'),
            'rol' => 'user',
            'eliminado' => false,
        ]);
        $usuario->save();
        return $usuario;
    }

    public function test_huesped_no_puede_acceder_a_estadisticas_usuarios()
    {
        $response = $this->getJson('/api/admin/estadisticas/usuarios');
        $response->assertUnauthorized();
    }

    public function test_huesped_no_puede_acceder_a_estadisticas_portafolios()
    {
        $response = $this->getJson('/api/admin/estadisticas/portafolios');
        $response->assertUnauthorized();
    }

    public function test_usuario_estandar_es_bloqueado_con_403_en_usuarios()
    {
        $usuario = $this->crearUsuarioEstandar();
        Sanctum::actingAs($usuario);

        $response = $this->getJson('/api/admin/estadisticas/usuarios');
        $response->assertForbidden();
        $response->assertJsonFragment([
            'message' => 'No tienes permisos para acceder al panel de administración.'
        ]);
    }

    public function test_usuario_estandar_es_bloqueado_con_403_en_portafolios()
    {
        $usuario = $this->crearUsuarioEstandar();
        Sanctum::actingAs($usuario);

        $response = $this->getJson('/api/admin/estadisticas/portafolios');
        $response->assertForbidden();
        $response->assertJsonFragment([
            'message' => 'No tienes permisos para acceder al panel de administración.'
        ]);
    }

    public function test_admin_puede_acceder_a_estadisticas_usuarios()
    {
        $admin = $this->crearAdmin();
        Sanctum::actingAs($admin);

        // Test monthly range
        $response = $this->getJson('/api/admin/estadisticas/usuarios?rango=mes');
        $response->assertOk();
        $response->assertJsonStructure([
            'total_usuarios',
            'nuevos_usuarios',
            'crecimiento' => [
                '*' => ['label', 'valor']
            ]
        ]);

        $this->assertGreaterThanOrEqual(1, $response->json('total_usuarios'));
    }

    public function test_admin_puede_acceder_a_estadisticas_portafolios()
    {
        $admin = $this->crearAdmin();
        Sanctum::actingAs($admin);

        // Test year range
        $response = $this->getJson('/api/admin/estadisticas/portafolios?rango=anio');
        $response->assertOk();
        $response->assertJsonStructure([
            'total_historico_activo',
            'periodo_creados',
            'crecimiento' => [
                '*' => ['label', 'valor']
            ],
            'distribucion_profesiones' => [
                '*' => ['profesion', 'total']
            ],
            'profesiones_disponibles'
        ]);
    }

    public function test_estadisticas_portafolios_con_filtro_profesion()
    {
        $admin = $this->crearAdmin();
        Sanctum::actingAs($admin);

        // Add a mock profile with a profession and a publication
        $usuario = $this->crearUsuarioEstandar();
        
        DB::table('perfil')->insert([
            'usuario_id' => $usuario->id_usuario,
            'nombre_perfil' => 'John',
            'apellido_perfil' => 'Doe',
            'profesion' => 'Ingeniero de Software',
            'celular' => '12345678',
            'descripcion' => 'Hola',
            'eliminado' => false,
        ]);

        DB::table('portafolio_publicacion')->insert([
            'usuario_id' => $usuario->id_usuario,
            'slug_publico' => 'john-doe-test',
            'publicado' => true,
            'creado_en' => now(),
            'publicado_en' => now(),
        ]);

        $response = $this->getJson('/api/admin/estadisticas/portafolios?rango=mes&profesion=Ingeniero de Software');
        $response->assertOk();
        $this->assertEquals(1, $response->json('total_historico_activo'));
        $this->assertEquals(1, $response->json('periodo_creados'));
    }

    public function test_estadisticas_con_rango_y_fecha_especifica()
    {
        $admin = $this->crearAdmin();
        Sanctum::actingAs($admin);

        // Test day picker
        $responseHoy = $this->getJson('/api/admin/estadisticas/usuarios?rango=hoy&fecha=2026-05-19');
        $responseHoy->assertOk();
        $this->assertCount(24, $responseHoy->json('crecimiento'));

        // Test week picker
        $responseSemana = $this->getJson('/api/admin/estadisticas/usuarios?rango=semana&fecha=2026-W21');
        $responseSemana->assertOk();
        $this->assertCount(7, $responseSemana->json('crecimiento'));

        // Test month picker
        $responseMes = $this->getJson('/api/admin/estadisticas/usuarios?rango=mes&fecha=2026-05');
        $responseMes->assertOk();
        $this->assertCount(31, $responseMes->json('crecimiento')); // May has 31 days

        // Test year picker
        $responseAnio = $this->getJson('/api/admin/estadisticas/usuarios?rango=anio&fecha=2025');
        $responseAnio->assertOk();
        $this->assertCount(12, $responseAnio->json('crecimiento'));
    }
}
