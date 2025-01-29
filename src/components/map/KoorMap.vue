<template>
  <div
    id="map"
    ref="map"
    tabindex="1"
    class="olmap"
  />
  <div
    v-show="pinPointer"
    id="placed-pin"
  >
    <svg class="LocationIcon"><use href="../../assets/icons/icons.svg#pointer-position" /></svg>
  </div>
</template>

<script setup>
//ol basics

import 'ol/ol.css'
import OlMap from 'ol/Map'
import OlView from 'ol/View'

//wmts + wmt setup
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS'
import WMTSCapabilities from 'ol/format/WMTSCapabilities'
import {Tile as TileLayer} from 'ol/layer'
import TileWMS from 'ol/source/TileWMS.js'

//overlays
import Overlay from 'ol/Overlay'
import {
  defaults as defaultControls,
  ScaleLine,
} from 'ol/control'

import { epsg25832proj, epsg32624proj, epsg3184proj, mapListToCoor, mapCoorToList } from '../../helperfunctions.js'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'

//vue
import { onMounted, ref, computed, watch } from 'vue'
import { useKtStore } from '../../store/store.js'


const KtStore = useKtStore()

//setting up projections for Skærmkortet / Åbent Land Grønland

epsg25832proj(proj4)
epsg32624proj(proj4)
epsg3184proj(proj4)
register(proj4)



const olMap = ref({})
const overlay = ref({})
const pinPointer = ref(false)
const mapData = ref({
  'GL' : {
    title: 'Åbent Land',
    attributionText: 'Klimadatastyrelsen',
    attributionLink: 'https://www.klimadatastyrelsen.dk/',
    mapURL:`https://api.dataforsyningen.dk/wms/gl_aabent_land?token=${import.meta.env.VITE_TOKEN}&service=WMS&request=GetCapabilities`,
    source: null,
    center:   [-116987.80903933897, 7178544.1041003745],
    extent:  [-420000, 6.45e+06, 1.21e+06, 16.0382, 9.5e+06],
    projection: 'EPSG:3184',
    zoom: 12,
    minZoom: 4,
    maxZoom: 200,
  },
  'DK' : {
    title: 'Skærmkortet',
    attributionText: 'Klimadatastyrelsen',
    attributionLink: 'https://www.klimadatastyrelsen.dk/',
    mapURL: 'https://services.datafordeler.dk/DKskaermkort/topo_skaermkort_daempet/1.0.0/wmts?username=WVTWQAXVUY&password=FiskMangler1Ven*&service=WMTS&request=GetCapabilities',
    source: null,
    view: null,
    center: [587135, 6140617 + 50000],
    extent: [120000, 5900000, 1000000, 6500000],
    projection: 'EPSG:25832',
    zoom: 8.2,
    minZoom: 8,
    maxZoom: 23,
  },
})

const coverArea = computed(() => KtStore.getCoverArea)
const coorFrom = computed(() => KtStore.getCoordinatesFrom)

const fetchDKMap = async () => {
  const skaermkort = await fetch(mapData.value.DK.mapURL)
  const mapText = await skaermkort.text()
  const capabilities = new WMTSCapabilities().read(mapText)

  return new WMTS(optionsFromCapabilities(capabilities, {
    layer: 'topo_skaermkort_daempet',
    matrixSet: 'View1',
  }))
}
const fetchGLMap = async () => {
  const groenlandTopoSource = await new TileWMS({
    attributions: '',
    url: mapData.value.GL.mapURL,
    params: {
      layers: 'gl_aabent_land',
      transparent: 'FALSE',
      tiled: true,
    },
  })

  return groenlandTopoSource
}
const createView = async() => {
  return new OlView({
    center: mapData.value[coverArea.value].center,
    zoom: mapData.value[coverArea.value].zoom,
    minZoom: mapData.value[coverArea.value].minZoom,
    maxZoom: mapData.value[coverArea.value].maxZoom,
    showFullExtent: false,
    projection: mapData.value[coverArea.value].projection,
  })
}

const createMap = async() => {

  var mapSource
  var mapView
  var mapTitle

  if(coverArea.value === 'DK') {
    mapSource = await fetchDKMap()
    mapView = await createView()
    mapTitle = mapData.value.DK.title

    mapData.value.DK.source = mapSource
    mapData.value.DK.view = mapView
  }
  else {
    mapSource = await fetchGLMap()
    mapView = await createView()
    mapTitle = mapData.value.GL.title

    mapData.value.GL.source = mapSource
    mapData.value.GL.view = mapView
  }

  

  return new OlMap({
    target: 'map',
    controls: defaultControls({
      zoom: false,
      attribution: false,
      rotate: false,
    }),
    view: mapView,
    layers:
            [
              new TileLayer({
                opacity: 1,
                title: mapTitle,
                type: 'base',
                visible: true,
                source: mapSource,
              }),
            ],
  })
}

onMounted(async() => {
  olMap.value = await createMap()

  olMap.value.addControl(new ScaleLine())
    
  const placedPin = document.getElementById('placed-pin')
  overlay.value = new Overlay({
    element: placedPin,
    positioning: 'center-center',
    projection: mapData.value[coverArea.value].projection,
  })

  olMap.value.on('click', (event) => {
    pinPointer.value = true
    const coordinate = event.coordinate
    overlay.value.setPosition(coordinate) 
    KtStore.setCoordinatesFrom({
      crs: mapData.value[coverArea.value].projection,
      coordinates: {v1: event.coordinate[0], v2: event.coordinate[1], v3: null, v4: null},
    })
  })

  olMap.value.addOverlay(overlay.value) 
})

//make call to api and set map marker where new coordinate is
watch(coorFrom, async (to, from) => {
  //case that it is same epsg
  const crsFrom = KtStore.CRSFrom
  
  if(crsFrom === mapData.value[coverArea.value].projection) {
    overlay.value.setPosition(mapCoorToList(to))
  }

  else{
    try {
      const response = await fetch(`${KtStore.webproj}${KtStore.CRSFrom}/${mapData.value[coverArea.value].projection}/${mapCoorToList(to)}?token=${KtStore.token}`)
      if(!response.ok){
        throw new Error(`Error fetching coordinates for map: ${response.statusText}`)
      }
      const data = await response.json()
      overlay.value.setPosition(mapCoorToList(data))

    } catch (error) {
      console.error('Failed to fetch and update coordinates:', error)
    }
  }
})
</script>

<style scoped>
.olmap {
  cursor: crosshair;
  height: calc(100vh - (12vh - 2rem) );
  position: relative;
}
#mousePin {
  display: none;
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
#placed-pin {
  position: absolute;
  transform: translateX(-50%) translateY(-85%);
}
</style>