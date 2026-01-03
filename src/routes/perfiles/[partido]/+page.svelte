<script lang="ts">
	import { Button, CartesianPlane } from '$lib';
	import { Mail, Globe, Facebook, Twitter } from '@lucide/svelte';
	import type { PageData } from './$types';

	type Profile = PageData['profile'];
	type InfoItem = { label: string; value: string };
	type LinkItem = { label: string; href: string; isExternal: boolean; icon?: any };
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

	const { data } = $props<{ data: PageData }>();

	const profile = $derived(data.profile);
	const coordinates = $derived<Coordinates>(data.coordinates);

	const maybeText = (value: string | undefined | null) => {
		if (typeof value !== 'string') return null;
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : null;
	};

	const highlightedPoint = $derived<PlanePoint | null>(
		coordinates
			? {
					x: coordinates.x,
					y: coordinates.y,
					label: profile.nombre,
					slug: encodeURIComponent(profile.partido),
					color: 'var(--color-primary)',
					isUser: true
				}
			: null
	);

	const planePoints = $derived(highlightedPoint ? [highlightedPoint] : []);

	const formattedCoordinates = $derived(
		coordinates ? `(${coordinates.x.toFixed(2)}, ${coordinates.y.toFixed(2)})` : null
	);

	let planeNarrative = $state<QuadrantNarrative | null>(null);

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
		{ key: 'correo', label: 'Correo', type: 'mailto' as const, icon: Mail },
		{ key: 'web', label: 'Sitio web', type: 'link' as const, icon: Globe },
		{ key: 'facebook', label: 'Facebook', type: 'link' as const, icon: Facebook },
		{ key: 'twitter', label: 'Twitter', type: 'link' as const, icon: Twitter }
	] as const satisfies readonly {
		key: keyof Profile;
		label: string;
		type: 'link' | 'mailto';
		icon: any;
	}[];

	const contactItems = contactFields.reduce<LinkItem[]>((acc, { key, label, type, icon }) => {
		const raw = profile[key] as string | undefined;
		const value = maybeText(raw);
		if (!value) return acc;

		if (type === 'mailto') {
			if (value.includes('@')) {
				acc.push({ label, href: `mailto:${value}`, isExternal: false, icon });
			}
			return acc;
		}

		if (!isHttpUrl(value)) return acc;
		acc.push({ label, href: value, isExternal: true, icon });
		return acc;
	}, []);
</script>

<svelte:head>
	<title>{profile.nombre} | Perfiles de partidos</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-6 py-16">
	<Button
		variant="ghost"
		href="/perfiles"
		class="mb-8 flex w-fit items-center gap-2 px-0 text-sm text-muted-foreground hover:text-foreground"
	>
		<span aria-hidden="true">←</span>
		<span>Volver a los perfiles</span>
	</Button>

	<!-- Hero Section -->
	<div class="mb-12 overflow-hidden rounded-md border border-border bg-card">
		<div class="flex flex-col gap-6 p-8 sm:flex-row sm:items-start sm:justify-between">
			<div class="flex-1">
				<p class="text-xs font-semibold text-muted-foreground">
					{profile.partido}
				</p>
				<h1
					class="mt-2 text-4xl leading-tight font-bold tracking-tight text-foreground sm:text-5xl"
				>
					{profile.nombre}
				</h1>
			</div>

			{#if profile.logoUrl}
				<div class="flex h-24 w-32 items-center justify-center rounded-md bg-muted/50 p-4">
					<img
						src={profile.logoUrl}
						alt={`Logo de ${profile.nombre}`}
						class="max-h-full max-w-full object-contain"
					/>
				</div>
			{/if}
		</div>

		{#if coordinates}
			<div class="border-t border-border bg-background/50 p-6">
				<div class="flex items-center gap-4">
					<div class="flex-1">
						<p class="text-sm font-semibold text-foreground">Coordenadas</p>
						<p class="text-2xl font-bold text-foreground">
							({coordinates.x.toFixed(2)}, {coordinates.y.toFixed(2)})
						</p>
					</div>
					{#if planeNarrative}
						<div class="flex-1 text-sm">
							<p class="font-semibold text-foreground">{planeNarrative.title}</p>
							<p class="text-muted-foreground">{planeNarrative.description}</p>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Main Content Grid -->
	<div class="grid gap-8 lg:grid-cols-[2fr_1fr]">
		<!-- Left Column: Plane -->
		<div>
			{#if coordinates}
				<section>
					<h2 class="mb-4 text-2xl font-semibold text-foreground">Ubicación en el plano</h2>
					<div class="overflow-hidden rounded-md border border-border bg-card">
						<CartesianPlane
							x={coordinates.x}
							y={coordinates.y}
							label={`Plano de ${profile.nombre}`}
							points={planePoints}
							singlePointMode
							bind:narrative={planeNarrative}
						/>
					</div>
				</section>
			{/if}
		</div>

		<!-- Right Column: Contact -->
		<div>
			{#if contactItems.length > 0}
				<section>
					<h2 class="mb-4 text-xl font-semibold text-foreground">Contacto</h2>
					<div class="space-y-2">
						{#each contactItems as item}
							<a
								href={item.href}
								target={item.isExternal ? '_blank' : undefined}
								rel={item.isExternal ? 'noreferrer' : undefined}
								class="flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-all hover:bg-accent/50"
							>
								{#if item.icon}
									{@const Icon = item.icon}
									<Icon class="h-5 w-5 text-muted-foreground" />
								{/if}
								<span class="flex-1 text-sm font-medium text-foreground">{item.label}</span>
								<span class="text-muted-foreground">{item.isExternal ? '↗' : '→'}</span>
							</a>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	</div>

	<!-- Full Width: Party Information -->
	{#if infoItems.length > 0}
		<section class="mt-8">
			<h2 class="mb-4 text-2xl font-semibold text-foreground">Información del partido</h2>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{#each infoItems as item}
					<div class="rounded-md border border-border bg-card p-5">
						<p class="mb-2 text-xs font-semibold text-muted-foreground">
							{item.label}
						</p>
						<p class="text-sm leading-relaxed break-words whitespace-pre-wrap text-foreground">
							{item.value}
						</p>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>
