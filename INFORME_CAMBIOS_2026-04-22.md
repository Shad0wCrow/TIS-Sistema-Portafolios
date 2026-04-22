# Informe de cambios - 2026-04-22

## Objetivo

Implementar indicadores de carga en acciones que demoran, evitar clicks repetidos en botones y revisar problemas detectados durante la prueba del flujo de perfil/portafolio.

## Cambios realizados

### Indicadores de carga en botones

Se agrego un spinner circular y bloqueo de boton mientras una accion asincrona esta en curso.

Archivos principales:

- `front-portafolio/src/components/ui/Button/button.tsx`
- `front-portafolio/src/components/ui/Button/button.module.css`
- `front-portafolio/src/pages/Login/Login.tsx`
- `front-portafolio/src/pages/Login/Login.css`
- `front-portafolio/src/pages/Register/Register.tsx`
- `front-portafolio/src/pages/Register/Register.css`
- `front-portafolio/src/pages/createAccount/createAccount.tsx`
- `front-portafolio/src/pages/createAccount/createAccount-styles.module.css`

Tambien se agrego spinner a los botones de guardar en modales:

- `front-portafolio/src/pages/editPortafolio/components/modalProyecto.tsx`
- `front-portafolio/src/pages/editPortafolio/components/modalEditarPerfil.tsx`
- `front-portafolio/src/pages/editPortafolio/components/modalAgregarHabilidad.tsx`
- `front-portafolio/src/pages/editPortafolio/components/modalCurso.tsx`
- `front-portafolio/src/pages/editPortafolio/components/modalEducacion.tsx`
- `front-portafolio/src/pages/editPortafolio/components/modalIdioma.tsx`
- `front-portafolio/src/pages/editPortafolio/components/modalLogro.tsx`
- `front-portafolio/src/pages/editPortafolio/components/modalCertificacion.tsx`
- `front-portafolio/src/pages/editPortafolio/components/modalExperiencia.tsx`
- `front-portafolio/src/pages/editPortafolio/components/modals.module.css`
- `front-portafolio/src/pages/editPortafolio/components/modalExperiencia.module.css`

### Correccion de error al guardar perfil

Se detecto que el error `500 Internal Server Error` al crear perfil no era causado por el spinner.

Causa encontrada:

- El frontend y backend enviaban/guardaban `apellido_perfil` y `celular`.
- La tabla real `perfil` en Postgres no tenia esas columnas.
- Laravel intentaba insertar columnas inexistentes y respondia 500.

Solucion aplicada:

- Se agrego una migracion idempotente para crear las columnas faltantes solo si no existen.
- Se ejecuto la migracion dentro del contenedor Laravel.

Archivo agregado:

- `backend/database/migrations/2026_04_22_000001_add_apellido_and_celular_to_perfil_table.php`

Comando ejecutado:

```bash
docker exec laravel_backend php artisan migrate --force
```

Verificacion:

- Se confirmo que la tabla `perfil` ahora tiene `apellido_perfil` y `celular`.

### Optimizacion de lentitud despues de acciones

Se detecto que varias acciones hacian la operacion y despues ejecutaban `refreshData()`, que recargaba varias fuentes:

- `getPortafolio()`
- `getExperiencias()`
- `getCertificaciones()`

Esto hacia que acciones como crear proyecto se sintieran lentas, porque la UI esperaba una recarga completa aunque el backend ya hubiera guardado el dato.

Solucion aplicada:

- Se actualizo `front-portafolio/src/pages/editPortafolio/edicionPortafolio.tsx`.
- Ahora varias acciones actualizan el estado local con la respuesta del backend.
- Se evita recargar todo cuando no es necesario.

Acciones optimizadas:

- Crear, editar y eliminar proyectos.
- Guardar perfil.
- Agregar y eliminar habilidades.
- Crear y eliminar educacion.
- Crear y eliminar cursos.
- Crear y eliminar logros.
- Agregar idiomas.
- Crear y eliminar certificaciones.
- Crear y eliminar experiencias.

Nota:

- La edicion de experiencia mantiene una recarga de seguridad porque el frontend llama `PUT /api/experiencias/{id}`, pero Laravel no tiene esa ruta registrada actualmente.

## Verificaciones realizadas

Se ejecuto:

```bash
npm run build
```

Resultado:

- El build sigue fallando por errores TypeScript existentes antes de estos cambios.
- No aparecieron errores nuevos relacionados con los spinners ni con la optimizacion.

Errores pendientes conocidos:

- `front-portafolio/src/pages/editPortafolio/components/experienciaRowList.tsx`: `onEdit` declarado pero no usado.
- `front-portafolio/src/pages/editPortafolio/components/idiomaCard.tsx`: `onRemove` declarado pero no usado.
- `front-portafolio/src/pages/editPortafolio/components/projectRowList.tsx`: import incorrecto hacia `../../types/portafolioTypes`.
- `front-portafolio/src/pages/editPortafolio/components/projectRowList.tsx`: parametros `r` e `i` con tipo implicito `any`.
- `front-portafolio/src/pages/editPortafolio/components/skillCard.tsx`: import incorrecto hacia `../../types/portafolioTypes`.

## Observaciones importantes

- No se modifico `backend/config/cors.php`.
- No se cambio la logica de negocio de guardado.
- Los cambios del spinner bloquean clicks repetidos mientras una accion esta cargando.
- La mejora de velocidad evita llamadas extra despues de respuestas exitosas.
- Se uso Docker para revisar contenedores, logs y esquema de Postgres.

## Comandos relevantes usados

```bash
docker ps
docker logs --tail 120 laravel_backend
docker exec postgres_db psql -U laravel -d laravel -c "\d perfil"
docker exec laravel_backend php artisan migrate --force
npm run build
```

## Pendientes recomendados

1. Probar manualmente crear perfil, crear proyecto y eliminar proyecto desde la UI.
2. Corregir los errores TypeScript existentes para que `npm run build` quede verde.
3. Agregar la ruta `PUT /api/experiencias/{id}` en Laravel o ajustar el frontend si la edicion de experiencia no debe existir.
4. Revisar endpoints que siguen tardando mucho si una accion aun demora varios segundos.
