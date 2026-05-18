<script lang="ts">
	import { Button } from '$lib';
	import questions from '$lib/data/segunda-vuelta.json';

	type Question = (typeof questions)[number];

	let currentIndex = $state(0);
	let votes = $state<Record<string, 'sanchez' | 'fujimori'>>({});
	let showResults = $state(false);

	const totalQuestions = questions.length;
	const currentQuestion = $derived(questions[currentIndex]);
	const currentVote = $derived(currentQuestion ? votes[currentQuestion.id] : undefined);
	const votedCount = $derived(Object.keys(votes).length);
	const progressPercent = $derived(
		totalQuestions === 0 ? 0 : Math.round((votedCount / totalQuestions) * 100)
	);

	const sanchezCount = $derived(Object.values(votes).filter((v) => v === 'sanchez').length);
	const fujimoriCount = $derived(Object.values(votes).filter((v) => v === 'fujimori').length);

	const winner = $derived.by(() => {
		if (sanchezCount > fujimoriCount) return 'sanchez';
		if (fujimoriCount > sanchezCount) return 'fujimori';
		return 'empate';
	});

	const winnerName = $derived.by(() => {
		if (winner === 'sanchez') return 'Roberto Sánchez';
		if (winner === 'fujimori') return 'Keiko Fujimori';
		return null;
	});

	const hasStarted = $derived(votedCount > 0);

	function optionOrder(q: Question): ['sanchez' | 'fujimori', 'sanchez' | 'fujimori'] {
		const hash = q.id.length % 2;
		return hash === 0 ? ['sanchez', 'fujimori'] : ['fujimori', 'sanchez'];
	}

	function vote(candidate: 'sanchez' | 'fujimori') {
		if (!currentQuestion) return;
		votes[currentQuestion.id] = candidate;
		setTimeout(() => {
			if (currentIndex >= totalQuestions - 1) {
				showResults = true;
			} else {
				currentIndex += 1;
			}
		}, 200);
	}

	function goBack() {
		if (currentIndex === 0) return;
		currentIndex -= 1;
	}

	function restartTest() {
		currentIndex = 0;
		votes = {};
		showResults = false;
	}

	function handleKeyboard(event: KeyboardEvent) {
		if (showResults) return;
		if (!currentQuestion) return;
		const [first, second] = optionOrder(currentQuestion);
		if (event.key === '1') {
			event.preventDefault();
			vote(first);
		} else if (event.key === '2') {
			event.preventDefault();
			vote(second);
		} else if (event.key === 'ArrowLeft' && currentIndex > 0) {
			event.preventDefault();
			goBack();
		}
	}

	let resultsSection = $state<HTMLElement | null>(null);

	$effect(() => {
		if (showResults && resultsSection) {
			queueMicrotask(() => resultsSection?.focus());
		}
	});
</script>

<svelte:head>
	<title>Test de cercanía - Segunda Vuelta 2026</title>
</svelte:head>

<svelte:window onkeydown={handleKeyboard} />

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-16">
	<div class="mb-12">
		<Button
			variant="ghost"
			href="/"
			class="mb-6 flex w-fit items-center gap-2 px-0 text-sm text-muted-foreground hover:text-foreground"
		>
			<span aria-hidden="true">←</span>
			<span>Volver a Inicio</span>
		</Button>
		<h1 class="mb-4 text-5xl leading-tight font-bold tracking-tight text-foreground">
			{#if showResults}
				Tus resultados
			{:else if hasStarted}
				¿Con qué posición estás más de acuerdo?
			{:else}
				Descubre quién está más cerca de ti
			{/if}
		</h1>
		{#if !hasStarted && !showResults}
			<p class="max-w-3xl text-lg text-muted-foreground">
				8 temas, 2 posiciones. Elegí con cuál coincidís más. Al final revelamos quién las defiende.
			</p>
		{/if}
	</div>

	{#if hasStarted && !showResults}
		<div class="mb-8 space-y-3">
			<p class="text-center text-sm text-muted-foreground" aria-live="polite">
				Tema {currentIndex + 1} de {totalQuestions}
			</p>
			<div
				class="h-2 w-full rounded-full bg-muted"
				role="progressbar"
				aria-valuenow={progressPercent}
				aria-valuemin="0"
				aria-valuemax="100"
				aria-label="Progreso del test"
			>
				<div
					class="h-full rounded-full bg-primary transition-all duration-300"
					style="width: {progressPercent}%"
				></div>
			</div>
		</div>
	{/if}

	{#if showResults}
		<div class="space-y-8" aria-live="polite" bind:this={resultsSection} tabindex="-1">
			<div class="rounded-2xl border border-border bg-card p-6 sm:p-8">
				<h2 class="mb-6 text-center text-2xl font-bold">Coincidiste así:</h2>
				<div class="flex items-center justify-center gap-4 sm:gap-8">
					<div class="flex-1 text-center">
						<img
							src="https://upload.wikimedia.org/wikipedia/commons/f/f1/Roberto_Sanchez_Palomino_%28cropped%29.jpg"
							alt="Roberto Sánchez"
							class="mx-auto mb-3 h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
							loading="lazy"
						/>
						<div class="text-4xl font-black text-primary sm:text-5xl">{sanchezCount}</div>
						<div class="mt-1 text-sm font-semibold text-muted-foreground">de {totalQuestions}</div>
						<div class="mt-2 text-base font-bold">Roberto Sánchez</div>
					</div>
					<div class="text-2xl font-bold text-muted-foreground">vs</div>
					<div class="flex-1 text-center">
						<img
							src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Keiko_Fujimori_2.jpg/960px-Keiko_Fujimori_2.jpg"
							alt="Keiko Fujimori"
							class="mx-auto mb-3 h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
							loading="lazy"
						/>
						<div class="text-4xl font-black text-primary sm:text-5xl">{fujimoriCount}</div>
						<div class="mt-1 text-sm font-semibold text-muted-foreground">de {totalQuestions}</div>
						<div class="mt-2 text-base font-bold">Keiko Fujimori</div>
					</div>
				</div>

				<div class="mt-8">
					<div class="flex h-4 overflow-hidden rounded-full bg-muted">
						<div
							class="bg-primary transition-all duration-700"
							style="width: {(sanchezCount / totalQuestions) * 100}%"
						></div>
						<div
							class="bg-foreground/30 transition-all duration-700"
							style="width: {(fujimoriCount / totalQuestions) * 100}%"
						></div>
					</div>
				</div>
			</div>

			<div class="rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
				{#if winnerName}
					<p class="text-lg text-muted-foreground">
						{#if winner === 'sanchez'}
							<span class="text-2xl font-bold text-foreground">Roberto Sánchez</span> está más cerca
							de ti.
						{:else}
							<span class="text-2xl font-bold text-foreground">Keiko Fujimori</span> está más cerca de
							ti.
						{/if}
					</p>
				{:else}
					<p class="text-lg text-muted-foreground">
						Estás exactamente en el medio. Ambos candidatos te representan por igual.
					</p>
				{/if}
			</div>

			<div class="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 sm:p-8">
				<h3 class="mb-3 text-xl font-bold text-foreground">¿Y el voto nulo?</h3>
				<p class="leading-relaxed text-muted-foreground">
					Votar nulo no es votar por nadie. Es votar por ambos. Si uno de los dos candidatos te
					representa más que el otro, es mejor votar por él. Tu voto cuenta.
				</p>
			</div>

			<div class="rounded-2xl border border-border bg-card p-6 sm:p-8">
				<h3 class="mb-4 text-xl font-bold">Tus respuestas</h3>
				<ul class="space-y-3">
					{#each questions as q, i}
						{@const v = votes[q.id]}
						<li class="flex items-center justify-between rounded-lg border border-border p-3">
							<span class="text-sm font-medium">{i + 1}. {q.tema}</span>
							<span
								class="rounded-full px-3 py-1 text-xs font-bold
									{v === 'sanchez' ? 'bg-primary/10 text-primary' : 'bg-foreground/10 text-foreground'}"
							>
								{v === 'sanchez' ? 'Sánchez' : 'Fujimori'}
							</span>
						</li>
					{/each}
				</ul>
			</div>

			<div class="flex justify-center">
				<Button variant="default" size="lg" onclick={restartTest}>Repetir test</Button>
			</div>
		</div>
	{:else if currentQuestion}
		{@const [first, second] = optionOrder(currentQuestion)}
		<div class="space-y-6">
			<h2 class="text-2xl font-semibold text-foreground">
				{currentQuestion.pregunta}
			</h2>
			<p class="hidden text-sm text-muted-foreground sm:block">
				Usá las teclas
				<kbd class="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-semibold"
					>1</kbd
				>
				<kbd class="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-semibold"
					>2</kbd
				>
				para seleccionar,
				<kbd class="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-semibold"
					>←</kbd
				>
				para volver
			</p>

			<div class="grid gap-4 sm:grid-cols-2">
				<button
					onclick={() => vote(first)}
					class="cursor-pointer rounded-2xl border-2 p-6 text-left transition-all
						{currentVote === first
						? 'border-primary bg-primary/5'
						: 'border-border bg-card hover:border-primary/50 hover:bg-accent/50'}"
				>
					<span class="mb-2 block text-xs font-bold tracking-widest text-muted-foreground uppercase"
						>Opción A</span
					>
					<p class="text-sm leading-relaxed text-foreground">
						{first === 'sanchez' ? currentQuestion.sanchez : currentQuestion.fujimori}
					</p>
				</button>

				<button
					onclick={() => vote(second)}
					class="cursor-pointer rounded-2xl border-2 p-6 text-left transition-all
						{currentVote === second
						? 'border-primary bg-primary/5'
						: 'border-border bg-card hover:border-primary/50 hover:bg-accent/50'}"
				>
					<span class="mb-2 block text-xs font-bold tracking-widest text-muted-foreground uppercase"
						>Opción B</span
					>
					<p class="text-sm leading-relaxed text-foreground">
						{second === 'sanchez' ? currentQuestion.sanchez : currentQuestion.fujimori}
					</p>
				</button>
			</div>

			<div class="flex items-center justify-between pt-4">
				<Button variant="outline" type="button" onclick={goBack} disabled={currentIndex === 0}>
					<span aria-hidden="true">←</span> Anterior
				</Button>
				<span class="text-sm text-muted-foreground">
					{currentIndex + 1} / {totalQuestions}
				</span>
			</div>
		</div>
	{:else}
		<div class="rounded-md border border-dashed border-border bg-card/30 p-12 text-center">
			<p class="text-sm text-muted-foreground">No encontramos preguntas para este test.</p>
		</div>
	{/if}
</div>
