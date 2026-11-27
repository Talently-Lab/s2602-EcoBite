# SEO e imágenes del frontend

El dominio público se toma de `docs/deployment.md`: `https://s2602-ecobite.netlify.app`.
Si cambia, actualizar `frontend/index.html`, `frontend/src/components/RouteMetadata.tsx`,
`frontend/public/robots.txt` y `frontend/public/sitemap.xml`.

## Iconos y formatos

- `favicon.ico`: símbolo circular original de EcoBite, con tamaños 16, 32, 48 y 96 px.
- `favicon-96x96.png`: versión cuadrada para buscadores y navegadores.
- `apple-touch-icon.png`: 180 × 180 px, con fondo blanco y margen para iOS.
- `images/og-ecobite.jpg`: tarjeta para compartir enlaces, 1200 × 630 px.
- Las fotografías `image-*.webp` conservan sus dimensiones originales y sustituyen
  las referencias PNG del frontend. Los originales PNG se conservan como fuentes.
- Los logos PNG no se vectorizan automáticamente: falta el archivo SVG original.
  Cambiar la extensión o incrustar un PNG en SVG no produciría un logo vectorial.

## Metadatos e indexación

`index.html` contiene título, descripción, canonical, Open Graph y Twitter Card
para el catálogo. `RouteMetadata` actualiza título, descripción y canonical al
navegar, incluyendo nombre, categoría y barrio cuando carga un restaurante.

Los títulos priorizan el contenido y mantienen la marca al final: "Menú de
[restaurante] | EcoBite", "Carrito de compras | EcoBite" y "Entrega y pago | EcoBite".
Login y registro distinguen "Iniciar sesión" de "Crear cuenta" según el formulario.
Por elección del proyecto, `/home` muestra exactamente "S2602 - ecobite" en la
pestaña; conserva un título descriptivo de EcoBite al compartir enlaces.

Inicio, catálogo y menús públicos son indexables. Auth, carrito, checkout,
comprobantes, páginas de relleno y rutas desconocidas usan `noindex,follow` al
renderizarse. Esto es una indicación de indexación, no un control de acceso.
El sitemap incluye las dos páginas públicas estables; no inventa IDs de restaurantes.

## Límites pendientes

- La aplicación sigue siendo una SPA: los menús y sus metadatos requieren ejecutar
  JavaScript. Bots sociales que no lo ejecuten reciben la tarjeta general de EcoBite.
- Para entregar HTML y metadatos específicos de cada URL sin JavaScript se necesita
  prerenderizado o SSR en el frontend/hosting. No se añadieron servicios ni cambios al backend.
- El hosting actual puede responder HTTP 200 a rutas inexistentes; el frontend
  marca esas vistas como `noindex`, pero no modifica el estado HTTP del servidor.
- Tras publicar, comprobar el dominio, la accesibilidad de los iconos y del sitemap,
  y solicitar revisión en Search Console. Estos cambios no garantizan posiciones
  ni la aparición inmediata del favicon en Google.

Referencias: [favicon](https://developers.google.com/search/docs/appearance/favicon-in-search),
[SEO de JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics),
[formatos de imagen](https://web.dev/articles/choose-the-right-image-format).
