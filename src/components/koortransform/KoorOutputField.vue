<template>
  <div class="KT-output-container">
    <svg class="KT-icon">
      <use href="../../assets/icons/icons.svg#direction-east" />
    </svg>
    <span class="KT-coordinate">{{ outputCoor.v1 }}</span>
    <svg class="KT-icon">
      <use href="../../assets/icons/icons.svg#direction-north" />
    </svg>
    <span class="KT-coordinate">{{ outputCoor.v2 }}</span>

  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { useKtStore } from '../../store/store.js'

const KtStore = useKtStore()

// Get the coordinates from the store
const coorTo = computed(() => KtStore.getCoordinatesTo)
const coorFrom = computed(() => KtStore.getCoordinatesFrom)
const outputCoor = ref({ v1: null, v2: null, v3: null, v4: null })



const CRSInfo = computed(() => KtStore.getCRSToDisplayInfo)

//refs for output format
const isDegrees = computed(() => {
  return (CRSInfo.value.v1_unit === 'degree' && CRSInfo.value.v2_unit === 'degree')
})
const degreesFormat = ref('')

const isHeight = computed(() =>  CRSInfo.value.v3 !== null )
const heightFormat = ref('')


const props = defineProps({
  coordinateFormat: {
    type: String,
    default: ''
  }
})

// Convert coordinates into a desired representation
const toRepresentation = (coordinates, repr) => {
  let res = { v1: null, v2: null, v3: null, v4: null }
  if (repr === 'direct') {
    res.v1 = coordinates.v1
    res.v2 = coordinates.v2
    res.v3 = coordinates.v3
    res.v4 = coordinates.v4
    return res
  }
  return { v1: 0.0, v2: 0.0, v3: 0.0, v4: 0.0 }
}

// Watchers for changes in input/output coordinates
watch(coorFrom, () => {
  console.log('do we go here?')
  KtStore.setCoordinatesTo()
})

watch(coorTo, () => {
  //console.log(CRSInfo.value)
  outputCoor.value = toRepresentation(KtStore.CoordinatesTo, 'direct')
})
</script>

<style scoped>
.coordinate-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

</style>
