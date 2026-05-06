<?php

namespace Tests\Feature;

use App\Models\Usuario;
use App\Services\PortafolioExploracionService;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PortafoliosPublicosTest extends TestCase
{
    public function test_usuario_autenticado_puede_listar_portafolios_publicos_ajenos()
    {
        $usuario = new Usuario();
        $usuario->forceFill([
            'id_usuario' => 10,
            'correo' => 'usuario@test.com',
            'nombre_usuario' => 'usuario_actual',
        ]);

        Sanctum::actingAs($usuario);

        $this->mock(PortafolioExploracionService::class, function ($mock) {
            $mock->shouldReceive('listarPortafoliosAjenos')
                ->once()
                ->with(10, 5)
                ->andReturn([
                    [
                        'id_publicacion' => 1,
                        'slug_publico' => 'ana-dev-abc123',
                        'url_publica' => 'http://localhost:5173/portafolio/publico/ana-dev-abc123',
                        'nombre' => 'Ana Dev',
                        'profesion' => 'Desarrolladora Backend',
                        'descripcion' => 'Portafolio profesional',
                        'foto_url' => null,
                        'publicado_en' => '2026-05-05 10:00:00',
                    ],
                ]);
        });

        $response = $this->getJson('/api/portafolios/publicos?limite=5');

        $response
            ->assertOk()
            ->assertJsonPath('portafolios.0.slug_publico', 'ana-dev-abc123')
            ->assertJsonPath('portafolios.0.nombre', 'Ana Dev');

        $tarjeta = $response->json('portafolios.0');

        $this->assertArrayNotHasKey('correo', $tarjeta);
        $this->assertArrayNotHasKey('celular', $tarjeta);
    }

    public function test_listado_de_portafolios_publicos_requiere_autenticacion()
    {
        $response = $this->getJson('/api/portafolios/publicos');

        $response->assertUnauthorized();
    }
}
