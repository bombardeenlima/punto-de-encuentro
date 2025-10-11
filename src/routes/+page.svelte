<script lang="ts">
	import { Button } from "$lib";

	type Action = {
		label: string;
		href: string;
		description: string;
	};

	const actions = [
		{
			label: "Test de Cercania con Partidos",
			href: "/test-de-cercania",
			description: "Descubrí qué fuerza política se alinea con tus prioridades sociales y económicas.",
		},
		{
			label: "Posición de Partidos en Temas",
			href: "/posiciones",
			description: "Explorá cómo se posiciona cada partido frente a los temas clave del debate público.",
		},
		{
			label: "Perfil de Partidos",
			href: "/perfiles",
			description: "Accedé a un resumen claro de la historia, valores y propuestas de cada partido.",
		},
	] satisfies Action[];
</script>

<section class="min-h-screen bg-background">
	<div class="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-12 px-6 py-16 sm:px-10">
		<header class="space-y-4 text-center">
			<p class="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Punto de Encuentro</p>
			<h1 class="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
				Elige la herramienta que mejor te acerca a la política que quieres.
			</h1>
			<p class="mx-auto max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
				Analizá coincidencias, compará posiciones o profundizá en cada partido con recursos pensados para tomar decisiones informadas.
			</p>
		</header>

		<div class="flex w-full flex-col items-center gap-6">
			{#each actions as action}
				<Button variant="main" href={action.href} class="group">
					<span class="text-balance text-xl font-semibold leading-tight break-words sm:text-2xl">{action.label}</span>
					<span class="text-pretty text-sm font-normal text-muted-foreground transition-colors group-hover:text-foreground break-words sm:text-base">
						{action.description}
					</span>
				</Button>
			{/each}
		</div>
	</div>
</section>
