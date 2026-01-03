<script lang="ts">
	import { Button, Card, CardContent, CardHeader, CardTitle, CartesianPlane } from '$lib';
	import type { PageData } from './$types';

	type Profile = PageData['profile'];
	type InfoItem = { label: string; value: string };
	type LinkItem = { label: string; href: string; isExternal: boolean };
	type Coordinates = PageData['coordinates'];
	type PlanePoint = {
		x: number;
		y: number;
		label?: string;
		slug?: string;
		id?: string;
		color?: string;
		isUser?: boolean;
	};
	type QuadrantNarrative = {
		heading: string;
		title: string;
		description: string;
	};

	export let data: PageData;

	const profile = data.profile;
	const coordinates: Coordinates = data.coordinates;

	const maybeText = (value: string | undefined | null) => {
		if (typeof value !== 'string') return null;
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : null;
	};

	const highlightedPoint: PlanePoint | null = coordinates
		? {
				x: coordinates.x,
				y: coordinates.y,
				label: profile.nombre,
				slug: encodeURIComponent(profile.partido),
				color: 'var(--color-primary)',
				isUser: true
			}
		: null;

	const planePoints = highlightedPoint ? [highlightedPoint] : [];

	const formattedCoordinates = coordinates
		? `(${coordinates.x.toFixed(2)}, ${coordinates.y.toFixed(2)})`
		: null;

	let planeNarrative: QuadrantNarrative | null = null;

	const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);

	const infoFields = [
		{ key: 'fundacion', label: 'Año de fundación' },
		{ key: 'fundador', label: 'Fundador/a' },
		{ key: 'presidente', label: 'Presidente/a' },
		{ key: 'secretario', label: 'Secretario/a general' },
		{ key: 'ambitos', label: 'Ámbitos de acción' },
		{ key: 'ideologia', label: 'Ideología' },
		{ key: 'organizaciones', label: 'Organizaciones aliadas' },
		{ key: 'representacion', label: 'Representación actual' },
		{ key: 'historial', label: 'Historial' },
		{ key: 'alianzas', label: 'Alianzas' },
		{ key: 'elecciones', label: 'Participación electoral' },
		{ key: 'multas', label: 'Multas' },
		{ key: 'sanciones', label: 'Sanciones' },
		{ key: 'procesos_legales', label: 'Procesos legales' },
		{ key: 'corrupcion', label: 'Casos de corrupción' },
		{ key: 'denuncias', label: 'Denuncias' }
	] as const satisfies readonly { key: keyof Profile; label: string }[];

	const infoItems = infoFields.reduce<InfoItem[]>((acc, { key, label }) => {
		const raw = profile[key] as string | undefined;
		const value = maybeText(raw);
		if (value) {
			acc.push({ label, value });
		}
		return acc;
	}, []);

	const contactFields = [
		{ key: 'correo', label: 'Correo', type: 'mailto' as const },
		{ key: 'web', label: 'Sitio web', type: 'link' as const },
		{ key: 'facebook', label: 'Facebook', type: 'link' as const },
		{ key: 'twitter', label: 'Twitter', type: 'link' as const }
	] as const satisfies readonly { key: keyof Profile; label: string; type: 'link' | 'mailto' }[];

	const contactItems = contactFields.reduce<LinkItem[]>((acc, { key, label, type }) => {
		const raw = profile[key] as string | undefined;
		const value = maybeText(raw);
		if (!value) return acc;

		if (type === 'mailto') {
			if (value.includes('@')) {
				acc.push({ label, href: `mailto:${value}`, isExternal: false });
			}
			return acc;
		}

		if (!isHttpUrl(value)) return acc;
		acc.push({ label, href: value, isExternal: true });
		return acc;
	}, []);
</script>

<svelte:head>
	<title>{profile.nombre} | Perfiles de partidos</title>
</svelte:head>

<main
	id="main-content"
	class="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16 sm:px-10"
>
	<Button
		variant="ghost"
		href="/perfiles"
		class="w-fit px-0 text-sm text-muted-foreground hover:text-foreground"
	>
		<span aria-hidden="true">←</span>
		<span>Volver a los perfiles</span>
	</Button>

	<Card class="overflow-hidden border border-border/70 bg-background/95">
		<CardHeader class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
			<div class="space-y-2">
				<p class="text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase">
					{profile.partido}
				</p>
				<CardTitle class="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
					{profile.nombre}
				</CardTitle>
			</div>

			{#if profile.logoUrl}
				<div
					class="flex h-28 w-40 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border/60 bg-muted/40 p-3"
				>
					<img
						src={profile.logoUrl}
						alt={`Logo de ${profile.nombre}`}
						class="max-h-full max-w-full object-contain"
					/>
				</div>
			{/if}
		</CardHeader>
	</Card>

	{#if coordinates}
		<section class="space-y-3">
			<h2 class="text-xl font-semibold text-foreground">Ubicación en el plano</h2>
			<CartesianPlane
				x={coordinates.x}
				y={coordinates.y}
				label={`Plano de ${profile.nombre}`}
				points={planePoints}
				singlePointMode
				bind:narrative={planeNarrative}
			/>
			<div
				class="rounded-2xl border border-border/70 bg-background/95 p-4 text-sm text-muted-foreground"
			>
				<p class="text-foreground">
					<span class="font-semibold">Coordenadas:</span>
					{formattedCoordinates}
				</p>
				{#if planeNarrative}
					<div class="mt-3 space-y-1">
						<p class="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
							{planeNarrative.heading}
						</p>
						<p class="font-semibold text-foreground">{planeNarrative.title}</p>
						<p>{planeNarrative.description}</p>
					</div>
				{/if}
			</div>
		</section>
	{:else}
		<section
			class="rounded-2xl border border-dashed border-border/60 bg-background/60 p-4 text-sm text-muted-foreground"
		>
			No hay coordenadas disponibles para este partido.
		</section>
	{/if}

	{#if infoItems.length > 0}
		<section class="space-y-4">
			<h2 class="text-xl font-semibold text-foreground">Ficha del partido</h2>
			<div class="grid gap-4 sm:grid-cols-2">
				{#each infoItems as item}
					<Card class="h-full border border-border/70 bg-background/95">
						<CardHeader class="space-y-1">
							<p class="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
								{item.label}
							</p>
						</CardHeader>
						<CardContent>
							<p class="text-base break-words whitespace-pre-wrap text-foreground">{item.value}</p>
						</CardContent>
					</Card>
				{/each}
			</div>
		</section>
	{/if}

	{#if contactItems.length > 0}
		<section class="space-y-3">
			<h2 class="text-xl font-semibold text-foreground">Contacto y enlaces</h2>
			<ul class="grid gap-3 sm:grid-cols-2">
				{#each contactItems as item}
					<li>
						<Card class="border border-border/70 bg-background/95">
							<CardContent class="p-4">
								<a
									href={item.href}
									class="inline-flex w-full items-center justify-between gap-3 text-sm font-medium text-primary transition hover:text-primary/80"
									target={item.isExternal ? '_blank' : undefined}
									rel={item.isExternal ? 'noreferrer' : undefined}
								>
									<span class="truncate">{item.label}</span>
									<span class="text-xs text-muted-foreground">{item.isExternal ? '↗' : '→'}</span>
								</a>
							</CardContent>
						</Card>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</main>
