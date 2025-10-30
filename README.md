# Kraftfondet – Trekkspill/Accordion-widget (CMS-vennlig)

Denne repoen inneholder en vanilla-JS-widget som bygger hele trekkspillmenyen for Kraftfondet direkte i CMS-et. Scriptet injiserer både nødvendig markup og styling automatisk, slik at du kun trenger å lime inn én `<script>`-tagg.

## Hurtigbruk i Schibsted CMS
```html
<script
  src="https://andalsnesdocs.github.io/andalsnesdocs/widget.js"
  data-theme="auto"
  data-primary="#377FCC"></script>
```

- Widgeten opprettes på samme sted i innholdet som `<script>`-taggen.
- `data-theme` kan settes til `auto`, `light` eller `dark`.
- `data-primary` overstyrer aksentfargen.
- `data-manifest` er valgfritt; som standard brukes `kraftfondet/manifest.json` fra samme opprinnelse som `widget.js`, men du kan peke til et annet manifest ved behov.
- Hvis du ønsker full kontroll på plasseringen kan du legge til `<div id="kraftfondet-app"></div>` der du vil ha widgeten. Scriptet bruker elementet dersom det finnes.

## Lokalt eksempel
Åpne `index.html` i nettleseren for å se widgeten i bruk og for å teste søk, tastaturnavigasjon og dyp-lenking.

## Filtrering
- Sak tas med hvis `sak.type` inneholder `søknad`/`tilskudd`/`investeringstilskudd`/`bedriftsutviklingstilskudd`/`etableringstilskudd`,
  eller `vedtak.vedtak` inneholder `innvilg`/`bevilg`/`tilskudd`.

## Tilgjengelighet
- Bruker `aria-expanded`, `aria-controls`, `role="region"`. Piltaster opp/ned/Home/End støttes.
