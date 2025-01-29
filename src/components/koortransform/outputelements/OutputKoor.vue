<template>
  <div class="KT-output-segment">
    <h2>Output</h2>
    <select
      id="epsg-select"
      v-model="selectedOption"
      name="epsg-select"
    >
      <option
        v-for="option in outputOptions"
        :key="option"
        :value="option"
      >
        {{ option }}
      </option>
    </select>
    <KoorOutputField />
  </div>
</template>

<script setup>
import KoorOutputField from './KoorOutputField.vue'
import { ref, watch, onMounted } from 'vue'
import { useKtStore } from '../../../store/store.js'
import { extractEPSGCode } from '../../../helperfunctions.js'

const KtStore = useKtStore()

const props = defineProps({
  coverArea: {
    type: String,
    default: 'DK',
  },
  outputOptions: {
    type: Array,
    default: () => [],
  },
})

const selectedOption = ref(props.outputOptions[0] || '')

watch(selectedOption, (to, from) => {
  KtStore.setCRSTo(extractEPSGCode(to))
  KtStore.setCoordinatesTo()
})
onMounted(() => {
  KtStore.setCRSTo(extractEPSGCode(selectedOption.value)) 
})

</script>

<style scoped>
.KT-output-segment {
    width: 50%;
}
</style>