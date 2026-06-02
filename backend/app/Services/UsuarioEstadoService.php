<?php

namespace App\Services;

use App\Models\ReportePortafolio;
use App\Models\Usuario;
use App\Models\UsuarioEstadoHistorial;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Validation\ValidationException;

class UsuarioEstadoService
{
    public function cambiarEstado(
        Usuario $usuario,
        bool $eliminado,
        Usuario $admin,
        string $origen = 'gestion_usuarios',
        ?ReportePortafolio $reporte = null,
        ?string $motivo = null,
        ?string $detalle = null
    ): Usuario {
        $this->validarCambio($usuario, $admin, $eliminado);

        $estadoAnterior = $this->estadoDesdeEliminado((bool) $usuario->eliminado);
        $estadoNuevo = $this->estadoDesdeEliminado($eliminado);

        if ($estadoAnterior === $estadoNuevo) {
            return $usuario;
        }

        $usuario->update(['eliminado' => $eliminado]);

        if ($eliminado) {
            PersonalAccessToken::where('tokenable_type', Usuario::class)
                ->where('tokenable_id', $usuario->id_usuario)
                ->delete();
        }

        UsuarioEstadoHistorial::create([
            'usuario_id' => $usuario->id_usuario,
            'admin_id' => $admin->id_usuario,
            'reporte_id' => $reporte ? $reporte->id_reporte : null,
            'accion' => $eliminado ? 'inhabilitado' : 'habilitado',
            'estado_anterior' => $estadoAnterior,
            'estado_nuevo' => $estadoNuevo,
            'origen' => $origen,
            'motivo' => $motivo,
            'detalle' => $detalle,
            'creado_en' => now(),
        ]);

        return $usuario->fresh() ?: $usuario;
    }

    private function validarCambio(Usuario $usuario, Usuario $admin, bool $inhabilitar): void
    {
        if ((int) $admin->id_usuario === (int) $usuario->id_usuario && $inhabilitar) {
            throw ValidationException::withMessages([
                'usuario' => ['No puedes inhabilitar tu propia cuenta de administrador.'],
            ]);
        }

        if ($usuario->rol === 'admin' && $inhabilitar && $this->esUltimoAdminActivo($usuario)) {
            throw ValidationException::withMessages([
                'usuario' => ['No puedes inhabilitar al último administrador activo.'],
            ]);
        }
    }

    private function esUltimoAdminActivo(Usuario $usuario): bool
    {
        return Usuario::where('rol', 'admin')
            ->where('eliminado', false)
            ->where('id_usuario', '!=', $usuario->id_usuario)
            ->doesntExist();
    }

    private function estadoDesdeEliminado(bool $eliminado): string
    {
        return $eliminado ? 'inhabilitado' : 'activo';
    }
}
