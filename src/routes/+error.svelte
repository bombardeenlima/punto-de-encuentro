<script lang="ts">
  import { Button } from "$lib";
</script>

<svelte:head>
  <title>Página no encontrada</title>
</svelte:head>

<section class="min-h-screen flex items-center justify-center bg-stone-950 text-stone-50">
  <div class="text-center space-y-6 px-6">
    <div class="space-y-4">
      <h1 class="text-3xl font-semibold">¡Muchas gracias por explorar!</h1>
      <p class="text-lg">
        Estamos trabajando para aumentar la cantidad de información, ten paciencia &lt;3
      </p>
    </div>
    <div class="flex justify-center">
      <Button
        variant="ghost"
        href="/"
        class="px-0 text-sm text-stone-300 hover:text-white"
      >
        ← Volver a Inicio
      </Button>
    </div>
  </div>
</section>
