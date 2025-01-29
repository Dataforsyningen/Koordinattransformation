<template>
  <KoorHeader />
  <main>
    <router-view />
  </main>
</template>


<script setup>
import KoorHeader from './components/shared/KoorHeader.vue'
import { useKtStore } from './store/store.js'
import { onBeforeMount } from 'vue'

const KtStore = useKtStore()
onBeforeMount(async () => {
  await KtStore.fetchCRSOptions()
})

</script>
