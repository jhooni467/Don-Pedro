# DON PEDRO — Hoja de ruta

Este documento separa las funciones programadas de las verificadas. Ninguna función se declara terminada solo porque el código se haya guardado: la compilación debe pasar y las interacciones deben probarse en celular o tablet.

## Versión 0.2 — Mundo explorable y controles

Estado: la compilación y el despliegue de esta base se verificaron en GitHub Actions. La validación física en dispositivos sigue pendiente.

- Escenario 3D de la tiendita con entrada frontal abierta.
- Banqueta, calle y pequeño sector de barrio con casas, árboles y objetos.
- Personaje provisional de Don Pedro.
- Joystick fijo y cámara híbrida con zoom hasta primera persona.
- Gestos táctiles para mirar y hacer zoom.
- Refrigerador rojo con puerta animada.
- Colisiones básicas para parte del mobiliario y del entorno.

## Versión 0.3 — Interacción contextual y objetos manipulables

Estado: primera implementación escrita en el código. Pendiente de compilación y pruebas táctiles reales.

- Indicador contextual que solo aparece al apuntar a un objeto cercano.
- Contorno de color para señalar el objeto enfocado.
- Prompt contextual con acción e icono: ABRIR, CERRAR, RECOGER o SOLTAR.
- Progreso circular mientras se mantiene pulsado.
- Interacción directa sobre el prompt o manteniendo pulsado el propio objeto.
- Refrigerador: apertura hacia el exterior y cierre animado.
- Botella de refresco de prueba sobre un estante.
- Recoger la botella y transportarla delante de Don Pedro.
- Soltar la botella en el suelo cerca del personaje.

Criterios de aceptación pendientes de pruebas:
- El progreso circular debe avanzar de forma continua y reiniciarse al soltar antes de tiempo.
- El contorno y prompt solo deben aparecer para objetos cercanos y enfocados.
- La acción no debe activarse al arrastrar para mirar ni al pellizcar para hacer zoom.
- No se debe poder interactuar con objetos que estén fuera de alcance.
- La puerta del refrigerador debe girar hacia afuera, sin atravesar su cuerpo.
- La botella debe seguir a Don Pedro sin bloquear el joystick ni la cámara.
- La botella debe poder soltarse y recogerse de nuevo.
- Probar todo en teléfono y tablet, en horizontal.

## Versión 0.4 — Colocación física e inventario

- Colocar productos sobre superficies válidas del mostrador y los estantes.
- Alinear productos con espacios y repisas.
- Evitar que se atraviesen entre sí, las paredes o el mobiliario.
- Almacenar cantidades y reponer productos desde cajas.
- Mostrar espacios ocupados y vacíos.

## Versión 0.5 — Primer ciclo de tienda

- Añadir uno o dos clientes de prueba.
- Permitir que un cliente elija un producto.
- Crear una primera secuencia de venta en mostrador.
- Añadir cobro básico y actualización de caja.

## Más adelante

- Catálogo amplio y proveedores.
- Horarios y jornadas.
- Gastos, ganancias y progresión.
- Decoración y expansión del local.
- Personal y sucursales.
- Guardado persistente.
- Empaquetado Android con modo inmersivo real.

## Registro de cámara

La respuesta de seguimiento se ajustó de 8 a 22 para reducir el retraso de la cámara. El valor queda como ajuste experimental hasta validarlo en el dispositivo del jugador.
