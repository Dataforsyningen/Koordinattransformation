<template>
  <p>{{ coor }}</p>
</template>

<script setup>
import { useKtStore } from '../store/store.js'
import { computed } from 'vue'

const KtStore = useKtStore()

const coor = computed(() => KtStore.getCRSDisplayOptionsDK)


</script>