<template>
    <KoorMap />
    <KoorForm class="KoorForm" />
</template>

<script setup>
import KoorMap from '../components/map/KoorMap.vue'
import KoorForm from '../components/koortransform/KoorForm.vue'
import { onBeforeMount } from 'vue'
import { useKtStore } from '../store/store.js';

const KtStore = useKtStore()

onBeforeMount(() => {
    KtStore.setCoverArea('DK')
})
</script>

<style>
.KoorForm {
  position: absolute;
  top: 10%;
  z-index: 10;
}
</style>

