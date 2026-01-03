<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, CartesianPlane } from '$lib';
	import type { PageData } from './$types';

	const { data } = $props<{ data: PageData }>();
	const questions = data.questions;
	const parties = data.parties ?? [];
	const partyProfiles = data.partyProfiles ?? [];

	type LoadedQuestion = (typeof questions)[number];
	type PlotPoint = {
		x: number;
		y: number;
		label?: string;
		isUser?: boolean;
		slug?: string;
		id?: string;
	};

	type QuadrantNarrative = {
		heading: string;
		title: string;
		description: string;
	};

	const answerChoices = [
		{ label: 'Muy en desacuerdo', value: -2 },
		{ label: 'En desacuerdo', value: -1 },
		{ label: 'Neutral / No opino', value: 0 },
		{ label: 'De acuerdo', value: 1 },
		{ label: 'Muy de acuerdo', value: 2 }
	] as const;

	const getTestLabel = (type: number) => {
		if (type === 1) return 'Test corto';
		if (type === 2) return 'Test largo';
		return `Test ${type}`;
	};

	const testCatalog = $derived.by(() => {
		const grouped = new Map<number, LoadedQuestion[]>();
		for (const question of questions) {
			const bucket = grouped.get(question.n) ?? [];
			bucket.push(question);
			grouped.set(question.n, bucket);
		}
		return Array.from(grouped.entries())
			.map(([type, items]) => {
				let count = items.length;
				let allQuestions = items;
				if (type === 2) {
					const cortoQuestions = grouped.get(1) ?? [];
					count += cortoQuestions.length;
					allQuestions = [...cortoQuestions, ...items];
				}
				return {
					type,
					label: getTestLabel(type),
					count,
					questions: allQuestions
				};
			})
			.sort((a, b) => a.type - b.type);
	});

	let selectedTestType = $state<number | null>(null);
	let currentIndex = $state(0);
	let answers = $state<Record<string, number>>({});
	let showResults = $state(false);

	const selectedTest = $derived.by(
		() => testCatalog.find((entry) => entry.type === selectedTestType) ?? null
	);
	const activeQuestions = $derived.by(() => selectedTest?.questions ?? []);
	const totalQuestions = $derived.by(() => activeQuestions.length);
	const currentQuestion = $derived.by(() => activeQuestions[currentIndex]);
	const currentAnswer = $derived.by(() =>
		currentQuestion ? answers[currentQuestion._id] : undefined
	);
	const answeredCount = $derived.by(() =>
		activeQuestions.reduce(
			(count, question) => (answers[question._id] == null ? count : count + 1),
			0
		)
	);
	const progressPercent = $derived.by(() =>
		totalQuestions === 0 ? 0 : Math.round((answeredCount / totalQuestions) * 100)
	);

	const hasStarted = $derived.by(() => selectedTestType != null && !showResults);

	const coordinates = $derived.by(() => {
		if (!showResults || !selectedTest) return null;
		let x = 0;
		let y = 0;
		for (const question of selectedTest.questions) {
			const value = answers[question._id] ?? 0;
			const eje = Number(question.eje);
			if (Number.isNaN(eje)) continue;
			if (eje === 0) x += value;
			if (eje === 1) y += value;
		}
		if (selectedTest.type === 1) {
			x *= 2;
			y *= 2;
		}
		return { x, y };
	});

	type LoadedParty = (typeof parties)[number];
	type LoadedPartyProfile = (typeof partyProfiles)[number];

	const normaliseKey = (value: string) =>
		value
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '')
			.trim()
			.toLowerCase();

	const partyProfileMap = $derived.by(() => {
		const map = new Map<string, LoadedPartyProfile>();
		for (const profile of partyProfiles) {
			const keys = new Set<string>();
			keys.add(normaliseKey(profile.partido));
			keys.add(normaliseKey(profile.nombre));
			keys.add(normaliseKey(profile.nombre.replace(/\s+/g, ' ')));
			for (const key of keys) {
				map.set(key, profile);
			}
		}
		return map;
	});

	const partyPoints = $derived.by(() =>
		parties
			.map((party: LoadedParty) => {
				const [coordX, coordY] = party.coordenadas;
				if (typeof coordX !== 'number' || typeof coordY !== 'number') return null;
				const profile = party.partido
					? partyProfileMap.get(normaliseKey(party.partido))
					: undefined;
				return {
					x: coordX,
					y: coordY,
					label: profile?.nombre ?? party.partido,
					slug: profile ? encodeURIComponent(profile.partido) : undefined,
					id: party._id
				} satisfies PlotPoint;
			})
			.filter((point: PlotPoint | null): point is PlotPoint => point != null)
	);

	const displayedPoints = $derived.by(() => {
		if (!showResults) return [] as PlotPoint[];
		const base: PlotPoint[] = [...partyPoints];
		if (coordinates) {
			base.push({
				x: planeX,
				y: planeY,
				label: 'Tu resultado',
				isUser: true
			});
		}
		return base;
	});

	let planeX = $state(0);
	let planeY = $state(0);
	let planeNarrative = $state<QuadrantNarrative | null>(null);
	let resultsSection = $state<HTMLElement | null>(null);
	let hasAnnouncedResults = $state(false);

	const describeCoordinates = (x: number, y: number) => {
		const onAxis = (value: number) => Math.abs(value) < 0.01;
		const horizontal = onAxis(x)
			? 'sobre el eje vertical'
			: x > 0
				? 'a la derecha del eje vertical'
				: 'a la izquierda del eje vertical';
		const vertical = onAxis(y)
			? 'sobre el eje horizontal'
			: y > 0
				? 'en la parte superior del plano'
				: 'en la parte inferior del plano';
		if (onAxis(x) && onAxis(y)) return 'en el centro del plano';
		if (onAxis(x)) return vertical;
		if (onAxis(y)) return horizontal;
		return `${vertical} y ${horizontal}`;
	};

	const planeDescription = $derived.by(() => {
		if (!showResults || !coordinates) return null;
		const { x, y } = coordinates;
		const position = describeCoordinates(x, y);
		return `Tu resultado se ubica ${position} con coordenadas (${x.toFixed(2)}, ${y.toFixed(2)}).`;
	});

	const partyDescriptions = $derived.by(() =>
		partyPoints.map((point: PlotPoint) => ({
			id: point.id ?? `${point.label ?? 'partido'}-${point.x}-${point.y}`,
			label: point.label ?? 'Partido sin nombre',
			description: `Ubicado ${describeCoordinates(point.x, point.y)} con coordenadas (${point.x.toFixed(2)}, ${point.y.toFixed(2)}).`,
			link: point.slug ? `/perfiles/${point.slug}` : null
		}))
	);

	$effect(() => {
		if (showResults && coordinates) {
			planeX = coordinates.x;
			planeY = coordinates.y;
		} else if (!showResults) {
			planeX = 0;
			planeY = 0;
		}
		if (!showResults) {
			hasAnnouncedResults = false;
		}
		if (showResults && resultsSection && !hasAnnouncedResults) {
			hasAnnouncedResults = true;
			queueMicrotask(() => {
				resultsSection?.focus();
			});
		}
	});

	function startTest(type: number) {
		selectedTestType = type;
		currentIndex = 0;
		answers = {};
		showResults = false;
	}

	function recordAnswer(questionId: string, value: number) {
		answers = { ...answers, [questionId]: value };
	}

	function goNext() {
		if (!currentQuestion) return;
		if (currentAnswer == null) return;
		if (currentIndex >= totalQuestions - 1) {
			showResults = true;
			return;
		}
		currentIndex += 1;
	}

	function goBack() {
		if (currentIndex === 0) return;
		currentIndex -= 1;
	}

	function handleSubmit(event: Event) {
		event.preventDefault();
		goNext();
	}

	function restartTest() {
		currentIndex = 0;
		answers = {};
		showResults = false;
	}

	function goHome() {
		selectedTestType = null;
		currentIndex = 0;
		answers = {};
		showResults = false;
	}

	function handlePointActivate(event: CustomEvent<{ point: PlotPoint }>) {
		const { point } = event.detail;
		if (!point || point.isUser) return;
		const targetSlug = point.slug ?? (point.label ? encodeURIComponent(point.label) : null);
		if (!targetSlug) return;
		goto(`/perfiles/${targetSlug}`);
	}
</script>

<svelte:head>
	<title>Test de cercanía</title>
</svelte:head>

<main id="main-content" class="min-h-screen bg-background" aria-labelledby="page-title">
	<div class="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-12 lg:py-16">
		<div class="flex justify-center sm:justify-start">
			<Button
				variant="ghost"
				href="/"
				class="w-fit px-0 text-sm text-muted-foreground hover:text-foreground"
			>
				← Volver a Inicio
			</Button>
		</div>
		<header class="space-y-3 text-center">
			<p class="text-sm font-semibold tracking-[0.3em] text-muted-foreground uppercase">
				Test de cercanía
			</p>
			<h1
				id="page-title"
				class="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl"
			>
				Descubre tus coordenadas políticas
			</h1>
			<p class="mx-auto max-w-2xl text-base text-balance text-muted-foreground sm:text-lg">
				Responde y obtene un punto en el plano (x, y) según tu acuerdo o desacuerdo con cada
				afirmación.
			</p>
		</header>

		{#if hasStarted}
			<div class="space-y-4">
				<div
					class="h-2 w-full rounded-full bg-muted"
					role="progressbar"
					aria-valuenow={progressPercent}
					aria-valuemin="0"
					aria-valuemax="100"
					aria-label="Progreso del test"
					aria-valuetext={`${answeredCount} de ${totalQuestions} respondidas`}
				>
					<div
						class="h-full rounded-full bg-primary transition-all duration-300"
						style={`width: ${progressPercent}%`}
					></div>
				</div>
				<p class="text-sm text-muted-foreground" aria-live="polite">
					Pregunta {currentIndex + 1} de {totalQuestions}
				</p>
			</div>
		{/if}

		{#if showResults && coordinates && selectedTest}
			<div class="space-y-6" aria-live="polite">
				<div class="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
					<div
						class="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm shadow-black/5 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
						role="status"
						aria-live="polite"
						tabindex="-1"
						bind:this={resultsSection}
						aria-describedby={planeDescription ? 'plane-description' : undefined}
					>
						<p class="text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase">
							Resultado
						</p>
						<h2 class="mt-2 text-2xl font-semibold text-foreground">Coordenadas finales</h2>
						<p class="mt-4 text-lg font-semibold text-foreground">
							({planeX.toFixed(2)}, {planeY.toFixed(2)})
						</p>
						{#if planeNarrative}
							<div
								class="mt-6 rounded-2xl border border-border/60 bg-background/80 p-4 text-sm text-muted-foreground"
							>
								<span class="mb-2 block font-semibold tracking-[0.25em] text-foreground uppercase"
									>{planeNarrative.heading}</span
								>
								<p class="text-foreground">
									<span class="font-semibold">{planeNarrative.title}:</span>
									{planeNarrative.description}
								</p>
							</div>
						{/if}
						{#if planeDescription}
							<p id="plane-description" class="mt-4 text-sm text-muted-foreground">
								{planeDescription}
							</p>
						{/if}
					</div>
					<CartesianPlane
						bind:x={planeX}
						bind:y={planeY}
						label="Resultado del test"
						interactive={false}
						points={displayedPoints}
						bind:narrative={planeNarrative}
						describedBy={planeDescription ? 'plane-description' : undefined}
						on:pointActivate={handlePointActivate}
					/>
				</div>

				{#if partyDescriptions.length > 0}
					<section
						class="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm shadow-black/5"
						aria-labelledby="plane-reference-heading"
					>
						<h3 id="plane-reference-heading" class="text-lg font-semibold text-foreground">
							Referencias en el plano
						</h3>
						<p class="mt-2 text-sm text-muted-foreground">
							Este resumen textual complementa la visualización para quienes no pueden interpretar
							el gráfico.
						</p>
						<ul class="mt-4 space-y-3">
							{#each partyDescriptions as party (party.id)}
								<li class="text-sm text-muted-foreground">
									<span class="block font-semibold text-foreground">{party.label}</span>
									<span>{party.description}</span>
									{#if party.link}
										<Button variant="link" href={party.link} class="px-0 text-sm">Ver perfil</Button
										>
									{/if}
								</li>
							{/each}
						</ul>
					</section>
				{/if}

				<div class="flex flex-wrap items-center gap-3">
					<Button variant="default" onclick={restartTest}>Repetir test</Button>
					<Button variant="outline" onclick={goHome}>Elegir otro test</Button>
				</div>
			</div>
		{:else if !selectedTestType}
			<div class="grid gap-6 md:grid-cols-2">
				{#each testCatalog as test}
					<article
						class="flex h-full flex-col justify-between rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm shadow-black/5"
					>
						<header class="space-y-1">
							<p class="text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase">
								{test.label}
							</p>
							<h2 class="text-xl font-semibold text-foreground">{test.count} preguntas</h2>
						</header>
						<p class="mt-3 text-sm text-muted-foreground">
							Calcula tus coordenadas con las afirmaciones guardadas para este formato.
						</p>
						<div class="mt-6">
							<Button class="w-full" onclick={() => startTest(test.type)}>Comenzar</Button>
						</div>
					</article>
				{/each}
				{#if testCatalog.length === 0}
					<p
						class="col-span-full rounded-xl border border-dashed border-border/80 bg-card/70 p-6 text-center text-sm text-muted-foreground"
					>
						Todavía no hay preguntas cargadas.
					</p>
				{/if}
			</div>
		{:else if currentQuestion}
			<article class="space-y-6">
				<header class="space-y-2">
					<p class="text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase">
						{getTestLabel(selectedTestType)} • Afirmación {currentIndex + 1}
					</p>
					<h2 id="question-{currentQuestion._id}" class="text-2xl font-semibold text-foreground">
						{currentQuestion.pregunta}
					</h2>
				</header>

				<form class="space-y-4" onsubmit={handleSubmit} aria-describedby="question-instructions">
					<p id="question-instructions" class="sr-only">
						Seleccioná una sola opción para continuar.
					</p>
					<fieldset class="space-y-3" aria-labelledby="question-{currentQuestion._id}">
						<legend class="sr-only">{currentQuestion.pregunta}</legend>
						{#each answerChoices as option}
							<label
								class={`block cursor-pointer rounded-xl border border-border/60 bg-card/70 px-4 py-3 transition hover:border-primary/60 ${currentAnswer === option.value ? 'border-primary bg-primary/10' : ''}`}
							>
								<input
									type="radio"
									name={currentQuestion._id}
									class="sr-only"
									value={option.value}
									checked={currentAnswer === option.value}
									onchange={() => recordAnswer(currentQuestion._id, option.value)}
								/>
								<span class="block text-base font-medium text-foreground">{option.label}</span>
							</label>
						{/each}
					</fieldset>

					<div class="flex flex-wrap items-center gap-3 pt-2">
						<Button variant="outline" type="button" onclick={goBack} disabled={currentIndex === 0}
							>Anterior</Button
						>
						<Button type="submit" disabled={currentAnswer == null}
							>{currentIndex === totalQuestions - 1 ? 'Finalizar' : 'Siguiente'}</Button
						>
					</div>
				</form>
			</article>
		{:else}
			<p
				class="rounded-xl border border-dashed border-border/80 bg-card/70 p-6 text-center text-sm text-muted-foreground"
			>
				No encontramos preguntas para este test.
			</p>
		{/if}
	</div>
</main>
