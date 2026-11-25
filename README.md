# DON PEDRO 🏪

DON PEDRO es un simulador mobile-first de una tiendita mexicana, con gráficos 3D Low Poly coloridos y estética retro inspirada en PS1/PS2.

El juego está pensado para celulares y tablets Android, en orientación horizontal. La tiendita es el centro de un pequeño barrio explorable.

## Identidad visual

- 3D Low Poly colorido con nostalgia PS1/PS2.
- Tiendita de esquina mexicana con estantes, botanas, mostrador y refrigerador rojo de bebidas.
- Don Pedro: sombrero vaquero blanco, bigote gris, camisa azul de rayas y pantalón oscuro.
- Geometría sencilla y materiales ligeros para cuidar el rendimiento móvil.

## Controles táctiles

- Joystick fijo: caminar.
- Deslizar un dedo por el mundo: girar la cámara.
- Deslizar hacia arriba: mirar hacia arriba.
- Deslizar hacia abajo: mirar hacia abajo.
- Pellizcar con dos dedos: acercar o alejar la cámara.
- Mantener pulsado un objeto interactivo: realizar una acción.
- Al acercar el zoom al máximo, la cámara pasa a primera persona.

No hay botones de acción flotantes. La interacción ocurre directamente sobre los objetos.

## Mundo explorable

- Interior de la tiendita con entrada frontal abierta.
- Banqueta y calle conectadas al suelo de la tienda.
- Elementos de barrio: árboles, casas, alumbrado y objetos decorativos.
- Colisiones básicas para paredes, estantes, mostrador, refrigerador y objetos del exterior.
- El escenario no utiliza una plataforma elevada con laterales gruesos.

## Tecnología

- Three.js para el mundo y la cámara 3D.
- Vite para desarrollo y compilación.
- GitHub Actions para compilar y publicar en GitHub Pages.
- Web App Manifest configurado para modo fullscreen y orientación horizontal.
- La futura APK utilizará Capacitor y configuración nativa para modo inmersivo de Android.

## Desarrollo local

Se necesita Node.js 22.12 o superior.

    npm install
    npm run dev

Para generar la versión de producción:

    npm run build

Los archivos de producción se generan en dist/.

## Publicación

En Settings → Pages, selecciona GitHub Actions como fuente de publicación. Cada push a main ejecuta .github/workflows/deploy.yml.

Dirección prevista:

https://jhooni467.github.io/Don-Pedro/

La orientación horizontal se solicita al navegador después del primer gesto. Si el navegador no permite bloquearla, se muestra una pantalla que pide girar el dispositivo. El modo fullscreen del manifiesto se aplica cuando se instala como PWA compatible; para ocultar permanentemente las barras del sistema en Android será necesaria la futura configuración nativa.

## Alcance del prototipo 0.2

Incluye:
- Mundo exterior conectado con la tienda.
- Entrada frontal abierta.
- Don Pedro como personaje provisional.
- Joystick fijo.
- Cámara híbrida con zoom hasta primera persona.
- Gestos táctiles para mirar, hacer zoom e interactuar.
- Refrigerador de bebidas con puerta animada.
- Colisiones básicas.

Todavía no incluye clientes, inventario real, cobros, proveedores, guardado ni progresión económica. Se añadirán después de validar controles y exploración en teléfonos y tablets.
