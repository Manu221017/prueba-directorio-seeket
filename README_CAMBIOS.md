# 🚀 Propuesta de Rediseño — Directorio SEEKET (UX/UI)

Documento explicativo y resumen técnico de las decisiones de diseño, arquitectura de interfaz y adaptabilidad responsive implementadas en el **Directorio SEEKET**.




## 💡 Visión General de la Propuesta

El objetivo central del rediseño fue transformar la pantalla del Directorio de un prototipo básico a una **experiencia de producto digital moderna, inmersiva, limpia y de alto impacto visual**, manteniendo una identidad corporativa coherente con SEEKET (negro profundo, acentos en rojo vibrante y naranja cálido).

### Principios de Diseño Aplicados:
1. **Claridad y Jerarquía Visual:** Mayor contraste, tipografías display para titulares y legibilidad optimizada en fichas de servicio densas.
2. **Responsive Real e Inteligente:** Solución elegante al reto de los 3 paneles en dispositivos móviles (375px), tablets (768px) y desktop.
3. **Rendimiento y Fluidez:** Reemplazo de renderizados en Canvas pesado por capas CSS aceleradas por GPU (`brand-wash` y gradientes sutiles).
4. **Tolerancia a Textos Extensos:** Manejo robusto de nombres de proveedores y descripciones de servicios largas sin desbordamientos de interfaz.

---
##  Solución a la Pregunta Clave: Arquitectura Responsive (375px, 768px y Desktop)

> **Pregunta clave del reto:** *En desktop, la pantalla tiene tres paneles lado a lado (filtros, panel central de video y ficha del perfil). En un teléfono de 375px no caben los tres al mismo tiempo. ¿Qué hacés con ellos?*

###  1. Mobile (375px - 640px)
* **Barra de Búsqueda y Header de Contexto Superior:** En lugar de saturar la pantalla con el panel de filtros completo, se creó una barra superior compacta con el buscador directo, contador de perfiles coincidentes (`X de Y perfiles`) y un botón de acceso rápido a filtros (`SlidersHorizontal`).
* **Drawer / Modal de Filtros en Pantalla Completa:** Al presionar el botón de filtros, se despliega un panel lateral/modal flotante con fondo difuminado (`backdrop-blur-xl`), permitiendo al usuario configurar filtros sin perder contexto, con bloqueo automático del scroll de fondo (`body scroll-lock`).
* **Feed Vertical Unificado (Video 4:5 + Ficha):** El panel central y la ficha de servicio se integran en un scroll vertical fluido. El video/placeholder adopta un formato `4:5` óptimo para mobile y la tarjeta de servicio se posiciona justo debajo con accesos directos claros.
* **Barra de Paginación Inferior:** Botones accesibles de navegación arriba/abajo (`ChevronUp` / `ChevronDown`) e indicador de dots interactivos.

###  2. Tablet (768px - 1023px)
* **Layout Híbrido:** Se optimiza el espacio horizontal mostrando el video en formato vertical `9:16` a la par de la ficha de servicio, permitiendo evaluar el contenido simultáneamente.
* **Filtros bajo Demanda:** Mantiene la barra de filtros accesible mediante overlay para maximizar el área de visualización del talento.

###  3. Desktop (1024px+)
* **Layout Completo de 3 Columnas:**
  1. Columna izquierda fija (`aside`) con panel de filtros y buscador dedicados.
  2. Columna central con video de portada en proporción `9:16` cinematográfica.
  3. Columna derecha con ficha del proveedor (`PublicServiceCard`) en tarjeta de cristal esmerilado (`glass-card-strong`).
* **Contador Flotante:** Indicador de avance numérico `01 / 05` en la esquina superior.

---
## 🛠️ Desglose Detallado de Cambios por Componente

### 1. `app/globals.css` (Sistema de Diseño y Tokens)
* **Variables CSS de Marca:** Definición de `--seeket-dark: #080706`, `--seeket-ink: #050505`, `--seeket-panel: #11100e`, `--seeket-ember: #ff6a1f` y `--seeket-cream: #fff2df`.
* **Clases de Tipografía y Texturas:**
  * `.brand-display`: Tipografía bold e impactante para titulares de impacto.
  * `.brand-serif`: Estilo itálico editorial para especialidades secundarias.
  * `.brand-wash`: Malla sutil de gradientes y micro-líneas que añade profundidad sin sobrecargar la CPU/GPU.
* **Refinamiento de Glassmorphism:** Bordes ultra-finos (`border-white/[0.12]`), fondos traslúcidos multicapa y sombras profundas con `backdrop-blur-xl/2xl`.
* **Animación `video-simulate`:** Degradado dinámico mejorado para la simulación de video con acentos rojizos y naranjas cálidos.

### 2. `app/page.tsx` (Página Principal del Directorio)
* **Drawer Móvil de Filtros:** Implementación del estado `mobileFiltersOpen` con control de apertura/cierre, botón flotante de cierre (`X`) y prevención de scroll del body (`overflow: hidden`).
* **Buscador Integrado en Mobile:** Input de búsqueda rápido con icono de lupa y feedback en tiempo real.
* **Layout Adaptativo:** Cambio dinámico de `flex-col` a `lg:flex-row` con alturas fluidas (`100svh`).

### 3. `components/VideoFeed.tsx` (Feed de Video y Navegación)
* **Contador Numérico de Perfiles:** Chip superior `01 / 05` con tipografía monoespaciada/bold y acento naranja.
* **Simulación Editorial de Video:** En perfiles sin video, se despliega una portada editorial con el nombre del proveedor en gran formato (`text-4xl`/`text-5xl`), categoría en cursiva y badge de "Video pendiente".
* **Controles de Navegación Inferiores:** Botones `ChevronUp` y `ChevronDown` junto a los indicadores de progreso para facilitar la exploración en cualquier dispositivo.

---
### 4. `components/PublicServiceCard.tsx` (Ficha del Proveedor y Servicio)
* **Burbuja Superior (Proveedor):** Avatar con inicial y gradiente, nombre con `line-clamp-2` para evitar desbordes, país de residencia con icono `MapPin`, e idiomas disponibles con icono `Globe`.
* **Burbuja Inferior (Servicio):**
  * Badge destacado de precio inicial en la esquina superior derecha (`Desde $X USD`).
  * Título del servicio con soporte de hasta 4 líneas (`line-clamp-4`) y badge de nivel de progresión.
  * Especialidad principal encapsulada en chip con acento naranja.
  * Grid responsivo para tags de enfoque y mercados objetivo (`sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2`) con indicador de `+N más`.

### 5. `components/FiltersPanel.tsx` y `FilterMiniWizard.tsx`
* **Armonización de Color:** Cambio de los tonos genéricos a la paleta de SEEKET (botones de presupuesto activo en `bg-seeket-orange text-black`, checkboxes y bordes activos en naranja).
* **Mejora en Contraste y Accesibilidad:** Estados hover y focus ring claramente perceptibles.

### 6. `components/AnimatedBubbles.tsx` (Optimización de Rendimiento)
* **Reemplazo de Canvas 2D:** Se sustituyó la animación de burbujas en `<canvas>` (que consumía ciclos de CPU/batería continuos en bucle `requestAnimationFrame`) por un fondo de capas CSS (`brand-wash` y gradientes de luz). Esto mejora drásticamente los FPS y la duración de batería en dispositivos móviles.

### 7. `components/SeeketLogo.tsx` y `SiteHeader.tsx`
* **Logotipo de Marca:** Se refinó el logo incorporando los corchetes estilizados `<` y `>`, reforzando el concepto de desarrollo/creatividad con gradiente de marca.
* **Header Compacto:** Reducción de padding innecesario, borde sutil inferior y perfil de usuario minimalista.

---

##  Manejo de Casos Extremos (Edge Cases)

* **Nombres y Títulos Largos:** Implementación de `line-clamp` controlado para evitar saltos de línea indeseados o roturas de tarjetas.
* **Scroll Interno Suave:** La ficha de servicio cuenta con scrollbar personalizado (`custom-scrollbar`) en caso de que un perfil contenga abundante información de portafolio y mercados.
* **Desactivación de Autoplay Molesto:** Manejo de estado de audio con control de silencio persistente e iconos descriptivos (`Volume2` / `VolumeX`).

---

##  Cómo Ejecutar el Proyecto Localmente

```bash
# 1. Clonar el repositorio
git clone https://github.com/Manu221017/prueba-directorio-seeket.git

# 2. Entrar en la carpeta
cd prueba-directorio-seeket

# 3. Instalar dependencias
npm install

# 4. Iniciar servidor de desarrollo
npm run dev
```

Abre en tu navegador: [http://localhost:3000](http://localhost:3000)
