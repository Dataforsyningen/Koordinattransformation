<template>
  <header class="ds-header koor-header">
    <ds-logo-title
      id="koor-hover-icon"
      title="Koordinattransformation"
      byline="Klimadatastyrelsen"
    />
    <ds-nav-responsive class="switch koor-nav">
      <!-- Use the #toggle slot inside a <template> -->
      <button 
        slot="toggle"
        title="Vis menu"
        class="secondary"
      >
        <svg><use href="../../assets/icons/icons.svg#burgerbar" /></svg>
      </button>

      <nav class="ds-panel ds-nav">
        <router-link to="/Denmark">
          <span class="medium">
            <svg><use href="../../assets/icons/icons.svg#denmark" /></svg>
          </span>
          <span> Danmark</span>
        </router-link>
        <router-link to="/Greenland">
          <span class="medium">
            <svg><use href="../../assets/icons/icons.svg#greenland" /></svg>
          </span>
          <span> Grønland</span>
        </router-link>
        <router-link to="/About">
          <span class="medium">
            <svg><use href="../../assets/icons/icons.svg#info" /></svg>
          </span>
          <span> Om Koordinattransformation</span>
        </router-link>
      </nav>
    </ds-nav-responsive>
  </header>
</template>

<script setup>
</script>

<style scoped>
.koor-header {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
}
#koor-hover-icon {
    margin-left: 3rem;
    margin-top: var(--space)
}
.koor-nav {
    margin: var(--space)
}
</style>