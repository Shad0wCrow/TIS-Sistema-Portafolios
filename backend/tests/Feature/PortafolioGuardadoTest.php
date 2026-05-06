<?php

namespace Tests\Feature;

use App\Models\Usuario;
use App\Services\PortafolioGuardadoService;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Illuminate\Validation\ValidationException;

class PortafolioGuardadoTest extends TestCase
{
    public function test_usuario_autenticado_puede_listar_portafolios_guardados()
    {
        $usuario = $this->usuarioAutenticado();

        $this->mock(PortafolioGuardadoService::class, function ($mock) use ($usuario) {
            $mock->shouldReceive('listar')
                ->once()
                ->with($usuario)
                ->andReturn([
                    [
                        'id_guardado' => 1,
                        'slug_publico' => 'ana-dev-abc123',
                        'nombre' => 'Ana Dev',
                        'profesion' => 'Desarrolladora Backend',
                        'foto_url' => null,
                        'disponible' => true,
                    ],
                ]);
        });

        $response = $this->getJson('/api/portafolios/guardados');

        $response
            ->assertOk()
            ->assertJsonPath('guardados.0.slug_publico', 'ana-dev-abc123')
            ->assertJsonPath('guardados.0.nombre', 'Ana Dev');
    }

    public function test_usuario_autenticado_puede_guardar_portafolio_ajeno()
    {
        $usuario = $this->usuarioAutenticado();

        $this->mock(PortafolioGuardadoService::class, function ($mock) use ($usuario) {
            $mock->shouldReceive('guardar')
                ->once()
                ->with($usuario, 'ana-dev-abc123')
                ->andReturn([
                    'guardado' => true,
                    'portafolio' => [
                        'slug_publico' => 'ana-dev-abc123',
                    ],
                ]);
        });

        $response = $this->postJson('/api/portafolios/ana-dev-abc123/guardar');

        $response
            ->assertCreated()
            ->assertJsonPath('data.guardado', true)
            ->assertJsonPath('message', 'Portafolio guardado correctamente.');
    }

    public function test_usuario_autenticado_recibe_mensaje_si_portafolio_ya_esta_guardado()
    {
        $usuario = $this->usuarioAutenticado();

        $this->mock(PortafolioGuardadoService::class, function ($mock) use ($usuario) {
            $mock->shouldReceive('guardar')
                ->once()
                ->with($usuario, 'ana-dev-abc123')
                ->andThrow(ValidationException::withMessages([
                    'portafolio' => ['Este portafolio ya esta en tu lista de guardados.'],
                ]));
        });

        $response = $this->postJson('/api/portafolios/ana-dev-abc123/guardar');

        $response
            ->assertStatus(422)
            ->assertJsonPath('errors.portafolio.0', 'Este portafolio ya esta en tu lista de guardados.');
    }

    public function test_usuario_autenticado_puede_eliminar_portafolio_guardado()
    {
        $usuario = $this->usuarioAutenticado();

        $this->mock(PortafolioGuardadoService::class, function ($mock) use ($usuario) {
            $mock->shouldReceive('eliminar')
                ->once()
                ->with($usuario, 'ana-dev-abc123')
                ->andReturn(['guardado' => false]);
        });

        $response = $this->deleteJson('/api/portafolios/ana-dev-abc123/guardar');

        $response
            ->assertOk()
            ->assertJsonPath('data.guardado', false);
    }

    public function test_guardar_portafolio_requiere_autenticacion()
    {
        $response = $this->postJson('/api/portafolios/ana-dev-abc123/guardar');

        $response->assertUnauthorized();
    }

    private function usuarioAutenticado(): Usuario
    {
        $usuario = new Usuario();
        $usuario->forceFill([
            'id_usuario' => 10,
            'correo' => 'usuario@test.com',
            'nombre_usuario' => 'usuario_actual',
        ]);

        Sanctum::actingAs($usuario);

        return $usuario;
    }
}
