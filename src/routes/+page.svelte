<script lang="ts">
	import { ArrowRight, X } from '@lucide/svelte';

	let showMethodologyPopup = $state(false);

	const candidatos = [
		{
			name: 'Roberto Sánchez',
			party: 'Juntos por el Perú',
			image:
				'https://upload.wikimedia.org/wikipedia/commons/f/f1/Roberto_Sanchez_Palomino_%28cropped%29.jpg',
			wikipedia: 'https://es.wikipedia.org/wiki/Roberto_S%C3%A1nchez_Palomino#',
			posiciones: [
				'Reforma constitucional vía Asamblea Constituyente',
				'Legalización del matrimonio igualitario',
				'Nacionalización de recursos naturales',
				'Estado como motor de la economía'
			]
		},
		{
			name: 'Keiko Fujimori',
			party: 'Fuerza Popular',
			image:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Keiko_Fujimori_2.jpg/960px-Keiko_Fujimori_2.jpg',
			wikipedia: 'https://es.wikipedia.org/wiki/Keiko_Fujimori#',
			posiciones: [
				'Defensa de la Constitución de 1993',
				'Unión civil patrimonial en lugar de matrimonio igualitario',
				'Asociaciones público-privadas para recursos',
				'Libre mercado con regulación estatal'
			]
		}
	];
</script>

<svelte:head>
	<title>Voto Estratégico - Segunda Vuelta 2026</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-24 py-12">
	<!-- Hero -->
	<section class="animate-in space-y-8 text-center duration-700 fade-in slide-in-from-bottom-8">
		<div
			class="inline-block rounded-full border border-border bg-card px-4 py-1.5 text-sm font-semibold text-muted-foreground shadow-sm"
		>
			Segunda Vuelta - 2026
		</div>
		<h1 class="text-5xl font-bold tracking-tighter sm:text-6xl lg:text-7xl">
			Dos candidatos.<br />Un voto. <span class="text-primary italic">Úsalo bien.</span>
		</h1>
		<p class="mx-auto max-w-2xl text-xl leading-relaxed font-medium text-muted-foreground">
			En segunda vuelta no hay tercera opción. O votas por uno, o votas por el otro.
			<span class="text-foreground underline decoration-border underline-offset-4"
				>Votar nulo es votar por ambos.</span
			>
		</p>
		<div class="pt-4">
			<a
				href="/test"
				class="inline-flex rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
			>
				Descubrir quién está más cerca de mí
			</a>
			<p class="mt-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
				8 preguntas &middot; 2 minutos &middot; Sin registro
			</p>
		</div>
	</section>

	<hr class="border-border/60" />

	<!-- El voto nulo -->
	<section class="space-y-8">
		<div class="text-center">
			<h2 class="text-3xl font-bold tracking-tight">¿Por qué importa esto?</h2>
		</div>
		<div class="flex flex-col gap-8 text-center text-sm md:flex-row">
			<div class="flex-1 space-y-4">
				<div class="mx-auto mb-4 h-1 w-12 border-b-2 border-primary"></div>
				<h3 class="text-xl font-bold">El voto nulo no es neutral</h3>
				<p class="text-muted-foreground">
					Votar nulo no le quita votos a nadie. Beneficia por igual a ambos candidatos. Es lo mismo
					que votar por los dos.
				</p>
			</div>
			<div class="flex-1 space-y-4">
				<div class="mx-auto mb-4 h-1 w-12 border-b-2 border-primary"></div>
				<h3 class="text-xl font-bold">No existe el "menos peor"</h3>
				<p class="text-muted-foreground">
					Si uno de los dos te representa más que el otro, ese es tu candidato. No se trata de
					perfección, se trata de cercanía.
				</p>
			</div>
			<div class="flex-1 space-y-4">
				<div class="mx-auto mb-4 h-1 w-12 border-b-2 border-primary"></div>
				<h3 class="text-xl font-bold">Tu voto cuenta</h3>
				<p class="text-muted-foreground">
					En segunda vuelta cada voto pesa. No regales tu decisión. Usala.
				</p>
			</div>
		</div>
	</section>

	<hr class="border-border/60" />

	<!-- Cómo funciona -->
	<section class="grid gap-4 md:grid-cols-2">
		<div class="rounded-3xl border border-border bg-card p-8 md:col-span-2 md:p-12">
			<h2 class="mb-2 text-2xl font-bold">¿Cómo funciona el test?</h2>
			<p class="mb-8 text-muted-foreground">
				Simple y directo. Sin ejes ideológicos, sin gráficos complicados.
			</p>
			<div class="grid gap-6 sm:grid-cols-3">
				<div>
					<span class="mb-2 block text-4xl font-black text-primary">01</span>
					<h3 class="mb-2 font-bold">8 temas clave</h3>
					<p class="text-sm text-muted-foreground">
						Te presentamos las posiciones de ambos candidatos sobre los temas que más importan.
					</p>
				</div>
				<div>
					<span class="mb-2 block text-4xl font-black text-primary">02</span>
					<h3 class="mb-2 font-bold">Elegís con quién coincidís</h3>
					<p class="text-sm text-muted-foreground">
						Por cada tema, elegís la posición con la que estás más de acuerdo.
					</p>
				</div>
				<div>
					<span class="mb-2 block text-4xl font-black text-primary">03</span>
					<h3 class="mb-2 font-bold">Ves con quién coincidís más</h3>
					<p class="text-sm text-muted-foreground">
						Al final te mostramos cuál de los dos candidatos está más cerca de tus posiciones.
					</p>
				</div>
			</div>
		</div>
	</section>

	<hr class="border-border/60" />

	<!-- Candidatos -->
	<section class="space-y-8">
		<div class="text-center">
			<h2 class="text-3xl font-bold tracking-tight">Los dos candidatos</h2>
			<p class="mt-4 text-muted-foreground">Conocé sus posiciones antes de decidir.</p>
		</div>
		<div class="grid gap-6 sm:grid-cols-2">
			{#each candidatos as candidato}
				<a
					href={candidato.wikipedia}
					target="_blank"
					rel="noopener noreferrer"
					class="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg sm:p-8"
				>
					<div class="mb-4 flex items-center gap-4">
						<div
							class="overflow-hidden rounded-full border-2 border-transparent transition-all group-hover:border-primary"
						>
							<img
								src={candidato.image}
								alt={candidato.name}
								class="h-20 w-20 object-cover sm:h-24 sm:w-24"
								loading="lazy"
							/>
						</div>
						<div>
							<h3 class="text-xl font-bold transition-colors group-hover:text-primary">
								{candidato.name}
							</h3>
							<p class="text-sm text-muted-foreground">{candidato.party}</p>
						</div>
					</div>
					<ul class="space-y-2">
						{#each candidato.posiciones as pos}
							<li class="flex items-start gap-2 text-sm text-muted-foreground">
								<span class="mt-1 text-primary">•</span>
								<span>{pos}</span>
							</li>
						{/each}
					</ul>
				</a>
			{/each}
		</div>
	</section>

	<hr class="border-border/60" />

	<!-- CTA Final -->
	<section class="space-y-10 rounded-3xl bg-foreground p-10 text-center text-background md:p-16">
		<div class="mx-auto max-w-2xl space-y-4">
			<h2 class="text-3xl font-bold">No votes a ciegas</h2>
			<p class="text-lg text-background/80">
				En segunda vuelta no hay excusa para no saber quién te representa más. 8 preguntas, 2
				minutos.
			</p>
		</div>

		<div class="mx-auto max-w-lg border-t border-background/20 pt-8">
			<h3 class="mb-6 text-xl font-bold">Descubrí dónde estás parado.</h3>
			<a
				href="/test"
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

	<!-- Link a primera vuelta -->
	<div class="text-center">
		<a
			href="/primera-vuelta"
			class="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
		>
			¿Querés ver los resultados de primera vuelta? →
		</a>
	</div>
</div>

<!-- Popup Metodología -->
{#if showMethodologyPopup}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div
			class="max-h-[90vh] w-full max-w-2xl animate-in overflow-y-auto rounded-2xl border border-border bg-card shadow-xl duration-300 fade-in zoom-in"
		>
			<div
				class="sticky top-0 flex items-center justify-between border-b border-border bg-card p-6 sm:p-8"
			>
				<h3 class="text-xl font-bold sm:text-2xl">Metodología</h3>
				<button
					onclick={() => (showMethodologyPopup = false)}
					class="ml-4 flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-muted"
					aria-label="Cerrar"
				>
					<X class="h-6 w-6 text-foreground" />
				</button>
			</div>
			<div class="space-y-4 p-6 leading-relaxed text-muted-foreground sm:p-8">
				<p>
					Las posiciones de cada candidato fueron recopiladas de fuentes públicas: entrevistas,
					declaraciones, planes de gobierno y votaciones en el Congreso. Cada posición es una cita
					textual con su fuente correspondiente.
				</p>
			</div>
		</div>
	</div>
{/if}
