<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Orden de ejecución estricto según dependencias de FK:
     *
     *  1. PaisRegionSeeder        → pais, region                   (sin deps)
     *  2. CatalogoSeeder          → idioma, habilidad, tecnologia,
     *                               empresa, entidad_emisora,
     *                               categoria_proyecto, tag          (sin deps de usuario)
     *  3. UsuarioPerfilSeeder     → usuario, perfil,
     *                               configuracion_privacidad,
     *                               enlace_personalizado             (depende de region)
     *  4. CurriculumSeeder        → educacion, experiencia,
     *                               certificacion, logro,
     *                               usuario_idioma                   (depende de usuario, empresa,
     *                                                                  entidad_emisora, idioma)
     *  5. HabilidadesSeeder       → usuario_habilidad               (depende de usuario, habilidad)
     *  6. ProyectosSeeder         → proyecto, proyecto_usuario,
     *                               proyecto_tecnologia,
     *                               proyecto_habilidad, proyecto_tag,
     *                               evidencia                        (depende de todo lo anterior)
     */
    public function run(): void
    {
        $this->call([
        
            CatalogoSeeder::class,
            UsuarioPerfilSeeder::class,
            CurriculumSeeder::class,
            HabilidadesSeeder::class,
            ProyectosSeeder::class,
            PortafolioPublicacionSeeder::class,
            DemoPortfoliosSeeder::class,
        ]);
    }
}
