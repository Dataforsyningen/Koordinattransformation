# Koordinattransformation

Koordinattransformation er en Vue.js applikation der gør det let at transformere koordinater mellem forskellige referencesystemer.

Projektet er scaffolded med [Vite](https://vitejs.dev/) og kørt igennem NPM

For at udvikle og bygge projektet anbefales følgende setup
- node.js version: >=21.05.0 [link til download](https://nodejs.org/en/)
- npm version: >=10.2.4, dette gøres igennem node.js installeren.

---

## Setup a projektet

### Setup af Miljø
For at kunne køre projektet, er der nogle miljøvariable, der skal føres ind i root directory i projeket.

`.env.development` til development miljøet og
`.env.production` til produktionsmiljøet.
Et eksempel på en miljøfil er:

```
module.export = {
  VITE_NODE_ENV = development
  VITE_VUE_APP_SHOW_UNPUBLISHED = true
  VITE_NODE_OPTIONS = --openssl-legacy-provider
  VITE_TOKEN = <token>
  VITE_API_BASE_URL = https://api.dataforsyningen.dk/rest/webproj_test
  VITE_API_BASE_PATH = /v1.2/trans/
}
```
Et token kan genereres via [dataforsyningen](https://dataforsyningen.dk/)

***Kopier disse filer fra config repoet ind i root directory af projektet.***

Disse refereres efterfølgende med `import.meta.env.[field]` <br> i sidens Store og KoorMap komponentet.
Læs mere om Vite og miljøvariable [her](https://vitejs.dev/guide/env-and-mode.html)


- Naviger til projektet i terminalen <br>

- Installer dependencies igennem npm
```
npm install
```
dependencies er senere at finde i ./node_modules


### Start Applikationen

Herfra har man tre muligheder: <br>
Kør projektet i localhost. (portnummeret vil blive vist i terminalvinduet):
```
npm run dev
```
Compile og minify projektet til produktion:
```
npm run build
```
***

Selve transformationerne sker igennem [WEBPROJ](https://github.com/SDFIdk/WEBPROJ/tree/master) <br>
dokumentation til WEBPROJ findes [her](https://docs.dataforsyningen.dk/#webproj)

Koderne fra WEBPROJ bliver derefter store'et i en Pinia store. Under runtime, kan denne ses i developer tools i browseren med Vue extention til henholdsvis [Chrome](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd),
[firefox](https://devtools.vuejs.org/)
[Edge](https://microsoftedge.microsoft.com/addons/detail/vuejs-devtools/olofadcdnkkjdfgjcmjaadnlehnnihnl)


## Formattering af koordinater
| Koordinater                  | Antal decimaler   |
| ---------------------------- | ----------------- |
| Meter                        | 4 decimaler       |
| Grader                       | 8 decimaler       |
| Grader og minutter           | 0, 6 decimaler    |
| Grader, minutter og sekunder | 0, 0, 4 decimaler |


## Geodæsi
Nogle gode generelle ting at vide:
- [CRS](https://en.wikipedia.org/wiki/Spatial_reference_system) (Coordinate Reference System) er en fællesbetegnelse for forskellige typer geografiske koordinatsystemer. Typisk tildeles CRS'er en unik kode, fx en EPSG-kode, der gør det let at give geospatial data en entydig geografisk reference.<br>
- [EPSG](https://epsg.io/) er en database over CRS'er varetaget af 'International Association of Oil and Gas Producers'
- En transformation, hvor et to-dimensionelt system indgår, enten som in- eller output, skal ikke have en højdeparameter på outputtet, selvom man umiddelbart har lyst. I en geodætisk sammenhæng er det meningsløst og i sidste ende misvisende at tage højdeparameteren med.


## Note om Vue
Vue bliver hele tiden opdateret, og der er mange forskellige måder at gøre de samme ting på.
Denne applikation kører på Vue 3 igennem [composition API'en](https://vuejs.org/guide/extras/composition-api-faq.html) med script setup syntax. Dette giver mindre boilerplate og exposer variable og functioner direkte til template'en uden explicit skulle expose dem. <br>
***Vær opmærksom, når du finder referencer og tutorials rundt omkring på nettet, at der bliver snakket om den rigtige version.***
### Liste over indlejrede teknologier
- [Pinia](https://pinia.vuejs.org/) til state management
- [Vite](https://vitejs.dev/) som det underliggende build-step
- [Vue Router](https://router.vuejs.org/) til... ja... routing


## Note om Inputs og Outputs

I et rewrite af applikationen grundet et stigende antal af bugs er state management udelukkende blevet delegeret til
pinia storen. Enhver ændring i state sker via en opdatering af en lokal ref i et komponent, som dernæst sendes til
storen via en set-funktion fra store.js. <br>
```
const baseCoords  = ref({
    v1: 0.0,
    v2: 0.0,
    v3: 0.0,
    v4: 0.0
})

const debounceUpdate = () => {
  console.log('update queued')
  
  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value)
  }

  debounceTimeout.value = setTimeout(() => {
    console.log('timeout function called')
    fromRepresentation()
    KtStore.setCoordinatesFrom({
      crs: KtStore.CRSFrom,
      coordinates: baseCoords.value
    })
  }, 500)
}


```


Hvis et komponent reaktivt skal reagere på ændringer i state gøres dette 
ved at sætte et lokalt compute-variable til et store-variable, og sætte en watch-funktion til 
reaktivt at opdatere komponentet ved ændringer.
Eksempel fra KoorIntputField.vue
```
const coorFrom = computed(() => KtStore.getCoordinatesFrom)

watch(coorFrom, (to) => {

    baseCoords.value = {
      v1: coorFrom.value.v1 || 0.0,
      v2: coorFrom.value.v2 || 0.0,
      v3: coorFrom.value.v3 || 0.0,
      v4: coorFrom.value.v4 || 0.0
    }
    formatInputCoor()
    toRepresentation()
})

```
Ved at holde denne struktur sikrer man, at koden for stateændringer og reaktivitet holdes relativt seperat,
så at man undgår eventuelle uforudseete konsekvenser.

## Integration af KDS' design system
Styling af siden er gjort via [KDS's design system](https://github.com/sdfidk/designsystem)

Der er to måder hvorpå man kan bruge variabler fra @dataforsyningen:
- `<style>` tag må ikke være scoped
- inline css

inline CSS er ikke muligt på pseudo elementer og heller ikke på conditional classes (`:class={someClass: booleanValue}`)
Derfor giver det mening slet ikke at bruge `<style scoped>` for at holde koden strømlinet og ensformig.

For komponenter, som ikke findes i designsystemet, er et basiskomponent, som dialog, blevet udvalgt og 
stylet til sidens behov.

### Ikoner
Alle ikoner kommer fra [design-system-icons](https://sdfidk.github.io/design-system-icons/) <br>
For at holde antallet af komponenter på siden nede, hentes disse ved runtime ved at kontatenere en svgPath-streng
med et id til et icon, fx '#arrow-up' <br>
Ikoner skal opdateres manuelt fra designsystemets repo i src/assets/icons

## Baggrundskort
Danmarkskortet anvender [Skærmkortet](https://dataforsyningen.dk/data/962) mens Grønlandskortet anvender [Åbent Land Grønland](https://dataforsyningen.dk/data/4771).
