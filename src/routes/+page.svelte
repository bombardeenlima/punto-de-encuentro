<script lang="ts">
	import { Button } from '$lib';

	type Action = {
		label: string;
		href: string;
		description: string;
	};

	const actions = [
		{
			label: 'Test de Cercania con Partidos',
			href: '/test-de-cercania',
			description:
				'Descubre qué fuerza política se alinea con tus prioridades sociales y económicas.'
		},
		{
			label: 'Posición de Partidos en Temas',
			href: '/posiciones',
			description:
				'Explora cómo se posiciona cada partido frente a los temas clave del debate público.'
		},
		{
			label: 'Perfil de Partidos',
			href: '/perfiles',
			description: 'Accede a un resumen claro de la historia, valores y propuestas de cada partido.'
		}
	] satisfies Action[];
</script>

<main id="main-content" class="min-h-screen bg-background" aria-labelledby="inicio-heading">
	<div
		class="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-12 px-6 py-16 sm:px-10"
	>
		<header class="space-y-4 text-center" id="inicio-heading">
			<p class="text-sm font-semibold tracking-[0.3em] text-muted-foreground uppercase">
				Punto de Encuentro
			</p>
			<h1 class="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
				Elige la herramienta que mejor te acerca a la política que quieres.
			</h1>
			<p class="mx-auto max-w-2xl text-base text-balance text-muted-foreground sm:text-lg">
				Analizá coincidencias, compará posiciones o profundizá en cada partido con recursos pensados
				para tomar decisiones informadas.
			</p>
		</header>

		<nav class="flex w-full flex-col items-center gap-6" aria-label="Herramientas disponibles">
			<ul class="flex w-full flex-col items-center gap-6">
				{#each actions as action, index (action.href)}
					<li class="flex w-full justify-center">
						<Button
							variant="main"
							href={action.href}
							class="group"
							aria-describedby={`action-description-${index}`}
						>
							<span class="text-xl leading-tight font-semibold text-balance break-words sm:text-2xl"
								>{action.label}</span
							>
							<span
								id={`action-description-${index}`}
								class="text-sm font-normal text-pretty break-words text-muted-foreground transition-colors group-hover:text-foreground sm:text-base"
							>
								{action.description}
							</span>
						</Button>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</main>
