# DON PEDRO — Hoja de ruta

Este documento separa las funciones implementadas de las siguientes metas. Una tarea no se marca como terminada hasta revisar el código y verificar la compilación; las funciones de juego también requieren pruebas reales en celular o tablet.

## Versión 0.2 — Mundo explorable y controles

Estado: compilación y despliegue de la versión base verificados. Pruebas físicas en dispositivos todavía pendientes.

- [x] Escenario 3D de la tiendita.
- [x] Entrada frontal abierta y suelo conectado a la banqueta.
- [x] Pequeña zona exterior de barrio con calle, casas, árboles y objetos.
- [x] Personaje provisional de Don Pedro.
- [x] Joystick fijo.
- [x] Cámara con zoom desde vista elevada hasta primera persona.
- [x] Gestos táctiles para mirar y hacer zoom.
- [x] Refrigerador interactivo con puerta animada.
- [x] Colisiones básicas para parte del mobiliario y el entorno.
- [ ] Prueba de recorrido y colisiones en celular y tablet.
- [ ] Ajustar límites, sensibilidad y respuesta de cámara según pruebas reales.

## Versión 0.3 — Interacción física con productos (siguiente fase)

Objetivo: que la tiendita empiece a sentirse como un lugar con objetos manipulables, no solo como un escenario para recorrer.

Orden de implementación:

1. Crear un primer producto 3D reconocible y ligero (por ejemplo, una botella de refresco genérica).
2. Permitir seleccionarlo mediante toque prolongado, sin botón de acción.
3. Al recogerlo, mantenerlo delante de Don Pedro o en sus manos, con una posición coherente en primera y tercera persona.
4. Permitir soltarlo sobre una superficie válida, como el mostrador o un estante.
5. Comprobar que no atraviese el suelo, paredes ni mobiliario y que no se quede flotando.
6. Añadir respuesta visual y sonora discreta al recoger y colocar.
7. Reutilizar el mismo sistema para más productos cuando el primero esté probado.

Criterios de aceptación:
- El gesto de arrastrar para mirar no debe recoger objetos accidentalmente.
- El joystick fijo debe seguir funcionando mientras se usa la interacción con la otra mano.
- Recoger, mover y soltar debe poder hacerse con controles táctiles cómodos.
- Ninguna acción debe necesitar un botón flotante.
- Los objetos deben colocarse en superficies permitidas y respetar colisiones.
- La prueba debe realizarse en un teléfono y, cuando sea posible, en una tablet.

## Versión 0.4 — Estanterías e inventario físico

- Colocar productos en espacios de estantes.
- Retirar productos y actualizar cantidades.
- Definir zonas de almacenamiento y cajas de mercancía.
- Indicar visualmente los espacios ocupados y vacíos.

## Versión 0.5 — Primer ciclo de tienda

- Añadir uno o dos clientes de prueba.
- Permitir que el cliente elija un producto.
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

## Registro de cámara — siguiente ajuste

La cámara de seguimiento tenía una interpolación de posición con respuesta 8. En la siguiente revisión se elevó a 22 para reducir el retraso y la sensación flotante. Este ajuste requiere validación en el dispositivo del jugador; no se considera aprobado hasta recibir esa prueba.
