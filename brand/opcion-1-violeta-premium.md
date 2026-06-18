# ✅ Opción 1 — Violeta Premium (ACTIVA)

> Esta es la identidad oficial aplicada en producción.

---

## Concepto

**"Tecnología de alto nivel, accesible para todos"**

Posiciona a Vicky como una herramienta moderna, confiable y sofisticada.
El violeta transmite innovación y tecnología sin perder calidez humana.

---

## Paleta de colores

### Colores principales

| Nombre | Hex | Uso |
|---|---|---|
| Brand (Violeta) | `#6C47FF` | Botones, logo, acentos activos |
| Brand Dark | `#5535E0` | Hover de botones, estados activos |
| Brand Light | `#EEE9FF` | Fondos de avatares, badges, chips |
| Brand Faint | `#F5F4FF` | Fondo general de la app |
| Brand Text | `#4326C4` | Texto sobre fondos claros de marca |

### Colores semánticos del Kanban

| Etapa | Color | Hex |
|---|---|---|
| Primer contacto | Azul | `#3b82f6` |
| Enganche | Ámbar | `#f59e0b` |
| Firma de contrato | Púrpura | `#a855f7` |
| Cierre | Verde | `#22c55e` |

### Colores neutros

| Nombre | Hex | Uso |
|---|---|---|
| Texto principal | `#111827` | Títulos, cuerpo |
| Texto secundario | `#6B7280` | Subtítulos, labels |
| Texto terciario | `#9CA3AF` | Placeholders, hints |
| Borde suave | `#E5E7EB` | Bordes de cards, inputs |
| Fondo blanco | `#FFFFFF` | Cards, modales |
| Fondo gris | `#F9FAFB` | Fondo de columnas Kanban |

---

## Tipografía

| Uso | Fuente | Peso | Tamaño |
|---|---|---|---|
| Headings | Geist Sans | 600–700 | 18–28px |
| Body | Geist Sans | 400 | 14–16px |
| Labels | Geist Sans | 500 | 12–13px |
| Monospace | Geist Mono | 400 | 13px |

---

## Logo

```
┌─────────┐
│    V    │  → Cuadrado con esquinas redondeadas (border-radius: 8px)
└─────────┘     Fondo: #6C47FF  |  Letra: #FFFFFF  |  Font-weight: 700
```

- Versión texto: **Vicky** (semibold) + **CRM** (regular, gris)
- Versión ícono: cuadro violeta con "V" blanca
- No usar gradientes en el logo

---

## Voz y tono

- **Directa** — sin rodeos, el broker tiene poco tiempo
- **Profesional pero cercana** — como un colega experto
- **En español** (es-MX) como idioma principal
- **Confiable** — los datos son precisos, la app no falla

---

## Variables CSS (globals.css)

```css
--brand:         #6C47FF;
--brand-dark:    #5535E0;
--brand-light:   #EEE9FF;
--brand-faint:   #F5F4FF;
--brand-text:    #4326C4;
```

---

## Aplicaciones

| Elemento | Aplicación |
|---|---|
| Botones primarios | Fondo `#6C47FF`, texto blanco |
| Botones hover | Fondo `#5535E0` |
| Avatares | Fondo `#EEE9FF`, texto `#4326C4` |
| Link activo en navbar | Color `#6C47FF` + subrayado |
| Focus ring en inputs | Color `#6C47FF` |
| Panel login (desktop) | Fondo sólido `#6C47FF` |
| Drag overlay del kanban | Borde `#6C47FF` |
