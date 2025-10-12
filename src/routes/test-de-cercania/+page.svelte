<script lang="ts">
	import { Button } from "$lib";
	import type { PageData } from "./$types";

	const { data } = $props<{ data: PageData }>();
	const questions = data.questions;

	type LoadedQuestion = (typeof questions)[number];

	const answerChoices = [
		{ label: "Muy en desacuerdo", value: -2 },
		{ label: "En desacuerdo", value: -1 },
		{ label: "Neutral / No opino", value: 0 },
		{ label: "De acuerdo", value: 1 },
		{ label: "Muy de acuerdo", value: 2 },
	] as const;

	const getTestLabel = (type: number) => {
		if (type === 1) return "Test corto";
		if (type === 2) return "Test largo";
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
					questions: allQuestions,
				};
			})
			.sort((a, b) => a.type - b.type);
	});

	let selectedTestType = $state<number | null>(null);
	let currentIndex = $state(0);
	let answers = $state<Record<string, number>>({});
	let showResults = $state(false);

	const selectedTest = $derived.by(() =>
		testCatalog.find((entry) => entry.type === selectedTestType) ?? null,
	);
	const activeQuestions = $derived.by(() => selectedTest?.questions ?? []);
	const totalQuestions = $derived.by(() => activeQuestions.length);
	const currentQuestion = $derived.by(() => activeQuestions[currentIndex]);
	const currentAnswer = $derived.by(() => (currentQuestion ? answers[currentQuestion._id] : undefined));
	const answeredCount = $derived.by(() =>
		activeQuestions.reduce((count, question) => (answers[question._id] == null ? count : count + 1), 0),
	);
	const progressPercent = $derived.by(() =>
		totalQuestions === 0 ? 0 : Math.round((answeredCount / totalQuestions) * 100),
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
</script>

<svelte:head>
	<title>Test de cercanía</title>
</svelte:head>

<section class="min-h-screen bg-background">
	<div class="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-12 lg:py-16">
		<div class="flex justify-center">
			<Button variant="ghost" href="/">Volver a la página principal</Button>
		</div>
		<header class="space-y-3 text-center">
			<p class="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Test de cercanía</p>
			<h1 class="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
				Descubrí tus coordenadas políticas
			</h1>
			<p class="mx-auto max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
				Respondé y obtené un punto en el plano (x, y) según tu acuerdo o desacuerdo con cada afirmación.
			</p>
		</header>

		{#if hasStarted}
			<div class="space-y-4">
				<div class="h-2 w-full rounded-full bg-muted" role="progressbar" aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100" aria-label="Progreso del test">
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
				<div class="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm shadow-black/5">
					<p class="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Resultado</p>
					<h2 class="mt-2 text-2xl font-semibold text-foreground">Coordenadas finales</h2>
					<p class="mt-4 text-lg font-semibold text-foreground">
						({coordinates.x}, {coordinates.y})
					</p>
					<p class="mt-2 text-sm text-muted-foreground">
						Cada respuesta suma al eje x cuando la afirmación pertenece al eje 0 y al eje y cuando pertenece al eje 1.
					</p>
				</div>

				<div class="flex flex-wrap items-center gap-3">
					<Button variant="default" onclick={restartTest}>Repetir test</Button>
					<Button variant="outline" onclick={goHome}>Elegir otro test</Button>
				</div>
			</div>
		{:else if !selectedTestType}
			<div class="grid gap-6 md:grid-cols-2">
				{#each testCatalog as test}
					<article class="flex h-full flex-col justify-between rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm shadow-black/5">
						<header class="space-y-1">
							<p class="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">{test.label}</p>
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
					<p class="col-span-full rounded-xl border border-dashed border-border/80 bg-card/70 p-6 text-center text-sm text-muted-foreground">
						Todavía no hay preguntas cargadas.
					</p>
				{/if}
			</div>
		{:else if currentQuestion}
			<article class="space-y-6">
				<header class="space-y-2">
					<p class="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
						{getTestLabel(selectedTestType)} • Afirmación {currentIndex + 1}
					</p>
					<h2 id="question-{currentQuestion._id}" class="text-2xl font-semibold text-foreground">{currentQuestion.pregunta}</h2>
				</header>

				<form class="space-y-4" onsubmit={handleSubmit}>
					<div role="radiogroup" aria-labelledby="question-{currentQuestion._id}">
						{#each answerChoices as option}
							<label class={`block cursor-pointer rounded-xl border border-border/60 bg-card/70 px-4 py-3 transition hover:border-primary/60 ${currentAnswer === option.value ? "border-primary bg-primary/10" : ""}`}>
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
					</div>

					<div class="flex flex-wrap items-center gap-3 pt-2">
						<Button variant="outline" type="button" onclick={goBack} disabled={currentIndex === 0}>Anterior</Button>
						<Button type="submit" disabled={currentAnswer == null}>{currentIndex === totalQuestions - 1 ? "Finalizar" : "Siguiente"}</Button>
					</div>
				</form>
			</article>
		{:else}
			<p class="rounded-xl border border-dashed border-border/80 bg-card/70 p-6 text-center text-sm text-muted-foreground">
				No encontramos preguntas para este test.
			</p>
		{/if}
	</div>
</section>
