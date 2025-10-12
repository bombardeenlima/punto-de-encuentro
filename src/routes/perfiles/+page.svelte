<script lang="ts">
	import { Button, Card, CardContent, CardHeader, CardTitle } from "$lib";
	import type { PageData } from "./$types";

	type DisplayProfile = PageData["profiles"][number];

	export let data: PageData;

	const profiles: DisplayProfile[] = data.profiles;
</script>

<section class="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-16 sm:px-10">
	<div class="flex justify-center sm:justify-start">
		<Button
			variant="ghost"
			href="/"
			class="w-fit px-0 text-sm text-muted-foreground hover:text-foreground"
		>
			← Ir al Inicio
		</Button>
	</div>
	<header class="space-y-4 text-center sm:text-left">
		<h1 class="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
			Perfiles de partidos
		</h1>
		<p class="mx-auto max-w-2xl text-pretty text-muted-foreground sm:mx-0">
			Explorá los partidos inscritos y accedé a sus hojas de vida completas.
		</p>
	</header>

	{#if profiles.length > 0}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each profiles as profile}
				<a
					href={`/perfiles/${encodeURIComponent(profile.partido)}`}
					class="group h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
				>
					<Card class="flex h-full flex-col overflow-hidden border border-border/70 bg-background/95 transition duration-200 group-hover:border-primary/70 group-hover:shadow-md">
						<CardHeader class="flex flex-col items-start gap-4 p-6">
							{#if profile.logoUrl}
								<div class="flex h-20 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border/60 bg-muted/40 p-3">
									<img src={profile.logoUrl} alt={`Logo de ${profile.nombre}`} class="max-h-full max-w-full object-contain" loading="lazy" />
								</div>
							{/if}
							<CardTitle class="text-lg font-semibold text-foreground group-hover:text-primary">
								{profile.nombre}
							</CardTitle>
						</CardHeader>
					</Card>
				</a>
			{/each}
		</div>
	{:else}
		<p class="text-center text-muted-foreground sm:text-left">
			Aún no hay perfiles disponibles. Volvé pronto.
		</p>
	{/if}
</section>
