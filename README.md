# DON PEDRO 🏪

DON PEDRO es un simulador mobile-first de una tiendita mexicana, con gráficos 3D Low Poly coloridos y una estética retro inspirada en PS1/PS2.

El proyecto se desarrolla pensando primero en celulares y tablets Android. La primera versión es un prototipo jugable de movimiento, cámara e interacción táctil.

## Identidad visual

- 3D Low Poly colorido con nostalgia PS1/PS2.
- Tiendita mexicana de barrio: estantes, botanas, mostrador y refrigerador rojo de bebidas.
- Don Pedro: sombrero vaquero blanco, bigote gris, camisa azul de rayas y pantalón oscuro.
- Modelos geométricos ligeros para cuidar el rendimiento móvil.

## Controles

- Joystick fijo: caminar.
- Arrastrar por el mundo: girar la cámara.
- Pellizcar con dos dedos: alejar o acercar la cámara.
- Mantener pulsado un objeto interactivo: realizar una acción. En el prototipo, mantener pulsado el refrigerador lo abre o lo cierra.
- Primera persona: se activa al acercar el zoom al máximo.

No hay botones de acción flotantes. La interacción se realiza directamente sobre los objetos del mundo.

## Tecnología

- Three.js para el escenario y la cámara 3D.
- Vite para desarrollo y compilación.
- GitHub Actions para construir y publicar en GitHub Pages.
- Web App Manifest configurado para modo fullscreen y orientación horizontal.
- Preparado para incorporar Capacitor más adelante y distribuir una APK Android.

## Desarrollo local

Se necesita Node.js 22.12 o superior.

Comandos:

    npm install
    npm run dev

Vite mostrará la dirección local para abrir el prototipo.

Para generar la versión de producción:

    npm run build

Los archivos finales se generan en la carpeta dist/.

## Publicar con GitHub Pages

1. Abre Settings → Pages en el repositorio.
2. En Build and deployment, selecciona GitHub Actions como fuente.
3. Guarda los cambios.
4. Cada push a main ejecutará el workflow de .github/workflows/deploy.yml.

La dirección prevista del prototipo es:

https://jhooni467.github.io/Don-Pedro/

## Pantalla completa y Android

El manifiesto solicita display: fullscreen cuando el juego se instala como aplicación web compatible. El navegador también intenta solicitar pantalla completa después del primer gesto del usuario.

Una página web normal no puede garantizar por sí sola que Android o todos los navegadores oculten siempre la barra de estado. Para garantizar el modo inmersivo en la futura APK, se añadirá la configuración nativa de Android mediante Capacitor.

## Alcance del prototipo 0.1

Incluye:
- Tienda 3D inicial.
- Personaje provisional de Don Pedro.
- Joystick fijo.
- Cámara con zoom desde vista alta hasta primera persona.
- Interacción por pulsación prolongada con el refrigerador.

Todavía no incluye clientes, inventario real, caja funcional, proveedores, guardado ni progresión económica. Se incorporarán por etapas después de validar el movimiento y la interacción.
