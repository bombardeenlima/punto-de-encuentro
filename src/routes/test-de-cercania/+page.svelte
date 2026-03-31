<script lang="ts">
	import RadarChart from '$lib/components/RadarChart.svelte';
	import { Button } from '$lib';
	import type { PageData } from './$types';
	import {
		calculateUserProfile,
		calculateEuclideanDistance,
		calculateAffinityPercentage
	} from '$lib/calculo';

	const { data } = $props<{ data: PageData }>();
	const questions = $derived(data.questions);
	const rawQuestions = $derived(data.rawQuestions);
	const candidates = $derived(data.candidates ?? []);

	type LoadedQuestion = (typeof questions)[number];
	type Candidate = (typeof candidates)[number];

	type PlotPoint = {
		x: number;
		y: number;
		label?: string;
		isUser?: boolean;
		id?: string;
	};

	type QuadrantNarrative = {
		heading: string;
		title: string;
		description: string;
	};

	const answerChoices = [
		{ label: 'Muy de acuerdo', value: 2 },
		{ label: 'De acuerdo', value: 1 },
		{ label: 'Neutral', value: 0 },
		{ label: 'En desacuerdo', value: -1 },
		{ label: 'Muy en desacuerdo', value: -2 },
		{ label: 'No opino', value: null }
	] as const;

	const activeQuestions = $derived(questions);

	let currentIndex = $state(0);
	let answers = $state<Record<string, number | null>>({});
	let showResults = $state(false);

	const totalQuestions = $derived(activeQuestions.length);
	const currentQuestion = $derived(activeQuestions[currentIndex]);
	const currentAnswer = $derived(currentQuestion ? answers[currentQuestion.id] : undefined);
	const answeredCount = $derived(
		activeQuestions.reduce(
			(count: number, q: LoadedQuestion) => (answers[q.id] === undefined ? count : count + 1),
			0
		)
	);
	const progressPercent = $derived(
		totalQuestions === 0 ? 0 : Math.round((answeredCount / totalQuestions) * 100)
	);

	const hasStarted = $derived(!showResults);

	const userProfile = $derived.by(() => {
		if (!showResults) return null;
		const profile = calculateUserProfile(answers, rawQuestions);
		console.log(
			`Your coordinates are: (${profile.izquierda_derecha}, ${profile.liberal_conservador}, ${profile.sistema_antisistema}, ${profile.nacionalista_globalista})`
		);
		return profile;
	});

	const coordinates = $derived.by(() => {
		if (!userProfile) return null;
		return {
			x: userProfile.izquierda_derecha * 32,
			y: userProfile.liberal_conservador * 32
		};
	});

	const partyPoints = $derived.by(() =>
		candidates
			.map((candidate: Candidate) => {
				const pos = candidate.position;
				if (!pos) return null;
				return {
					x: (pos.izquierda_derecha ?? 0) * 32,
					y: (pos.liberal_conservador ?? 0) * 32,
					label: candidate.name,
					id: candidate.id
				} satisfies PlotPoint;
			})
			.filter((point: PlotPoint | null): point is PlotPoint => point != null)
	);

	const displayedPoints = $derived.by(() => {
		if (!showResults) return [] as PlotPoint[];
		const base: PlotPoint[] = [...partyPoints];
		if (coordinates) {
			base.push({
				x: coordinates.x,
				y: coordinates.y,
				label: 'Tu resultado',
				isUser: true
			});
		}
		return base;
	});

	let resultsSection = $state<HTMLElement | null>(null);
	let hasAnnouncedResults = $state(false);
	let showAllCandidates = $state(false);

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

	const nearestParties = $derived.by(() => {
		if (!userProfile) return [];

		return candidates
			.map((candidate: Candidate) => {
				const pos = candidate.position;
				const distance = calculateEuclideanDistance(userProfile as any, pos as any);
				const affinity = calculateAffinityPercentage(distance);
				return {
					id: candidate.id,
					label: candidate.name,
					description: `Ubicado ${describeCoordinates((pos.izquierda_derecha ?? 0) * 32, (pos.liberal_conservador ?? 0) * 32)}. Afinidad: ${affinity}%`,
					x: (pos.izquierda_derecha ?? 0) * 32,
					y: (pos.liberal_conservador ?? 0) * 32,
					distance,
					affinity,
					position: pos
				};
			})
			.sort((a: { distance: number }, b: { distance: number }) => a.distance - b.distance);
	});

	let questionContainerRef = $state<HTMLDivElement | null>(null);

	$effect(() => {
		if (!showResults) {
			hasAnnouncedResults = false;
		}
		if (showResults && resultsSection && !hasAnnouncedResults) {
			hasAnnouncedResults = true;
			queueMicrotask(() => {
				resultsSection?.focus();
			});
		}

		if (hasStarted && !showResults && questionContainerRef) {
			queueMicrotask(() => {
				questionContainerRef?.focus();
			});
		}
	});

	function recordAnswer(questionId: string, value: number | null) {
		answers[questionId] = value;
	}

	function goNext() {
		if (!currentQuestion) return;
		if (currentAnswer === undefined) return;
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

	function handleKeyboardNavigation(event: KeyboardEvent) {
		if (!hasStarted || showResults) return;

		if (event.key === 'ArrowLeft' && currentIndex > 0) {
			event.preventDefault();
			goBack();
		} else if (event.key === 'ArrowRight' && currentAnswer !== undefined) {
			event.preventDefault();
			goNext();
		}

		if (currentQuestion && event.key >= '1' && event.key <= '6') {
			event.preventDefault();
			const answerIndex = parseInt(event.key) - 1;
			if (answerIndex < answerChoices.length) {
				recordAnswer(currentQuestion.id, answerChoices[answerIndex].value);
			}
		}

		if (event.key === 'Enter' && currentAnswer !== undefined) {
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

	{#if showResults && coordinates && userProfile}
		<div class="space-y-6" aria-live="polite" bind:this={resultsSection} tabindex="-1">
			<!-- All Candidates -->
			<div class="min-w-0 rounded-md border border-border bg-card p-6 lg:p-8">
				<h3 class="mb-4 text-xl font-semibold text-foreground lg:text-2xl">
					Todos los Candidatos y su Cercanía
				</h3>
				{#if nearestParties.length > 0}
					<ul class="space-y-4">
						{#each showAllCandidates ? nearestParties : nearestParties.slice(0, 5) as party, index (party.id)}
							<li class="rounded-md border border-border p-4 transition-colors hover:bg-accent/50">
								<div class="flex items-center justify-between gap-4">
									<div>
										<span class="text-lg font-medium text-foreground">
											{index + 1}. {party.label}
										</span>
									</div>
									<div class="text-right">
										<span class="text-2xl font-bold text-primary">{party.affinity}%</span>
										<span class="block text-xs text-muted-foreground">de afinidad</span>
									</div>
								</div>
							</li>
						{/each}
					</ul>
					{#if nearestParties.length > 5}
						<div class="mt-6 flex justify-center">
							<Button variant="outline" onclick={() => (showAllCandidates = !showAllCandidates)}>
								{showAllCandidates ? 'Ver menos' : `Ver ${nearestParties.length - 5} más`}
							</Button>
						</div>
					{/if}
				{:else}
					<p class="text-sm text-muted-foreground">No hay candidatos para mostrar.</p>
				{/if}
			</div>

			<!-- Análisis de Similitud (Radar Chart) -->
			<RadarChart {userProfile} candidates={nearestParties} />

			<!-- Ejes Políticos -->
			<div class="min-w-0 rounded-md border border-border bg-card p-6 lg:p-8">
				<h3 class="mb-4 text-xl font-semibold text-foreground lg:text-2xl">Tus Ejes Políticos</h3>
				<p class="mb-6 text-sm text-muted-foreground">
					Tu posición en los 4 ejes principales que determinan tu brújula política, basada en tus
					respuestas.
				</p>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each [{ key: 'izquierda_derecha', leftLabel: 'Derecha', rightLabel: 'Izquierda', value: userProfile.izquierda_derecha }, { key: 'liberal_conservador', leftLabel: 'Conservador', rightLabel: 'Liberal', value: userProfile.liberal_conservador }, { key: 'sistema_antisistema', leftLabel: 'Sistema', rightLabel: 'Antisistema', value: userProfile.sistema_antisistema }, { key: 'nacionalista_globalista', leftLabel: 'Nacionalista', rightLabel: 'Globalista', value: userProfile.nacionalista_globalista }] as axis}
						<div
							class="flex flex-col gap-4 rounded-xl border border-border bg-background/50 p-5 shadow-sm"
						>
							<div
								class="flex items-center justify-between text-xs font-bold tracking-widest text-muted-foreground uppercase"
							>
								<span class={axis.value < -0.1 ? 'text-primary' : ''}>{axis.leftLabel}</span>
								<span class={axis.value > 0.1 ? 'text-primary' : ''}>{axis.rightLabel}</span>
							</div>

							<div class="relative flex w-full items-center py-2">
								<!-- Track -->
								<div class="absolute inset-x-0 h-2.5 overflow-hidden rounded-full bg-muted">
									<!-- Center line -->
									<div
										class="absolute top-0 left-1/2 z-10 h-full w-[2px] -translate-x-1/2 bg-background"
									></div>

									<!-- Fill Bar -->
									<div
										class="absolute top-0 bottom-0 bg-primary/40 transition-all duration-700 ease-out"
										style="left: {axis.value < 0 ? 50 + axis.value * 50 : 50}%; right: {axis.value >
										0
											? 50 - axis.value * 50
											: 50}%;"
									></div>
								</div>

								<!-- Candidate dots (Top 3) -->
								{#each nearestParties.slice(0, 3) as candidate, i}
									{@const candidateVal = (axis.key === 'izquierda_derecha' ? candidate.position.izquierda_derecha : axis.key === 'liberal_conservador' ? candidate.position.liberal_conservador : axis.key === 'sistema_antisistema' ? candidate.position.sistema_antisistema : candidate.position.nacionalista_globalista) ?? 0}
									<div
										class="group absolute z-10 h-3.5 w-3.5 -translate-x-1/2 cursor-pointer rounded-full border-2 border-background shadow-sm transition-all duration-700 ease-out hover:z-30"
										style="left: {((candidateVal + 1) / 2) * 100}%; background-color: hsl({(i * 360) / nearestParties.length}, 80%, 55%);"
									>
										<span class="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-foreground/90 px-1.5 py-0.5 text-[10px] font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
											{candidate.label}
										</span>
									</div>
								{/each}

								<!-- Thumb / Dot (User) -->
								<div
									class="group absolute z-20 h-5 w-5 -translate-x-1/2 cursor-pointer rounded-full border-[3px] border-background bg-primary shadow-md transition-all duration-700 ease-out hover:z-30"
									style="left: {((axis.value + 1) / 2) * 100}%"
								>
									<span class="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-foreground/90 px-1.5 py-0.5 text-[10px] font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
										Tú
									</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="flex flex-wrap items-center justify-center gap-3">
				<Button variant="default" size="lg" onclick={restartTest}>Repetir test</Button>
			</div>
		</div>
	{:else if currentQuestion}
		<div
			class="rounded-md border border-border bg-card p-8 focus:ring-2 focus:ring-primary/20 focus:outline-none"
			bind:this={questionContainerRef}
			tabindex="-1"
		>
			<div class="mb-6">
				<h2
					id="question-{currentQuestion.id}"
					class="text-2xl leading-tight font-semibold text-foreground"
				>
					{currentQuestion.pregunta}
				</h2>
				<p class="mt-3 hidden text-sm text-muted-foreground sm:block">
					Usa las teclas <kbd
						class="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-semibold"
						>1-6</kbd
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
					Seleccioná una sola opción para continuar. Usa las teclas 1-6 para seleccionar respuestas,
					flechas izquierda y derecha para navegar, Enter para continuar.
				</p>
				<fieldset class="space-y-2" aria-labelledby="question-{currentQuestion.id}">
					<legend class="sr-only">{currentQuestion.pregunta}</legend>
					{#each answerChoices as option, index}
						<label
							class={`block cursor-pointer rounded-md border px-5 py-4 transition-all ${currentAnswer === option.value ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-accent/50'}`}
						>
							<input
								type="radio"
								name={currentQuestion.id}
								class="sr-only"
								value={option.value}
								checked={currentAnswer === option.value}
								onchange={() => recordAnswer(currentQuestion.id, option.value)}
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
					<Button type="submit" disabled={currentAnswer === undefined}>
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
