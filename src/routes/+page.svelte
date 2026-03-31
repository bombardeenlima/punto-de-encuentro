<script lang="ts">
	import { ArrowRight, Activity, Globe, Scale, Maximize2 } from '@lucide/svelte';
</script>
<svelte:head>
        <title>Voto Estratégico - 2026</title>
</svelte:head>
<div class="mx-auto max-w-4xl space-y-24 py-12">
	<!-- Hero Centralized Minimal -->
	<section class="animate-in space-y-8 text-center duration-700 fade-in slide-in-from-bottom-8">
		<div
			class="inline-block rounded-full border border-border bg-card px-4 py-1.5 text-sm font-semibold text-muted-foreground shadow-sm"
		>
			Voto Estratégico - 2026
		</div>
		<h1 class="text-6xl font-bold tracking-tighter sm:text-7xl">
			38 partidos.<br />Un voto. <span class="text-primary italic">Úsalo bien.</span>
		</h1>
		<p class="mx-auto max-w-2xl text-xl leading-relaxed font-medium text-muted-foreground">
			Responde preguntas sobre tus posiciones, te ubicamos en cuatro ejes políticos y encontramos a
			los candidatos más cercanos a ti,
			<span class="text-foreground underline decoration-border underline-offset-4"
				>entre los que realmente tienen posibilidades.</span
			>
		</p>
		<div class="pt-4">
			<a
				href="/test-de-cercania"
				class="inline-flex rounded-full bg-foreground px-8 py-4 font-bold text-background shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
			>
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
			<h2 class="text-3xl font-bold tracking-tight">
				Votar en 2026 es más difícil de lo que parece
			</h2>
		</div>
		<div class="flex flex-col gap-8 text-center text-sm md:flex-row">
			<div class="flex-1 space-y-4">
				<div class="mx-auto mb-4 h-1 w-12 border-b-2 border-primary"></div>
				<h3 class="text-xl font-bold">+30 partidos en carrera</h3>
				<p class="text-muted-foreground">
					Nunca antes el elector peruano tuvo tantas opciones, ni tantas posibilidades de perderse.
				</p>
			</div>
			<div class="flex-1 space-y-4">
				<div class="mx-auto mb-4 h-1 w-12 border-b-2 border-primary"></div>
				<h3 class="text-xl font-bold">La mayoría no pasará la valla</h3>
				<p class="text-muted-foreground">
					Votar por alguien ideológicamente afín que no tiene viabilidad real favorece a quien menos
					te representa.
				</p>
			</div>
			<div class="flex-1 space-y-4">
				<div class="mx-auto mb-4 h-1 w-12 border-b-2 border-primary"></div>
				<h3 class="text-xl font-bold">La afinidad sola no alcanza</h3>
				<p class="text-muted-foreground">
					No basta con encontrar al candidato que piensa como tú. Hay que encontrar al que tiene
					chance de ganar.
				</p>
			</div>
		</div>
	</section>

	<hr class="border-border/60" />

	<!-- How it works Bento -->
	<section class="grid gap-4 md:grid-cols-2">
		<div class="rounded-3xl border border-border bg-card p-8 md:col-span-2 md:p-12">
			<h2 class="mb-2 text-2xl font-bold">Tres pasos para votar con criterio</h2>
			<p class="mb-8 text-muted-foreground">
				Un proceso diseñado para darte claridad, sin sesgos emocionales.
			</p>
			<div class="grid gap-6 sm:grid-cols-3">
				<div>
					<span class="mb-2 block text-4xl font-black text-muted-foreground/30">01</span>
					<h3 class="mb-2 font-bold">Toma posición</h3>
					<p class="text-sm text-muted-foreground">
						Respondes una serie de afirmaciones sobre economía y sociedad.
					</p>
				</div>
				<div>
					<span class="mb-2 block text-4xl font-black text-muted-foreground/30">02</span>
					<h3 class="mb-2 font-bold">Te ubicamos</h3>
					<p class="text-sm text-muted-foreground">
						Nuestro modelo mapea tus respuestas en cuatro dimensiones reales.
					</p>
				</div>
				<div>
					<span class="mb-2 block text-4xl font-black text-muted-foreground/30">03</span>
					<h3 class="mb-2 font-bold">Top 10 coincidencias</h3>
					<p class="text-sm text-muted-foreground">
						Solo mostramos candidatos viables. Ordenados por distancia ideológica.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Axes Grid -->
	<section class="space-y-8">
		<h2 class="text-center text-3xl font-bold">Un mapa político más honesto</h2>
		<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<div class="flex flex-col items-center rounded-2xl bg-muted/50 p-6 text-center">
				<Scale class="mb-4 h-8 w-8 text-primary" />
				<h3 class="mb-2 text-sm font-bold">Izquierda — Derecha</h3>
				<p class="text-xs text-muted-foreground">Economía, regulación, Estado.</p>
			</div>
			<div class="flex flex-col items-center rounded-2xl bg-muted/50 p-6 text-center">
				<Activity class="mb-4 h-8 w-8 text-primary" />
				<h3 class="mb-2 text-sm font-bold">Liberal — Conservador</h3>
				<p class="text-xs text-muted-foreground">Cambio social, derechos, religión.</p>
			</div>
			<div class="flex flex-col items-center rounded-2xl bg-muted/50 p-6 text-center">
				<Globe class="mb-4 h-8 w-8 text-primary" />
				<h3 class="mb-2 text-sm font-bold">Nac. — Globalista</h3>
				<p class="text-xs text-muted-foreground">Soberanía, libre comercio, integración.</p>
			</div>
			<div class="flex flex-col items-center rounded-2xl bg-muted/50 p-6 text-center">
				<Maximize2 class="mb-4 h-8 w-8 text-primary" />
				<h3 class="mb-2 text-sm font-bold">Sistema — Antisist.</h3>
				<p class="text-xs text-muted-foreground">Renovación vs. continuidad.</p>
			</div>
		</div>
	</section>

	<!-- Filter & final CTA Combined -->
	<section class="space-y-10 rounded-3xl bg-foreground p-10 text-center text-background md:p-16">
		<div class="mx-auto max-w-2xl space-y-4">
			<h2 class="text-3xl font-bold">Votar con afinidad significa votar con inteligencia</h2>
			<p class="text-lg text-background/80">
				Por eso filtramos. Solo mostramos los 10 candidatos que, según proyecciones y encuestas
				actualizadas, tienen viabilidad electoral real.
			</p>
		</div>

		<div class="mx-auto max-w-lg border-t border-background/20 pt-8">
			<h3 class="mb-6 text-xl font-bold">Ya sabes cómo funciona. Descubre dónde estás.</h3>
			<a
				href="/test-de-cercania"
				class="inline-flex w-full items-center justify-center rounded-xl bg-background py-4 text-lg font-bold text-foreground transition-transform hover:scale-[1.02]"
			>
				Empezar Test <ArrowRight class="ml-2 h-5 w-5" />
			</a>
		</div>
		<div class="flex justify-center gap-4 text-xs font-semibold text-background/50 uppercase">
			<span>🔒 Privado</span>
			<span>⚡ Rápido</span>
			<span>🔍 Transparente</span>
		</div>
	</section>
</div>
