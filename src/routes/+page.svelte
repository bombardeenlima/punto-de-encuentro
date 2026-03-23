<script lang="ts">
  import { ArrowRight, Activity, Globe, Scale, Maximize2 } from '@lucide/svelte';
</script>

<div class="max-w-4xl mx-auto space-y-24 py-12">
  
  <!-- Hero Centralized Minimal -->
  <section class="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
    <div class="inline-block rounded-full border border-border bg-card px-4 py-1.5 text-sm shadow-sm font-semibold text-muted-foreground">
      Voto Estratégico / 2026
    </div>
    <h1 class="text-6xl sm:text-7xl font-bold tracking-tighter">
      38 partidos.<br/>Un voto. <span class="text-primary italic">Úsalo bien.</span>
    </h1>
    <p class="mx-auto max-w-2xl text-xl text-muted-foreground leading-relaxed font-medium">
      Responde preguntas sobre tus posiciones, te ubicamos en cuatro ejes políticos y encontramos a los candidatos más cercanos a ti, 
      <span class="text-foreground underline decoration-border underline-offset-4">entre los que realmente tienen posibilidades.</span>
    </p>
    <div class="pt-4">
      <a href="/test-de-cercania" class="inline-flex rounded-full bg-foreground px-8 py-4 font-bold text-background shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
        → Encontrar mi candidato 
      </a>
      <p class="mt-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        100% Transparente &middot; Sin registro &middot; Sin datos
      </p>
    </div>
  </section>

  <hr class="border-border/60" />

  <!-- The Problem -->
  <section class="space-y-12">
    <div class="text-center">
      <h2 class="text-3xl font-bold tracking-tight">Votar en 2026 es más difícil de lo que parece</h2>
    </div>
    <div class="flex flex-col md:flex-row gap-8 text-center text-sm">
      <div class="flex-1 space-y-4">
        <div class="mx-auto w-12 h-1 border-b-2 border-primary mb-4"></div>
        <h3 class="text-xl font-bold">+30 partidos en carrera</h3>
        <p class="text-muted-foreground">Nunca antes el elector peruano tuvo tantas opciones, ni tantas posibilidades de perderse.</p>
      </div>
      <div class="flex-1 space-y-4">
        <div class="mx-auto w-12 h-1 border-b-2 border-primary mb-4"></div>
        <h3 class="text-xl font-bold">La mayoría no pasará la valla</h3>
        <p class="text-muted-foreground">Votar por alguien ideológicamente afín que no tiene viabilidad real favorece a quien menos te representa.</p>
      </div>
      <div class="flex-1 space-y-4">
        <div class="mx-auto w-12 h-1 border-b-2 border-primary mb-4"></div>
        <h3 class="text-xl font-bold">La afinidad sola no alcanza</h3>
        <p class="text-muted-foreground">No basta con encontrar al candidato que piensa como tú. Hay que encontrar al que tiene chance de ganar.</p>
      </div>
    </div>
  </section>

  <hr class="border-border/60" />

  <!-- How it works Bento -->
  <section class="grid md:grid-cols-2 gap-4">
    <div class="bg-card border border-border rounded-3xl p-8 md:p-12 md:col-span-2">
      <h2 class="text-2xl font-bold mb-2">Tres pasos para votar con criterio</h2>
      <p class="text-muted-foreground mb-8">Un proceso diseñado para darte claridad, sin sesgos emocionales.</p>
      <div class="grid sm:grid-cols-3 gap-6">
        <div>
          <span class="block text-4xl font-black text-muted-foreground/30 mb-2">01</span>
          <h3 class="font-bold mb-2">Toma posición</h3>
          <p class="text-sm text-muted-foreground">Respondes una serie de afirmaciones sobre economía y sociedad.</p>
        </div>
        <div>
          <span class="block text-4xl font-black text-muted-foreground/30 mb-2">02</span>
          <h3 class="font-bold mb-2">Te ubicamos</h3>
          <p class="text-sm text-muted-foreground">Nuestro modelo mapea tus respuestas en cuatro dimensiones reales.</p>
        </div>
        <div>
          <span class="block text-4xl font-black text-muted-foreground/30 mb-2">03</span>
          <h3 class="font-bold mb-2">Top 10 coincidencias</h3>
          <p class="text-sm text-muted-foreground">Solo mostramos candidatos viables. Ordenados por distancia ideológica.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Axes Grid -->
  <section class="space-y-8">
    <h2 class="text-3xl font-bold text-center">Un mapa político más honesto</h2>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-muted/50 p-6 rounded-2xl flex flex-col items-center text-center">
        <Scale class="w-8 h-8 mb-4 text-primary" />
        <h3 class="font-bold mb-2 text-sm">Izquierda — Derecha</h3>
        <p class="text-xs text-muted-foreground">Economía, regulación, Estado.</p>
      </div>
      <div class="bg-muted/50 p-6 rounded-2xl flex flex-col items-center text-center">
        <Activity class="w-8 h-8 mb-4 text-primary" />
        <h3 class="font-bold mb-2 text-sm">Liberal — Conservador</h3>
        <p class="text-xs text-muted-foreground">Cambio social, derechos, religión.</p>
      </div>
      <div class="bg-muted/50 p-6 rounded-2xl flex flex-col items-center text-center">
        <Globe class="w-8 h-8 mb-4 text-primary" />
        <h3 class="font-bold mb-2 text-sm">Nac. — Globalista</h3>
        <p class="text-xs text-muted-foreground">Soberanía, libre comercio, integración.</p>
      </div>
      <div class="bg-muted/50 p-6 rounded-2xl flex flex-col items-center text-center">
        <Maximize2 class="w-8 h-8 mb-4 text-primary" />
        <h3 class="font-bold mb-2 text-sm">Sistema — Antisist.</h3>
        <p class="text-xs text-muted-foreground">Renovación vs. continuidad.</p>
      </div>
    </div>
  </section>

  <!-- Filter & final CTA Combined -->
  <section class="bg-foreground text-background rounded-3xl p-10 md:p-16 text-center space-y-10">
    <div class="space-y-4 max-w-2xl mx-auto">
      <h2 class="text-3xl font-bold">Votar con afinidad significa votar con inteligencia</h2>
      <p class="text-background/80 text-lg">Por eso filtramos. Solo mostramos los 10 candidatos que, según proyecciones y encuestas actualizadas, tienen viabilidad electoral real.</p>
    </div>
    
    <div class="pt-8 border-t border-background/20 max-w-lg mx-auto">
      <h3 class="text-xl font-bold mb-6">Ya sabes cómo funciona. Descubre dónde estás.</h3>
      <a href="/test-de-cercania" class="inline-flex w-full items-center justify-center rounded-xl bg-background text-foreground py-4 font-bold text-lg transition-transform hover:scale-[1.02]">
        Empezar Test <ArrowRight class="ml-2 w-5 h-5"/>
      </a>
    </div>
    <div class="text-xs text-background/50 flex justify-center gap-4 uppercase font-semibold">
      <span>🔒 Privado</span>
      <span>⚡ Rápido</span>
      <span>🔍 Transparente</span>
    </div>
  </section>

</div>