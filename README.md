
# Kraftfondet – Trekkspill/Accordion-widget (CMS-vennlig)

Dette leveres:
- `index.html` – komplett forside
- `widget.js` – CMS-vennlig widget

## Rask start (GitHub Pages)
1. Legg `index.html` og `widget.js` i `wenzel.pro.github.io/andalsnesdocs/`.
2. Manifest må ligge på `https://andalsnesdocs.github.io/kraftfondet/manifest.json`.
3. Åpne siden og test søk/åpne-lukk/dyp-lenking.

## CMS-innliming
```html
<div id="kraftfondet-app"
     class="kf-wrap"
     data-theme="auto"
     data-primary="#377FCC"
     data-manifest="https://andalsnesdocs.github.io/kraftfondet/manifest.json">
  <div class="kf-controls">
    <input id="kf-search" type="search" placeholder="Søk i saker (søker, referanse, tekst, vedtak) …" />
    <button id="kf-expand" type="button">Åpne alle</button>
    <button id="kf-collapse" type="button">Lukk alle</button>
  </div>
  <div id="kf-accordion" class="kf-accordion" aria-live="polite"></div>
</div>
<script src="/andalsnesdocs/widget.js"></script>
```

## Konfig
- `data-manifest`: URL til manifest
- `data-theme`: `auto` | `light` | `dark`
- `data-primary`: hex-farge

## Filtrering
- Sak tas med hvis `sak.type` inneholder `søknad`/`tilskudd`/`investeringstilskudd`/`bedriftsutviklingstilskudd`/`etableringstilskudd`,
  eller `vedtak.vedtak` inneholder `innvilg`/`bevilg`/`tilskudd`.

## Tilgjengelighet
- Bruker `aria-expanded`, `aria-controls`, `role="region"`. Piltaster opp/ned/Home/End støttes.
