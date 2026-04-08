<script lang="ts">
	import { ArrowRight, Activity, Globe, Scale, Maximize2, Info, X } from '@lucide/svelte';
	import { writable } from 'svelte/store';

	let showPopup = false;
	let showEconomicPopup = false;
	let showSocialPopup = false;
	let showInternationalPopup = false;
	let showSystemPopup = false;

	const candidatos = [
		{ name: 'Carlos Álvarez', image: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Carlos_%C3%81lvarez_2025_%28cropped%29.jpg', wikipedia: 'https://es.wikipedia.org/wiki/Carlos_%C3%81lvarez_(humorista)#' },
		{ name: 'César Acuña', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/C%C3%89SAR_ACU%C3%91A_PERALTA-WIKIPEDIA-PERFIL.jpg', wikipedia: 'https://es.wikipedia.org/wiki/C%C3%A9sar_Acu%C3%B1a#' },
		{ name: 'Jorge Nieto', image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Jorge_Nieto.jpg', wikipedia: 'https://es.wikipedia.org/wiki/Jorge_Nieto#' },
		{ name: 'Keiko Fujimori', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Keiko_Fujimori_2.jpg/960px-Keiko_Fujimori_2.jpg', wikipedia: 'https://es.wikipedia.org/wiki/Keiko_Fujimori#' },
		{ name: 'Rafael López Aliaga', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Aliaga.jpg/960px-Aliaga.jpg', wikipedia: 'https://es.wikipedia.org/wiki/Rafael_L%C3%B3pez-Aliaga#' },
		{ name: 'Alfonso López Chau', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Alfonso_L%C3%B3pez-Chau.jpg', wikipedia: 'https://es.wikipedia.org/wiki/Alfonso_L%C3%B3pez-Chau#' },
		{ name: 'Ricardo Belmont', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Ricardo_Belmont_3.jpg/960px-Ricardo_Belmont_3.jpg', wikipedia: 'https://es.wikipedia.org/wiki/Ricardo_Belmont#' },
		{ name: 'Roberto Sánchez', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Roberto_Sanchez_Palomino_%28cropped%29.jpg', wikipedia: 'https://es.wikipedia.org/wiki/Roberto_S%C3%A1nchez_Palomino#' },
		{ name: 'Marisol Pérez Tello', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/MarisolP%C3%A9rezTello.jpg/500px-MarisolP%C3%A9rezTello.jpg', wikipedia: 'https://es.wikipedia.org/wiki/Marisol_P%C3%A9rez_Tello' },
		{ name: 'Yonhy Lescano', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Yonhy_Lescano_2012_%28cropped%29.jpg/960px-Yonhy_Lescano_2012_%28cropped%29.jpg', wikipedia: 'https://es.wikipedia.org/wiki/Yonhy_Lescano#' }
	];
</script>

<svelte:head>
        <title>Voto Estratégico - 2026</title>
</svelte:head>
<div style="position: fixed; top: 20px; left: 20px; z-index: 50;">
	<a href="/Informe%20de%20Transparencia%20-%20Voto%20Estrat%C3%A9gico%20032026.pdf" target="_blank" rel="noopener noreferrer" 
     style="display: inline-block; 
             background-color: black; 
             color: white; 
             padding: 8px 16px; 
             border-radius: 20px; 
             text-decoration: none;
             font-size: 14px;
             line-height: 1.5;
             font-weight: 500;
             transition: all 0.3s ease;
             box-shadow: 0 2px 8px rgba(0,0,0,0.15);
             white-space: nowrap;">
    Transparencia
  </a>
</div>
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
				class="inline-flex rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
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
					<span class="mb-2 block text-4xl font-black text-primary">01</span>
					<h3 class="mb-2 font-bold">Toma posición</h3>
					<p class="text-sm text-muted-foreground">
						Respondes una serie de afirmaciones sobre economía y sociedad.
					</p>
				</div>
				<div>
					<span class="mb-2 block text-4xl font-black text-primary">02</span>
					<h3 class="mb-2 font-bold">Te ubicamos</h3>
					<p class="text-sm text-muted-foreground">
						Nuestro modelo mapea tus respuestas en cuatro dimensiones reales.
					</p>
				</div>
				<div>
					<span class="mb-2 block text-4xl font-black text-primary">03</span>
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
			<button 
				on:click={() => showEconomicPopup = true}
				class="relative flex flex-col items-center rounded-2xl bg-muted/50 p-8 text-center hover:bg-muted transition-colors cursor-pointer group min-h-56"
				aria-label="Información sobre el eje económico"
			>
				<Scale class="mb-4 h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
				<h3 class="mb-2 text-sm font-bold">Económico</h3>
				<p class="text-xs text-muted-foreground flex-grow">Sobre el rol del Estado en la economía.</p>
				<div class="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-primary">
					Ver más <ArrowRight class="h-3.5 w-3.5" />
				</div>
			</button>
			<button 
				on:click={() => showSocialPopup = true}
				class="relative flex flex-col items-center rounded-2xl bg-muted/50 p-8 text-center hover:bg-muted transition-colors cursor-pointer group min-h-56"
				aria-label="Información sobre el eje social"
			>
				<Activity class="mb-4 h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
				<h3 class="mb-2 text-sm font-bold">Social</h3>
				<p class="text-xs text-muted-foreground flex-grow">Sobre el rol del Estado en la sociedad.</p>
				<div class="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-primary">
					Ver más <ArrowRight class="h-3.5 w-3.5" />
				</div>
			</button>
			<button 
				on:click={() => showInternationalPopup = true}
				class="relative flex flex-col items-center rounded-2xl bg-muted/50 p-8 text-center hover:bg-muted transition-colors cursor-pointer group min-h-56"
				aria-label="Información sobre el eje internacional"
			>
				<Globe class="mb-4 h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
				<h3 class="mb-2 text-sm font-bold">Internacional</h3>
				<p class="text-xs text-muted-foreground flex-grow">Sobre el rol del Estado en la comunidad internacional.</p>
				<div class="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-primary">
					Ver más <ArrowRight class="h-3.5 w-3.5" />
				</div>
			</button>
			<button 
				on:click={() => showSystemPopup = true}
				class="relative flex flex-col items-center rounded-2xl bg-muted/50 p-8 text-center hover:bg-muted transition-colors cursor-pointer group min-h-56"
				aria-label="Información sobre el eje del sistema"
			>
				<Maximize2 class="mb-4 h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
				<h3 class="mb-2 text-sm font-bold">Sistema</h3>
				<p class="text-xs text-muted-foreground flex-grow">Sobre la conformidad con el sistema actual.</p>
				<div class="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-primary">
					Ver más <ArrowRight class="h-3.5 w-3.5" />
				</div>
			</button>
		</div>
	</section>

	<hr class="border-border/60" />

	<!-- Candidates Section -->
	<section class="space-y-8">
		<div class="text-center">
			<div class="flex items-center justify-center gap-2">
				<h2 class="text-3xl font-bold tracking-tight">Candidatos Viables</h2>
				<button 
					on:click={() => showPopup = true}
					class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
					aria-label="Información sobre criterios de viabilidad"
				>
					<Info class="h-5 w-5 text-primary" />
				</button>
			</div>
			<p class="mt-4 text-muted-foreground">
				Te conectamos con las opciones que realmente importan en esta elección.
			</p>
		</div>
		<div class="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
			{#each candidatos as candidato}
				<a href="{candidato.wikipedia}" target="_blank" rel="noopener noreferrer" class="group mx-auto flex flex-col items-center gap-3">
					<div class="overflow-hidden rounded-full border-2 border-transparent shadow-md transition-all duration-300 group-hover:scale-105 group-hover:border-primary group-hover:shadow-lg">
						<img src="{candidato.image}" alt="{candidato.name}" class="h-28 w-28 object-cover sm:h-32 sm:w-32" loading="lazy" />
					</div>
					<h3 class="text-center text-sm font-semibold group-hover:text-primary transition-colors">{candidato.name}</h3>
				</a>
			{/each}
		</div>
	</section>

	<hr class="border-border/60" />

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

<!-- Popup Modal - Candidatos Viables -->
{#if showPopup}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl animate-in fade-in zoom-in duration-300">
			<!-- Header con botón de cerrar -->
			<div class="sticky top-0 bg-card border-b border-border flex items-center justify-between p-6 sm:p-8">
				<h3 class="text-xl sm:text-2xl font-bold">Justificación de candidatos viables</h3>
				<button
					on:click={() => showPopup = false}
					class="flex-shrink-0 p-2 hover:bg-muted rounded-lg transition-colors ml-4"
					aria-label="Cerrar"
				>
					<X class="h-6 w-6 text-foreground" />
				</button>
			</div>

			<!-- Contenido -->
			<div class="p-6 sm:p-8 space-y-4 text-muted-foreground leading-relaxed">
				<p>
					Seleccionamos a los candidatos del top 10 con dos criterios simples. Primero, tomamos en cuenta las encuestas más recientes para incluir a quienes tienen mayores probabilidades de pasar a segunda vuelta. Segundo, priorizamos a aquellos sobre los que existe más información pública (entrevistas, debates y declaraciones), lo que nos permite calcular su posición con mayor precisión.
				</p>
			</div>
		</div>
	</div>
{/if}

<!-- Popup Modal - Eje Económico -->
{#if showEconomicPopup}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl animate-in fade-in zoom-in duration-300">
			<!-- Header con botón de cerrar -->
			<div class="sticky top-0 bg-card border-b border-border flex items-center justify-between p-6 sm:p-8">
				<div class="flex-1">
					<h3 class="text-xl sm:text-2xl font-bold">Económico</h3>
					<p class="text-sm text-muted-foreground mt-1">Sobre el rol del Estado en la economía</p>
				</div>
				<button
					on:click={() => showEconomicPopup = false}
					class="flex-shrink-0 p-2 hover:bg-muted rounded-lg transition-colors ml-4"
					aria-label="Cerrar"
				>
					<X class="h-6 w-6 text-foreground" />
				</button>
			</div>

			<!-- Contenido -->
			<div class="p-6 sm:p-8 space-y-6 text-muted-foreground leading-relaxed">

				<div>
					<h4 class="text-foreground font-bold mb-3">Izquierda</h4>
					<ul class="space-y-2 ml-4">
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Mayor intervención del Estado</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Redistribución de la riqueza</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Fortalecimiento de bienes y servicios públicos</span>
						</li>
					</ul>
				</div>

				<div>
					<h4 class="text-foreground font-bold mb-3">Derecha</h4>
					<ul class="space-y-2 ml-4">
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Libre mercado</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Promoción de la inversión privada</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Reducción del tamaño del Estado</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Popup Modal - Eje Social -->
{#if showSocialPopup}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl animate-in fade-in zoom-in duration-300">
			<!-- Header con botón de cerrar -->
			<div class="sticky top-0 bg-card border-b border-border flex items-center justify-between p-6 sm:p-8">
				<div class="flex-1">
					<h3 class="text-xl sm:text-2xl font-bold">Social</h3>
					<p class="text-sm text-muted-foreground mt-1">Sobre el rol del Estado en la sociedad</p>
				</div>
				<button
					on:click={() => showSocialPopup = false}
					class="flex-shrink-0 p-2 hover:bg-muted rounded-lg transition-colors ml-4"
					aria-label="Cerrar"
				>
					<X class="h-6 w-6 text-foreground" />
				</button>
			</div>

			<!-- Contenido -->
			<div class="p-6 sm:p-8 space-y-6 text-muted-foreground leading-relaxed">

				<div>
					<h4 class="text-foreground font-bold mb-3">Liberal</h4>
					<ul class="space-y-2 ml-4">
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Respeto a las libertades individuales</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Ampliación de derechos civiles</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Menor regulación de la vida privada</span>
						</li>
					</ul>
				</div>

				<div>
					<h4 class="text-foreground font-bold mb-3">Conservador</h4>
					<ul class="space-y-2 ml-4">
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Preferencia por el orden social</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Mano dura frente al delito</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Defensa de valores tradicionales</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Popup Modal - Eje Internacional -->
{#if showInternationalPopup}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl animate-in fade-in zoom-in duration-300">
			<!-- Header con botón de cerrar -->
			<div class="sticky top-0 bg-card border-b border-border flex items-center justify-between p-6 sm:p-8">
				<div class="flex-1">
					<h3 class="text-xl sm:text-2xl font-bold">Internacional</h3>
					<p class="text-sm text-muted-foreground mt-1">Sobre el rol del Estado en la comunidad internacional</p>
				</div>
				<button
					on:click={() => showInternationalPopup = false}
					class="flex-shrink-0 p-2 hover:bg-muted rounded-lg transition-colors ml-4"
					aria-label="Cerrar"
				>
					<X class="h-6 w-6 text-foreground" />
				</button>
			</div>

			<!-- Contenido -->
			<div class="p-6 sm:p-8 space-y-6 text-muted-foreground leading-relaxed">

				<div>
					<h4 class="text-foreground font-bold mb-3">Nacionalista</h4>
					<ul class="space-y-2 ml-4">
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Protección de la producción local</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Migración limitada y estricta</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Menor dependencia de organismos internacionales</span>
						</li>
					</ul>
				</div>

				<div>
					<h4 class="text-foreground font-bold mb-3">Globalista</h4>
					<ul class="space-y-2 ml-4">
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Libre comercio internacional</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Migración y fronteras abiertas</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Participación en organismos internacionales</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Popup Modal - Eje del Sistema -->
{#if showSystemPopup}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<div class="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl animate-in fade-in zoom-in duration-300">
			<!-- Header con botón de cerrar -->
			<div class="sticky top-0 bg-card border-b border-border flex items-center justify-between p-6 sm:p-8">
				<div class="flex-1">
					<h3 class="text-xl sm:text-2xl font-bold">Sistema</h3>
					<p class="text-sm text-muted-foreground mt-1">Sobre la conformidad con el sistema actual</p>
				</div>
				<button
					on:click={() => showSystemPopup = false}
					class="flex-shrink-0 p-2 hover:bg-muted rounded-lg transition-colors ml-4"
					aria-label="Cerrar"
				>
					<X class="h-6 w-6 text-foreground" />
				</button>
			</div>

			<!-- Contenido -->
			<div class="p-6 sm:p-8 space-y-6 text-muted-foreground leading-relaxed">

				<div>
					<h4 class="text-foreground font-bold mb-3">Antisistema</h4>
					<ul class="space-y-2 ml-4">
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Cambio constitucional (asamblea constituyente)</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Reformas estructurales profundas</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Cuestionamiento del sistema político actual</span>
						</li>
					</ul>
				</div>

				<div>
					<h4 class="text-foreground font-bold mb-3">Prosistema</h4>
					<ul class="space-y-2 ml-4">
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Respeto al marco constitucional vigente</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Reformas graduales a las instituciones</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="text-primary font-bold mt-0.5">•</span>
							<span>Continuidad del modelo político</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
{/if}
