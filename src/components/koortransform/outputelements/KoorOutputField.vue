<template>
  <div class="KT-output-column">
    <span class="KT-output-coord">
      {{ outputCoor }}
    </span>
    <span
      v-if="!isMeter"
      class="KT-radio-row"
    >
      <input
        id="D"
        v-model="degreeFormat"
        type="radio"
        name="outformat"
        value="D"
        checked="checked"
      >
      <label for="D">D</label><br>
      <input
        id="D.min"
        v-model="degreeFormat"
        type="radio"
        name="outformat"
        value="D.min"
      >
      <label for="D.min">D.min </label><br>
      <input
        id="D.min.sec"
        v-model="degreeFormat"
        type="radio"
        name="outformat"
        value="D.min.sec"
      >
      <label for="D.min.sec">D.min.sec</label>
    </span>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { useKtStore } from '../../../store/store.js'

const KtStore = useKtStore()

// Get the coordinates from the store
const coorTo = computed(() => KtStore.getCoordinatesTo)
const coorFrom = computed(() => KtStore.getCoordinatesFrom)
const CRSInfo = computed(() => KtStore.getCRSToDisplayInfo)

const isMeter = ref(true)
const degreeFormat = ref('D')
const c1 = ref({
  cMeter: 0.0,
  cDegree: 0.0,
  cMinute: 0.0,
  cSecond: 0.0,
  dirIndicator: '',
})
const c2 = ref({
  cMeter: 0.0,
  cDegree: 0.0,
  cMinute: 0.0,
  cSecond: 0.0,
  dirIndicator: '',
})
const c3 = ref({
  cMeter: 0.0,
  isHeight: false,
})

const outputCoor = ref('')

const formatOutputCoor = () => {
  isMeter.value = CRSInfo.value.v1_unit === 'metre' && CRSInfo.value.v2_unit === 'metre'

  c1.value.dirIndicator = CRSInfo.value.v1 === 'Breddegrad' ? 'N' : 'm'
  c2.value.dirIndicator = CRSInfo.value.v2 === 'Længdegrad' ? 'E' : 'm'
  c3.value.isHeight = Boolean(CRSInfo.value.v3)
}

const toRepresentation = () => {
  let d1, d2, m1, m2, s1, s2
  if(isMeter.value){
    c1.value.cMeter = parseFloat(coorTo.value.v1).toFixed(4)
    c2.value.cMeter = parseFloat(coorTo.value.v2).toFixed(4)
  }
  else{
    switch (degreeFormat.value) {
    case 'D': 
      c1.value.cDegree = parseFloat(coorTo.value.v1).toFixed(8)
      c2.value.cDegree = parseFloat(coorTo.value.v2).toFixed(8)
      break
    case 'D.min':
      d1 = Math.floor(coorTo.value.v1)
      d2 = Math.floor(coorTo.value.v2)

      m1 = parseFloat(((coorTo.value.v1 - d1) * 60)).toFixed(6)
      m2 = parseFloat(((coorTo.value.v2 - d2) * 60)).toFixed(6)

      c1.value.cDegree = d1
      c1.value.cMinute = m1

      c2.value.cDegree = d2
      c2.value.cMinute = m2
      break
    case 'D.min.sec':
      d1 = Math.floor(coorTo.value.v1)
      d2 = Math.floor(coorTo.value.v2)

      m1 = Math.floor((coorTo.value.v1 - d1) * 60)
      m2 = Math.floor((coorTo.value.v2 - d2) * 60)

      s1 = ((coorTo.value.v1 - d1 - m1 / 60) * 3600).toFixed(4)
      s2 = ((coorTo.value.v2 - d2 - m2 / 60) * 3600).toFixed(4)

      c1.value.cDegree = d1
      c1.value.cMinute = m1
      c1.value.cSecond = s1

      c2.value.cDegree = d2
      c2.value.cMinute = m2
      c2.value.cSecond = s2
      break
    }
  }

  c3.value.cMeter = c3.value.isHeight && coorTo.value.v3 ? parseFloat(coorTo.value.v3).toFixed(4) : 0.0
}

const toStringRepr = () => {
  let coord1, coord2, height
  if (isMeter.value) {
    coord1 = `${c1.value.cMeter}${c1.value.dirIndicator}`
    coord2 = `${c2.value.cMeter}${c2.value.dirIndicator}`
    
  }
  else{
    switch(degreeFormat.value) {
    case 'D' :
      coord1 = `${c1.value.cDegree}${c1.value.dirIndicator}`
      coord2 = `${c2.value.cDegree}${c2.value.dirIndicator}`
      break
    case 'D.min':
      coord1 = `${c1.value.cDegree}° ${c1.value.cMeter} \'${c1.value.dirIndicator}`
      coord2 = `${c2.value.cDegree}° ${c2.value.cMeter} \'${c2.value.dirIndicator}`
      break
    case 'D.min.sec' :
      coord1 = `${c1.value.cDegree}° ${c1.value.cMeter}\' ${c1.value.cSecond}\'\'${c1.value.dirIndicator}`
      coord2 = `${c2.value.cDegree}° ${c2.value.cMeter}\' ${c2.value.cSecond}\'\'${c2.value.dirIndicator}`
      break
    }
  }
  height = c3.value.isHeight ? `, ${c3.value.cMeter} m` : ''
  outputCoor.value = `${coord1}, ${coord2}${height}`
}

watch(CRSInfo, () => {
  formatOutputCoor()
})
// Watchers for changes in input/output coordinates
watch(coorFrom, () => {
  KtStore.setCoordinatesTo()
})

watch(coorTo, () => {
  toRepresentation()
  toStringRepr()
})
watch(degreeFormat, () => {
  toRepresentation()
  toStringRepr()
})
</script>

<style scoped>
.KT-output-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.KT-output-row {
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
.KT-output-coord {
  background-color: var(--c7);
  color: var(--grey1);
  border-radius: 1rem;
  margin-top: 1rem;
  margin-left: 1rem;
  padding: 0.4rem;
}
</style>
