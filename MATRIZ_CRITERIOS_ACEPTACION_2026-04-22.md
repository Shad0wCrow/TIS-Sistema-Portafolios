# Matriz de criterios de aceptacion - 2026-04-22

Fuentes revisadas:

- `C:\Users\GUZMAN\Downloads\Historias de usuario (1).pdf`
- `C:\Users\GUZMAN\Downloads\Historias de usuario.pdf`

Archivos auxiliares generados para lectura:

- `Historias_de_usuario_1_decoded.txt`
- `Historias_de_usuario_decoded.txt`

## Resumen ejecutivo

El sistema cumple una parte importante de las historias base: registrar perfil, crear/editar/eliminar proyectos, registrar/eliminar educacion, cursos, logros, certificaciones, experiencias e idiomas.

No cumple todos los criterios de aceptacion. Los faltantes principales estan en validaciones finas, carga real de imagenes/fotos, accesibilidad completa por teclado/lector de pantalla, autocompletado de profesion, edicion completa de algunas entidades y algunos mensajes exactos esperados por los criterios.

Durante esta revision se implemento un faltante claro:

- Eliminacion de idiomas desde la UI, usando el endpoint existente `DELETE /api/idiomas/{id}`.

## Cambios aplicados en esta revision

### Eliminar idiomas

Antes:

- El backend tenia la ruta `DELETE /api/idiomas/{id}`.
- El frontend no tenia servicio `removeIdioma`.
- La tarjeta de idiomas no mostraba boton de eliminar.
- La pantalla no conectaba confirmacion ni actualizacion local.

Ahora:

- Se agrego `removeIdioma` en `front-portafolio/src/services/portafolioservice.ts`.
- Se agrego boton de eliminar en `front-portafolio/src/pages/editPortafolio/components/idiomaCard.tsx`.
- Se agrego `handleRemoveIdioma` en `front-portafolio/src/pages/editPortafolio/edicionPortafolio.tsx`.
- Se usa modal de confirmacion antes de eliminar.
- Se actualiza la lista local sin recargar todo.

Verificacion:

```bash
npm run build
```

Resultado: build exitoso al ejecutarlo con permisos elevados por bloqueo `spawn EPERM` de Windows/esbuild en sandbox.

## Cumplimiento por historia

### Sprint 1

| Historia | Estado | Evidencia | Faltantes principales |
|---|---|---|---|
| HU01 Registrar informacion basica del perfil | Parcial | Formulario de crear perfil, validaciones de nombre, apellido, celular y descripcion; backend guarda perfil. | Falta autocompletado/recomendaciones de profesion al escribir 4 letras. Falta carga real de foto de perfil. Algunos mensajes no coinciden exactamente con PDF. |
| HU02 Editar informacion basica del perfil | Parcial | Modal de editar perfil y endpoint `PUT /portafolio/perfil`. | Falta carga real/cambio de foto desde archivo. Falta validacion completa de imagen JPG/JPEG/PNG y tamano para foto de perfil. |
| HU03 Crear portafolio digital | Parcial | Existen rutas/vistas de portafolio y modal de crear portafolio. | Revisar criterios exactos de flujo Crear/Omitir y visualizacion de secciones; no esta completamente validado con pruebas. |
| HU04 Registrar proyecto de software | Parcial | Modal de proyecto, endpoint `POST /portafolio/proyectos`, guarda titulo, descripcion, fechas, roles, demo y repo. | Falta carga real de imagen de proyecto. Falta validacion frontend de URLs y fechas. Falta manejo completo de accesibilidad por teclado. |
| HU05 Editar proyecto de software | Parcial | Endpoint `PUT /portafolio/proyectos/{id}` y modal con datos existentes. | Falta validacion frontend mas estricta para campos obligatorios/URLs/fechas. |
| HU06 Registrar habilidades tecnicas y blandas | Parcial | Catalogo de habilidades, modal para agregar habilidad y backend evita duplicados. | Los criterios hablan de ingresar texto libre con boton `+`; la implementacion usa catalogo/select. Si el PDF exige texto libre, falta adaptar o justificar. |
| HU07 Editar habilidades tecnicas y blandas | Parcial | Se pueden eliminar habilidades con confirmacion. | Falta edicion completa de habilidad/nivel si el criterio exige modificar una habilidad existente. |

### Sprint 2

| Historia | Estado | Evidencia | Faltantes principales |
|---|---|---|---|
| HU01 Registrar educacion | Parcial | Modal de educacion, validaciones requeridas, sugerencias de institucion y endpoint `POST /educacion`. | El PDF menciona foto; la implementacion actual no guarda foto de educacion. Revisar mensajes exactos y accesibilidad. |
| HU02 Eliminar educacion | Cumple mayormente | Boton eliminar, modal de confirmacion, endpoint `DELETE /educacion/{id}` y actualizacion local. | Verificar visualmente mensajes exactos. |
| HU03 Registrar experiencia laboral | Parcial | Modal y endpoint `POST /experiencias`. | Falta ruta backend `PUT /experiencias/{id}` para editar, aunque el frontend la llama. Revisar validaciones de fechas/mensajes. |
| HU04 Eliminar experiencia laboral | Cumple mayormente | Boton eliminar, confirmacion y endpoint `DELETE /experiencias/{id}`. | Verificar estados vacios y mensajes exactos. |
| HU05 Registrar certificaciones | Parcial | Modal, validaciones, sugerencias de entidad, endpoint `POST /certificaciones`. | La imagen se guarda en `localStorage`, no en backend. Falta persistencia real de imagen si el criterio la exige. |
| HU06 Eliminar certificaciones | Cumple mayormente | Boton eliminar, confirmacion, endpoint `DELETE /certificaciones/{id}` y limpieza de imagen local. | Verificar mensajes exactos y estados vacios. |
| HU07 Registrar cursos | Parcial | Modal curso, validaciones de fechas, endpoint `POST /cursos`. | Imagen del curso solo se previsualiza; no se envia ni persiste. Revisar mensajes exactos. |
| HU08 Eliminar cursos | Cumple mayormente | Boton eliminar, confirmacion y endpoint `DELETE /cursos/{id}`. | Verificar mensajes exactos. |
| HU09 Registrar logros/reconocimientos | Parcial | Modal logro, entidad, fecha, identificador y endpoint `POST /logros`. | Revisar validacion de formato de ID credencial y mensajes exactos. |
| HU10 Eliminar logros | Cumple mayormente | Boton eliminar, confirmacion y endpoint `DELETE /logros/{id}`. | Verificar mensajes exactos y estados vacios. |
| HU11 Registrar idiomas | Parcial | Modal idioma, seleccion de nivel y endpoint `POST /idiomas`. | Revisar criterios de caracteres invalidos/numeros y duplicados contra mensajes exactos. |
| HU12 Eliminar idiomas | Cumple mayormente | Implementado en esta revision: boton eliminar, confirmacion, endpoint `DELETE /idiomas/{id}` y actualizacion local. | Verificar manualmente en UI con un idioma real. |

## Criterios transversales detectados

| Tema | Estado | Comentario |
|---|---|---|
| Guardado en base de datos | Parcial/Cumple segun entidad | La mayoria de entidades guardan en backend. Imagenes/fotos no siempre se persisten en DB. |
| Validacion de campos obligatorios | Parcial | Existe en varios modales, pero no siempre coincide con el texto exacto del PDF. |
| Validacion de fechas | Parcial | Educacion/curso/logro tienen validaciones; proyecto necesita fortalecerse. |
| Confirmacion antes de eliminar | Cumple mayormente | Se usa `ModalAlert` para varias eliminaciones. |
| Cancelar eliminacion sin cambios | Cumple mayormente | `ModalAlert` permite cancelar sin llamar al endpoint. |
| Estado vacio cuando no hay registros | Parcial | Existen estados vacios en algunas tarjetas, no confirmado en todas. |
| Accesibilidad por teclado | Parcial | Hay botones HTML, pero falta auditoria de foco, `aria-label`, orden de tabulacion y acciones completas sin mouse. |
| Lectores de pantalla | Parcial | Hay algunos `aria-label`, pero no es sistematico. |
| Carga de archivos | Bajo/Parcial | Hay previsualizaciones en algunos modales, pero falta persistencia backend para foto/imagenes segun criterios. |
| Feedback de carga | Cumple mayormente | Se implementaron spinners y bloqueo de clicks repetidos en acciones lentas. |

## Recomendaciones para lograr cumplimiento completo

Prioridad alta:

1. Implementar persistencia real de imagenes/fotos en backend o definir si se guardaran como URL/base64.
2. Agregar ruta `PUT /api/experiencias/{id}` o quitar edicion de experiencia del frontend.
3. Fortalecer validaciones de proyecto: fechas, URL demo/repositorio, campos requeridos y mensajes.
4. Implementar autocompletado de profesion al escribir 4 letras.
5. Hacer revision de accesibilidad: `aria-label`, foco visible, navegacion por teclado y textos alternativos.

Prioridad media:

1. Normalizar mensajes de error para que coincidan con los criterios.
2. Revisar duplicados: habilidades, idiomas, logros/certificaciones con identificador.
3. Confirmar estados vacios en todas las listas.
4. Agregar pruebas manuales o checklist por historia.

## Conclusión

Si se puede hacer que el sistema cumpla todos los criterios, pero no conviene hacerlo en un solo cambio grande. Hay que hacerlo por bloques para no romper lo funcional:

1. Perfil y fotos.
2. Proyectos y validaciones.
3. Experiencia laboral y ruta de edicion.
4. Imagenes de educacion/cursos/certificaciones.
5. Accesibilidad y mensajes exactos.

En esta revision quedo implementado un faltante del PDF: eliminar idiomas.
