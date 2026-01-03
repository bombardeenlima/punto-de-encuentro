<script lang="ts">
	import { Button } from '$lib';
	import { Users, ArrowRight } from '@lucide/svelte';
	import type { PageData } from './$types';

	type DisplayProfile = PageData['profiles'][number];

	const { data } = $props<{ data: PageData }>();

	const profiles = $derived(data.profiles);

	const slugify = (value: string) =>
		value
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');

	const profilesWithMetadata = $derived(
		profiles.map((profile, index) => {
			const base = profile.partido ?? profile.nombre;
			const slug = slugify(base);
			const headingId = `profile-${slug || index}`;
			return {
				...profile,
				headingId,
				href: `/perfiles/${encodeURIComponent(profile.partido ?? profile.nombre)}`
			};
		})
	);
</script>

<div class="mx-auto max-w-5xl px-6 py-16">
	<div class="mb-12">
		<Button
			variant="ghost"
			href="/"
			class="mb-6 flex w-fit items-center gap-2 px-0 text-sm text-muted-foreground hover:text-foreground"
		>
			<span aria-hidden="true">←</span>
			<span>Ir al Inicio</span>
		</Button>
		<h1 class="mb-4 text-5xl leading-tight font-bold tracking-tight text-foreground">
			Perfiles de partidos
		</h1>
		<p class="max-w-2xl text-lg text-muted-foreground">
			Explorá los partidos inscritos y accedé a sus hojas de vida completas.
		</p>
	</div>

	{#if profilesWithMetadata.length > 0}
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{#each profilesWithMetadata as profile}
				<a
					href={profile.href}
					class="group flex min-h-[220px] flex-col justify-between rounded-md border border-border bg-card p-6 transition-all hover:bg-accent/50"
					aria-labelledby={profile.headingId}
				>
					<div>
						{#if profile.logoUrl}
							<div class="mb-4 flex h-16 items-center justify-center rounded-md bg-muted/50 p-3">
								<img
									src={profile.logoUrl}
									alt={`Logo de ${profile.nombre}`}
									class="max-h-full max-w-full object-contain"
									loading="lazy"
								/>
							</div>
						{:else}
							<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-md bg-muted">
								<Users class="h-8 w-8 text-foreground/60" />
							</div>
						{/if}
						<h2 id={profile.headingId} class="text-lg leading-tight font-semibold text-foreground">
							{profile.nombre}
						</h2>
						{#if profile.ideologia}
							<p class="mt-2 text-sm text-muted-foreground">
								{profile.ideologia}
							</p>
						{/if}
					</div>
					<div
						class="mt-4 flex items-center text-sm font-medium text-foreground/60 group-hover:text-foreground/80"
					>
						<span class="mr-1">Ver perfil</span>
						<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div class="rounded-md border border-dashed border-border bg-card/30 p-12 text-center">
			<p class="text-muted-foreground">Aún no hay perfiles disponibles. Volvé pronto.</p>
		</div>
	{/if}
</div>
