# Opción 2 — Negro Minimalista

> Propuesta alternativa. No aplicada en producción.
> Para activarla, reemplazar las variables CSS en `src/app/globals.css`.

---

## Concepto

**"Serio, premium, enfocado — como los mejores brokers"**

Identidad ultra-limpia inspirada en marcas de lujo y fintech premium.
El negro transmite autoridad, precisión y exclusividad.
Para un mercado de propiedades de alto valor donde el cliente espera seriedad.

---

## Paleta de colores

### Colores principales

| Nombre | Hex | Uso |
|---|---|---|
| Brand (Negro) | `#111111` | Botones, logo, acentos activos |
| Brand Dark | `#000000` | Hover de botones |
| Brand Light | `#F1F0EE` | Fondos de avatares, badges |
| Brand Faint | `#F8F7F5` | Fondo general de la app |
| Brand Text | `#444441` | Texto sobre fondos claros de marca |

### Colores semánticos del Kanban

| Etapa | Color | Hex |
|---|---|---|
| Primer contacto | Gris medio | `#888780` |
| Enganche | Gris oscuro | `#5F5E5A` |
| Firma de contrato | Casi negro | `#444441` |
| Cierre | Negro | `#111111` |

---

## Tipografía

| Uso | Fuente | Peso | Tamaño | Extra |
|---|---|---|---|---|
| Logo | Geist Sans | 500 | 18px | `letter-spacing: 0.04em` — MAYÚSCULAS |
| Headings | Geist Sans | 500 | 18–26px | Sin tracking extra |
| Body | Geist Sans | 400 | 14–15px | |
| Labels | Geist Sans | 400 | 11–12px | `letter-spacing: 0.06em` uppercase |

---

## Logo

```
┌──────────────────┐
│  ●  VICKY  CRM  │  → Sin borde, fondo negro, texto blanco
└──────────────────┘     Versión compacta: círculo negro con "V" blanca
```

- Tipografía en mayúsculas con `letter-spacing: 0.06em`
- Minimalismo total: sin ornamentos

---

## Variables CSS para activar

```css
/* Reemplazar en src/app/globals.css */
--brand:         #111111;
--brand-dark:    #000000;
--brand-light:   #F1F0EE;
--brand-faint:   #F8F7F5;
--brand-text:    #444441;
```

---

## Cuándo usar esta identidad

- Si el mercado objetivo es ultra-premium (propiedades >$5M USD)
- Si los clientes son corporativos o fondos de inversión
- Si se quiere proyectar más como "herramienta enterprise" que como "app amigable"
