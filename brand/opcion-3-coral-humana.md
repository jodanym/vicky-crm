# Opción 3 — Coral Humana

> Propuesta alternativa. No aplicada en producción.
> Para activarla, reemplazar las variables CSS en `src/app/globals.css`.

---

## Concepto

**"Humana, cálida, como una colega experta de confianza"**

Identidad centrada en la persona, no en la tecnología.
El coral transmite energía, cercanía y optimismo.
Ideal si el producto se quiere posicionar como "tu asistente" más que como "tu CRM".

El nombre "Vicky" ya es un nombre de persona — esta identidad lo potencia:
Vicky no es un software, es tu asistente de ventas de confianza.

---

## Paleta de colores

### Colores principales

| Nombre | Hex | Uso |
|---|---|---|
| Brand (Coral) | `#FF5C35` | Botones, logo, acentos activos |
| Brand Dark | `#D84A22` | Hover de botones |
| Brand Light | `#FFF0EC` | Fondos de avatares, badges |
| Brand Faint | `#FFF8F6` | Fondo general de la app |
| Brand Text | `#993C1D` | Texto sobre fondos claros de marca |

### Colores semánticos del Kanban

| Etapa | Color | Hex |
|---|---|---|
| Primer contacto | Coral suave | `#FF5C35` |
| Enganche | Ámbar | `#f59e0b` |
| Firma de contrato | Púrpura | `#a855f7` |
| Cierre | Verde | `#22c55e` |

### Color de apoyo

| Nombre | Hex | Uso |
|---|---|---|
| Noche | `#1A1A2E` | Texto principal, headers |

---

## Tipografía

| Uso | Fuente | Peso | Tamaño |
|---|---|---|---|
| Headings | Geist Sans | 600 | 18–28px |
| Body | Geist Sans | 400 | 14–16px |
| Tagline | Geist Sans | 400 italic | 13px |

---

## Logo

```
┌─────────┐
│    V    │  → Esquinas redondeadas (border-radius: 12px — más redondeado que op.1)
└─────────┘     Fondo: #FF5C35  |  Letra: #FFFFFF  |  Font-weight: 600
```

- Versión texto: **Vicky** (semibold) + *"tu asistente de ventas"* (italic, gris)
- Más amigable y menos corporativo

---

## Voz y tono

- **Primera persona** — "Te ayudo a cerrar más"
- **Optimista** — cada lead es una oportunidad
- **Conversacional** — como un chat, no como un manual
- Ideal para marketing: "Vicky te recuerda, Vicky te avisa, Vicky cierra contigo"

---

## Variables CSS para activar

```css
/* Reemplazar en src/app/globals.css */
--brand:         #FF5C35;
--brand-dark:    #D84A22;
--brand-light:   #FFF0EC;
--brand-faint:   #FFF8F6;
--brand-text:    #993C1D;
```

---

## Cuándo usar esta identidad

- Si el producto se va a posicionar en redes sociales (Instagram, TikTok)
- Si los especialistas son jóvenes o el tono es más startup
- Si el bot de WhatsApp es el feature estrella (Vicky como personaje/asistente)
- Si se quiere diferenciarse radicalmente de los CRMs corporativos tradicionales
