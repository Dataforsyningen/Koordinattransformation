<template>
  <dialog
    open
    class="koor-menu-inner"
  >
    <InputKoor
      :cover-area="coverArea"
      :input-options="CRSOptions"
    />
    <OutputKoor
      :cover-area="coverArea"
      :output-options="CRSOptions"
    />
  </dialog>
</template>

<script setup>
import InputKoor from './inputelements/InputKoor.vue'
import OutputKoor from './outputelements/OutputKoor.vue'
import { computed } from 'vue'
import { useKtStore } from '../../store/store.js'

const KtStore = useKtStore()

const coverArea = computed(() => KtStore.getCoverArea)

const CRSOptions = computed(() => {
  const getterName = 'getCRSDisplayOptions' + coverArea.value
  return KtStore[getterName]  || []
})
</script>

<style scoped>
.koor-menu-inner {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    min-height: 10rem;
    min-width: 60%;
    width: 80%;
}
</style>
