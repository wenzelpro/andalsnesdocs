# Kraftfondet – Trekkspill/Accordion-widget (CMS-vennlig)

Denne repoen inneholder en vanilla-JS-widget som viser hele trekkspillmenyen for Kraftfondet i et CMS eller på en nettside. CSS
og JavaScript ligger tilgjengelig via GitHub Pages slik at du kan gjenbruke komponenten uten byggsteg.

## Raskt oppsett i CMS (ren HTML)
- Ferdig bygget widget finnes på `https://wenzelpro.github.io/andalsnesdocs/widget.html`.
- Lim inn hele dokumentet i CMS-et ditt *eller* bygg den inn via en `<iframe>`:

```html
<iframe
  src="https://wenzelpro.github.io/andalsnesdocs/widget.html"
  style="width: 100%; border: 0;"
  title="Kraftfondet"></iframe>
```

Alle stilark, skript og datafiler lastes inn automatisk fra GitHub Pages.

## Manuell integrasjon via script-tag
Hvis du heller vil injisere widgeten direkte i siden, trenger du både markup, stilark og skriptet. Eksempelet under viser minimumsoppsettet:
```html
<link rel="stylesheet" href="https://wenzelpro.github.io/andalsnesdocs/kraftfondet.css" />

<div id="kraftfondet-widget"
     data-manifest="https://wenzelpro.github.io/andalsnesdocs/kraftfondet/manifest.json">
  <input type="text" id="kf-search"
         placeholder="Søk i saker… (søker, type, referanse, prosjektbeskrivelse, vedtak, budsjett, stemmegivning)" />
  <div id="kf-accordion" aria-live="polite"></div>
  <div id="kf-error" class="kf-error" hidden></div>
</div>

<script src="https://wenzelpro.github.io/andalsnesdocs/kraftfondet.js"></script>
```

- `data-manifest` peker til JSON-manifestet som listes opp i widgeten. Endre adressen hvis du har en egen manifest-fil.
- Scriptet forventer at elementene over finnes i DOM-en. Hvis de mangler vil widgeten ikke initialiseres riktig.

## Lokalt eksempel
Åpne `index.html` i nettleseren for å se widgeten i bruk og for å teste søk, tastaturnavigasjon og dyp-lenking.

## Filtrering
- Sak tas med hvis `sak.type` inneholder `søknad`/`tilskudd`/`investeringstilskudd`/`bedriftsutviklingstilskudd`/`etableringstilsk
udd`,
  eller `vedtak.vedtak` inneholder `innvilg`/`bevilg`/`tilskudd`.

## Tilgjengelighet
- Bruker `aria-expanded`, `aria-controls`, `role="region"`. Piltaster opp/ned/Home/End støttes.
