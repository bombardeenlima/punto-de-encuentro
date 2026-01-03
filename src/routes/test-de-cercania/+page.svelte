<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, CartesianPlane } from '$lib';
	import type { PageData } from './$types';

	const { data } = $props<{ data: PageData }>();
	const questions = $derived(data.questions);
	const parties = $derived(data.parties ?? []);
	const partyProfiles = $derived(data.partyProfiles ?? []);

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
			link: point.slug ? `/perfiles/${point.slug}` : null,
			x: point.x,
			y: point.y
		}))
	);

	const nearestParties = $derived.by(() => {
		if (!coordinates) return [];

		return partyDescriptions
			.map(
				(party: {
					id: string;
					label: string;
					description: string;
					link: string | null;
					x: number;
					y: number;
				}) => ({
					...party,
					distance: Math.sqrt(
						Math.pow(party.x - coordinates.x, 2) + Math.pow(party.y - coordinates.y, 2)
					)
				})
			)
			.sort((a: { distance: number }, b: { distance: number }) => a.distance - b.distance);
	});

	let questionContainerRef = $state<HTMLDivElement | null>(null);

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

		// Focus on the question container when it changes for better keyboard navigation
		if (hasStarted && !showResults && questionContainerRef) {
			queueMicrotask(() => {
				questionContainerRef?.focus();
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

	function handleKeyboardNavigation(event: KeyboardEvent) {
		if (!hasStarted || showResults) return;

		// Arrow keys for navigation
		if (event.key === 'ArrowLeft' && currentIndex > 0) {
			event.preventDefault();
			goBack();
		} else if (event.key === 'ArrowRight' && currentAnswer != null) {
			event.preventDefault();
			goNext();
		}

		// Number keys 1-5 for answer selection
		if (currentQuestion && event.key >= '1' && event.key <= '5') {
			event.preventDefault();
			const answerIndex = parseInt(event.key) - 1;
			if (answerIndex < answerChoices.length) {
				recordAnswer(currentQuestion._id, answerChoices[answerIndex].value);
			}
		}

		// Enter to submit
		if (event.key === 'Enter' && currentAnswer != null) {
			event.preventDefault();
			goNext();
		}
	}
</script>

<svelte:head>
	<title>Test de cercanía</title>
</svelte:head>

<svelte:window onkeydown={handleKeyboardNavigation} />

<div class="mx-auto max-w-5xl px-6 py-16">
	<div class="mb-12">
		<Button
			variant="ghost"
			href="/"
			class="mb-6 flex w-fit items-center gap-2 px-0 text-sm text-muted-foreground hover:text-foreground"
		>
			<span aria-hidden="true">←</span>
			<span>Volver a Inicio</span>
		</Button>
		<h1
			id="page-title"
			class="mb-4 text-5xl leading-tight font-bold tracking-tight text-foreground"
		>
			{#if hasStarted}
				Test de cercanía política
			{:else}
				Descubre tus coordenadas políticas
			{/if}
		</h1>
		{#if !hasStarted}
			<p class="max-w-3xl text-lg text-muted-foreground">
				Responde y obtene un punto en el plano según tu acuerdo o desacuerdo con cada afirmación.
			</p>
		{/if}
	</div>

	{#if hasStarted}
		<div class="mb-8 space-y-3">
			<p class="text-center text-sm text-muted-foreground" aria-live="polite">
				Pregunta {currentIndex + 1} de {totalQuestions}
			</p>
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
		</div>
	{/if}

	{#if showResults && coordinates && selectedTest}
		<div class="space-y-6" aria-live="polite">
			<!-- Results Header -->
			<div class="grid gap-4 lg:grid-cols-2">
				<div class="rounded-md border border-border bg-card p-6 text-center lg:p-8 lg:text-left">
					<p class="mb-2 text-sm font-semibold text-muted-foreground">Resultado</p>
					<h2 class="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
						({planeX.toFixed(2)}, {planeY.toFixed(2)})
					</h2>
				</div>
				{#if planeNarrative}
					<div class="rounded-md border border-border bg-card p-6 lg:p-8">
						<p class="text-base font-semibold text-foreground sm:text-lg">{planeNarrative.title}</p>
						<p class="mt-2 text-sm text-muted-foreground sm:text-base">
							{planeNarrative.description}
						</p>
					</div>
				{/if}
			</div>

			<!-- Plane Visualization with Nearest Parties -->
			<div class="grid gap-4 lg:grid-cols-[1fr_280px] lg:gap-6">
				<div
					class="min-w-0 overflow-hidden rounded-md border border-border bg-card"
					role="status"
					aria-live="polite"
					tabindex="-1"
					bind:this={resultsSection}
					aria-describedby={planeDescription ? 'plane-description' : undefined}
				>
					<CartesianPlane
						bind:x={planeX}
						bind:y={planeY}
						label="Resultado del test"
						interactive={false}
						singlePointMode={true}
						points={displayedPoints}
						bind:narrative={planeNarrative}
						describedBy={planeDescription ? 'plane-description' : undefined}
						on:pointActivate={handlePointActivate}
					/>
				</div>

				<!-- Nearest Parties Sidebar -->
				<div class="min-w-0 rounded-md border border-border bg-card p-4 lg:p-5">
					<h3 class="mb-3 text-base font-semibold text-foreground lg:text-lg">
						Partidos más cercanos
					</h3>
					{#if nearestParties.length > 0}
						<ul class="space-y-2.5">
							{#each nearestParties.slice(0, 5) as party, index (party.id)}
								<li class="text-sm">
									{#if party.link}
										<a
											href={party.link}
											class="block font-medium text-foreground transition hover:text-primary"
										>
											<div class="flex items-baseline justify-between gap-2">
												<span class="min-w-0 truncate">{index + 1}. {party.label}</span>
												<span class="shrink-0 text-xs text-muted-foreground"
													>{party.distance.toFixed(1)}u</span
												>
											</div>
										</a>
									{:else}
										<div class="flex items-baseline justify-between gap-2">
											<span class="min-w-0 truncate font-medium text-foreground">
												{index + 1}. {party.label}
											</span>
											<span class="shrink-0 text-xs text-muted-foreground"
												>{party.distance.toFixed(1)}u</span
											>
										</div>
									{/if}
								</li>
							{/each}
						</ul>
					{:else}
						<p class="text-sm text-muted-foreground">No hay partidos para mostrar.</p>
					{/if}
				</div>

				{#if planeDescription}
					<p id="plane-description" class="sr-only">
						{planeDescription}
					</p>
				{/if}
			</div>

			<!-- All Party References -->
			{#if nearestParties.length > 0}
				<div>
					<h3 class="mb-4 text-2xl font-semibold text-foreground">
						Todos los partidos en el plano
					</h3>
					<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{#each nearestParties as party (party.id)}
							<div
								class="rounded-md border border-border bg-card p-4 transition-all hover:bg-accent/50"
							>
								<div class="mb-1 flex items-baseline justify-between gap-2">
									<span class="font-semibold text-foreground">{party.label}</span>
									<span class="text-xs text-muted-foreground">{party.distance.toFixed(1)}u</span>
								</div>
								<span class="block text-sm text-muted-foreground">{party.description}</span>
								{#if party.link}
									<a
										href={party.link}
										class="mt-2 inline-flex items-center text-sm font-medium text-primary hover:underline"
									>
										Ver perfil →
									</a>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="flex flex-wrap items-center justify-center gap-3">
				<Button variant="default" size="lg" onclick={restartTest}>Repetir test</Button>
				<Button variant="outline" size="lg" onclick={goHome}>Elegir otro test</Button>
			</div>
		</div>
	{:else if !selectedTestType}
		<div class="grid gap-3 md:grid-cols-2">
			{#each testCatalog as test}
				<button
					onclick={() => startTest(test.type)}
					class="flex min-h-[200px] flex-col justify-between rounded-md border border-border bg-card p-8 text-left transition-all hover:bg-accent/50"
				>
					<div>
						<p class="mb-1 text-xs font-semibold text-muted-foreground">
							{test.label}
						</p>
						<h2 class="mb-3 text-2xl font-semibold text-foreground">{test.count} preguntas</h2>
						<p class="text-sm leading-relaxed text-muted-foreground">
							Calcula tus coordenadas con las afirmaciones guardadas para este formato.
						</p>
					</div>
					<div class="mt-4 text-sm font-medium text-foreground/60">Comenzar →</div>
				</button>
			{/each}
			{#if testCatalog.length === 0}
				<div
					class="col-span-full rounded-md border border-dashed border-border bg-card/30 p-12 text-center"
				>
					<p class="text-sm text-muted-foreground">Todavía no hay preguntas cargadas.</p>
				</div>
			{/if}
		</div>
	{:else if currentQuestion}
		<div
			class="rounded-md border border-border bg-card p-8 focus:ring-2 focus:ring-primary/20 focus:outline-none"
			bind:this={questionContainerRef}
			tabindex="-1"
		>
			<div class="mb-6">
				<h2
					id="question-{currentQuestion._id}"
					class="text-2xl leading-tight font-semibold text-foreground"
				>
					{currentQuestion.pregunta}
				</h2>
				<p class="mt-3 text-sm text-muted-foreground">
					Usa las teclas <kbd
						class="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-semibold"
						>1-5</kbd
					>
					para seleccionar,
					<kbd class="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-semibold"
						>←</kbd
					>
					<kbd class="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-semibold"
						>→</kbd
					> para navegar
				</p>
			</div>

			<form class="space-y-3" onsubmit={handleSubmit} aria-describedby="question-instructions">
				<p id="question-instructions" class="sr-only">
					Seleccioná una sola opción para continuar. Usa las teclas 1-5 para seleccionar respuestas,
					flechas izquierda y derecha para navegar, Enter para continuar.
				</p>
				<fieldset class="space-y-2" aria-labelledby="question-{currentQuestion._id}">
					<legend class="sr-only">{currentQuestion.pregunta}</legend>
					{#each answerChoices as option, index}
						<label
							class={`block cursor-pointer rounded-md border px-5 py-4 transition-all ${currentAnswer === option.value ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-accent/50'}`}
						>
							<input
								type="radio"
								name={currentQuestion._id}
								class="sr-only"
								value={option.value}
								checked={currentAnswer === option.value}
								onchange={() => recordAnswer(currentQuestion._id, option.value)}
							/>
							<span class="flex items-center gap-2">
								<kbd
									class="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground"
									>{index + 1}</kbd
								>
								<span class="text-sm font-medium text-foreground">{option.label}</span>
							</span>
						</label>
					{/each}
				</fieldset>

				<div class="flex items-center justify-between gap-3 pt-4">
					<Button variant="outline" type="button" onclick={goBack} disabled={currentIndex === 0}>
						<span aria-hidden="true">←</span> Anterior
					</Button>
					<Button type="submit" disabled={currentAnswer == null}>
						{currentIndex === totalQuestions - 1 ? 'Finalizar' : 'Siguiente'}
						<span aria-hidden="true">→</span>
					</Button>
				</div>
			</form>
		</div>
	{:else}
		<div class="rounded-md border border-dashed border-border bg-card/30 p-12 text-center">
			<p class="text-sm text-muted-foreground">No encontramos preguntas para este test.</p>
		</div>
	{/if}
</div>
