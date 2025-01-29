<template>
  <div class="KT-input-segment">
    <h2>Input</h2>
    <select
      id="epsg-select"
      v-model="selectedOption"
      name="epsg-select"
    >
      <option
        v-for="option in inputOptions"
        :key="option"
        :value="option"
      >
        {{ option }}
      </option>
    </select>
    <KoorInputField />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useKtStore } from '../../../store/store.js'
import { extractEPSGCode } from '../../../helperfunctions.js'
import KoorInputField from './KoorInputField.vue'

const KtStore = useKtStore()

const props = defineProps({
  coverArea: {
    type: String,
    default: 'DK',
  },
  inputOptions: {
    type: Array,
    default: () => [],
  },
})
const selectedOption = ref(props.inputOptions[0] || '')

watch(selectedOption, (to, from) => {
  KtStore.setCRSFrom(extractEPSGCode(to))
  //not needed for reactive use, thus we don't use getter here
  KtStore.setCoordinatesFrom({crs: extractEPSGCode(from), coordinates: KtStore.CoordinatesFrom})
})
onMounted(() => {
  KtStore.setCRSFrom(extractEPSGCode(selectedOption.value))
})
</script>

<style scoped>
.KT-input-segment {
    width: 50%;
}
</style>
