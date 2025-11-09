<template>
  <div class="app-container">
    <StarAnimation />
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
}

.content {
  position: relative;
  z-index: 1;
  pointer-events: auto;
}
</style>
