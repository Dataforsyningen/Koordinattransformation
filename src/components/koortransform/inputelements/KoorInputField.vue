<template>
  <div
    v-if="isMeter"
    class="KT-input-row"
  >
    <span 
      class="KT-input-row"
    >
      <svg class="KT-icon">
        <use :href="c1.dirIcon" />
      </svg>
      <input 
        v-model="c1.cMeter"
        type="number"
        step="0.0001"
        @input="debounceUpdate"
      >
      <p> {{ c1.dirIndicator }} </p>
    </span>
    <span 
      class="KT-input-row"
    >
      <svg class="KT-icon">
        <use :href="c2.dirIcon" />
      </svg>
      <input 
        v-model="c2.cMeter"
        type="number"
        step="0.0001"
        @input="debounceUpdate"
      >
      <p> {{ c2.dirIndicator }} </p>
    </span>
    <span 
      v-if="c3.isHeight"
      class="KT-input-row"
    >
      <svg class="KT-icon">
        <use :href="c3.upIcon" />
      </svg>
      <input 
        v-model="c3.cMeter"
        type="number"
        step="0.0001"
        @input="debounceUpdate"
      >
      <p> m </p>
    </span>
  </div>

  <div
    v-else
    class="KT-input-column"
  >
    <span 
      class="KT-input-row"
    >
      <svg class="KT-icon">
        <use :href="c1.dirIcon" />
      </svg>
      <input 
        v-model="c1.cDegree"
        type="number"
        step="0.0001"
        @input="debounceUpdate"
      >
      <p> {{ c1.dirIndicator }} </p>
      <input 
        v-if="degreeFormat==='D.min' || degreeFormat === 'D.min.sec'"
        v-model="c1.cMinute"
        type="number"
        step="0.0001"
        @input="debounceUpdate"
      >
      <input 
        v-if="degreeFormat === 'D.min.sec'"
        v-model="c1.cSecond"
        type="number"
        step="0.0001"
        @input="debounceUpdate"
      >
    </span>

    <span 
      class="KT-input-row"
    >
      <svg class="KT-icon">
        <use :href="c2.dirIcon" />
      </svg>
      <input 
        v-model="c2.cDegree"
        type="number"
        step="0.0001"
        @input="debounceUpdate"
      >
      <p> {{ c2.dirIndicator }} </p>
      <input 
        v-if="degreeFormat==='D.min' || degreeFormat === 'D.min.sec'"
        v-model="c2.cMinute"
        type="number"
        step="0.0001"
        @input="debounceUpdate"
      >
      <input 
        v-if="degreeFormat === 'D.min.sec'"
        v-model="c2.cSecond"
        type="number"
        step="0.0001"
        @input="debounceUpdate"
      >
    </span>
    <span 
      v-if="c3.isHeight"
      class="KT-input-row"
    >
      <svg class="KT-icon">
        <use :href="c3.upIcon" />
      </svg>
      <input 
        v-model="c3.cMeter"
        type="number"
        step="0.0001"
        @input="debounceUpdate"
      >
      <p> m </p>
    </span>
  </div>

  <div class="KT-input-bottom-row">
    <div>
      <span
        v-if="!isMeter"
        class="KT-radio-row"
      >
        <input
          id="D"
          v-model="degreeFormat"
          type="radio"
          name="format"
          value="D"
          checked="checked"
        >
        <label for="D">D</label><br>
        <input
          id="D.min"
          v-model="degreeFormat"
          type="radio"
          name="format"
          value="D.min"
        >
        <label for="D.min">D.min </label><br>
        <input
          id="D.min.sec"
          v-model="degreeFormat"
          type="radio"
          name="format"
          value="D.min.sec"
        >
        <label for="D.min.sec">D.min.sec</label>
      </span>
    </div>

    <g-search v-if="route.fullPath==='/Denmark'" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useKtStore } from '../../../store/store.js'
import { getGSearchCenterPoint } from '../../../helperfunctions.js'

const KtStore = useKtStore()
const route = useRoute()

const coorFrom = computed(() => KtStore.getCoordinatesFrom)
const CRSInfo = computed(() => KtStore.getCRSFromDisplayInfo)

const svgPath = '/src/assets/icons/icons.svg#'
const debounceTimeout = ref(null)

const baseCoords  = ref({
  v1: 0.0,
  v2: 0.0,
  v3: 0.0,
  v4: 0.0,
})

const c1 = ref({
  cMeter: 0.0,
  cDegree: 0.0,
  cMinute: 0.0,
  cSecond: 0.0,
  dirIcon: '',
  dirIndicator: '',
})
const c2 = ref({
  cMeter: 0.0,
  cDegree: 0.0,
  cMinute: 0.0,
  cSecond: 0.0,
  dirIcon: '',
  dirIndicator: '',
})
const c3 = ref({
  cMeter: 0.0,
  isHeight: false,
  upIcon: svgPath + 'arrow-up',
})

const isMeter = ref(true)
const degreeFormat = ref('D')

const toRepresentation = () => {
  c3.value.cMeter = baseCoords.value.v3

  let d1, d2, m1, m2, s1, s2

  if (isMeter.value) {
    c1.value.cMeter = parseFloat(baseCoords.value.v1).toFixed(4)
    c2.value.cMeter = parseFloat(baseCoords.value.v2).toFixed(4)
  } else {
    switch (degreeFormat.value) {
    case 'D': 
      c1.value.cDegree = parseFloat(baseCoords.value.v1).toFixed(8)
      c2.value.cDegree = parseFloat(baseCoords.value.v2).toFixed(8)
      break
    case 'D.min':
      d1 = Math.floor(baseCoords.value.v1)
      d2 = Math.floor(baseCoords.value.v2)

      m1 = parseFloat(((baseCoords.value.v1 - d1) * 60)).toFixed(6)
      m2 = parseFloat(((baseCoords.value.v2 - d2) * 60)).toFixed(6)

      c1.value.cDegree = d1
      c1.value.cMinute = m1

      c2.value.cDegree = d2
      c2.value.cMinute = m2
      break
    case 'D.min.sec':
      d1 = Math.floor(baseCoords.value.v1)
      d2 = Math.floor(baseCoords.value.v2)

      m1 = Math.floor((baseCoords.value.v1 - d1) * 60)
      m2 = Math.floor((baseCoords.value.v2 - d2) * 60)

      s1 = ((baseCoords.value.v1 - d1 - m1 / 60) * 3600).toFixed(4)
      s2 = ((baseCoords.value.v2 - d2 - m2 / 60) * 3600).toFixed(4)

      c1.value.cDegree = d1
      c1.value.cMinute = m1
      c1.value.cSecond = s1

      c2.value.cDegree = d2
      c2.value.cMinute = m2
      c2.value.cSecond = s2
      break
    }
  }
}

const fromRepresentation = () => {
  
  if (isMeter.value) {
    baseCoords.value.v1 = parseFloat(c1.value.cMeter)
    baseCoords.value.v2 = parseFloat(c2.value.cMeter)
    baseCoords.value.v3 = parseFloat(c3.value.cMeter)
  } else {
    switch (degreeFormat.value) {
    case 'D': 
      baseCoords.value.v1 = parseFloat(c1.value.cDegree).toFixed(8)
      baseCoords.value.v2 = parseFloat(c2.value.cDegree).toFixed(8)
      baseCoords.value.v3 = parseFloat(c3.value.cMeter)
      break
    case 'D.min':
      baseCoords.value.v1 = parseFloat(c1.value.cDegree + c1.value.cMinute / 60).toFixed(8)
      baseCoords.value.v2 = parseFloat(c2.value.cDegree + c2.value.cMinute / 60).toFixed(8)
      baseCoords.value.v3 = parseFloat(c3.value.cMeter)
      break
    case 'D.min.sec':
      baseCoords.value.v1 = parseFloat(c1.value.cDegree + c1.value.cMinute / 60 + c1.value.cSecond / 3600).toFixed(8)
      baseCoords.value.v2 = parseFloat(c2.value.cDegree + c2.value.cMinute / 60 + c2.value.cSecond / 3600).toFixed(8)
      baseCoords.value.v3 = parseFloat(c3.value.cMeter)
      break
    }
  }
}


const formatInputCoor = () => {
  isMeter.value = CRSInfo.value.v1_unit === 'metre' && CRSInfo.value.v2_unit === 'metre'

  //if m is missing, something is wrong
  if(isMeter.value){
    c1.value.dirIndicator = 'm'
    c2.value.dirIndicator = 'm'
  }

  switch(CRSInfo.value.v1){
  case 'Easting':
    c1.value.dirIcon = svgPath + 'direction-east'
    break
  case 'Westing':
    c1.value.dirIcon = svgPath + 'direction-west'
    break
  case 'Breddegrad':
    c1.value.dirIcon= svgPath + 'direction-north'
    c1.value.dirIndicator = '°N'
  }

  switch(CRSInfo.value.v2){
  case 'Northing':
    c2.value.dirIcon = svgPath + 'direction-north'
    break
  case 'Længdegrad':
    c2.value.dirIcon = svgPath + 'direction-east'
    c2.value.dirIndicator = '°E'
  }
  switch(CRSInfo.value.v3){
  case 'Kote' : 
    c3.value.isHeight = true
    break
  case 'Ellipsoidehøjde' :
    c3.value.isHeight = true
    break
  default:
    c3.value.isHeight = false
  }
}


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
      coordinates: baseCoords.value,
    })
  }, 500)
}


watch(coorFrom, (to) => {

  baseCoords.value = {
    v1: coorFrom.value.v1 || 0.0,
    v2: coorFrom.value.v2 || 0.0,
    v3: coorFrom.value.v3 || 0.0,
    v4: coorFrom.value.v4 || 0.0,
  }
  formatInputCoor()
  toRepresentation()
})

watch(degreeFormat, () => {
  toRepresentation()
})

onMounted(async() => {
  await CRSInfo.value
  baseCoords.value = {
    v1: coorFrom.value.v1 || 0.0,
    v2: coorFrom.value.v2 || 0.0,
    v3: coorFrom.value.v3 || 0.0,
    v4: coorFrom.value.v4 || 0.0,
  }
  formatInputCoor()
  toRepresentation()

  const gSearch = document.querySelector('g-search')
  if (gSearch) {
    gSearch.setAttribute('data-token', import.meta.env.VITE_TOKEN)
  }
  document.querySelector('g-search').addEventListener('gsearch:select', (event) => {
    KtStore.setCoordinatesFrom({
      crs: 'EPSG:25832',
      coordinates: getGSearchCenterPoint(event.detail.geometry)
    })
  })
})



</script>

<style scoped>
.KT-input-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.KT-input-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 1rem;
  max-width: 100%;
  max-height: 2.5rem;
  margin-top: 0.5rem;
  justify-content: flex-start;
}
.KT-radio-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 0.5rem;
  justify-content: flex-end;
}
.KT-input-bottom-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 1rem;
  max-width: 100%;
  max-height: 2.5rem;
  margin-top: 0.5rem;
  justify-content: space-between;
  align-items: center;
}
</style>