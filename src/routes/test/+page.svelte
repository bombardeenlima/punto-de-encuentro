<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import questions from '$lib/data/segunda-vuelta.json';

	type Question = (typeof questions)[number];
	type CandidateId = 'sanchez' | 'fujimori';

	const testHeaderClass =
		'flex items-center justify-between px-5 pt-5 lg:px-10';
	const testHeaderNavClass = 'hidden items-center gap-3 text-sm font-medium sm:flex sm:text-base';
	const testHeaderLinkClass =
		'rounded-full border border-black/8 bg-black/5 px-4 py-2 text-inherit backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-black/10';

	function shuffleArray<T>(items: T[]): T[] {
		const shuffled = [...items];
		for (let index = shuffled.length - 1; index > 0; index -= 1) {
			const swapIndex = Math.floor(Math.random() * (index + 1));
			[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
		}
		return shuffled;
	}

	function buildOptionOrders(questionList: Question[]): Record<string, [CandidateId, CandidateId]> {
		return Object.fromEntries(
			questionList.map((question) => {
				const order = Math.random() < 0.5 ? (['sanchez', 'fujimori'] as const) : (['fujimori', 'sanchez'] as const);
				return [question.id, [...order]];
			})
		) as Record<string, [CandidateId, CandidateId]>;
	}

	function createShuffledTestState() {
		const shuffledQuestions = shuffleArray(questions);
		return {
			shuffledQuestions,
			optionOrders: buildOptionOrders(shuffledQuestions)
		};
	}

	const initialTestState = createShuffledTestState();
	let shuffledQuestions = $state(initialTestState.shuffledQuestions);
	let optionOrders = $state(initialTestState.optionOrders);

	let currentIndex = $state(0);
	let votes = $state<Record<string, CandidateId>>({});
	let showResults = $state(false);
	let isAdvancing = $state(false);
	let advanceTimeout: ReturnType<typeof setTimeout> | null = null;

	const totalQuestions = $derived(shuffledQuestions.length);
	const currentQuestion = $derived(shuffledQuestions[currentIndex]);
	const currentVote = $derived(currentQuestion ? votes[currentQuestion.id] : undefined);
	const votedCount = $derived(Object.keys(votes).length);
	const progressPercent = $derived(
		totalQuestions === 0 ? 0 : Math.round((votedCount / totalQuestions) * 100)
	);

	const sanchezCount = $derived(Object.values(votes).filter((v) => v === 'sanchez').length);
	const fujimoriCount = $derived(Object.values(votes).filter((v) => v === 'fujimori').length);
	const answeredCount = $derived(sanchezCount + fujimoriCount);
	const sanchezPercent = $derived(
		answeredCount === 0 ? 50 : (sanchezCount / answeredCount) * 100
	);
	const fujimoriPercent = $derived(100 - sanchezPercent);

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

	const winnerLabel = $derived.by(() => {
		if (winner === 'sanchez') return 'Roberto Sánchez';
		if (winner === 'fujimori') return 'Keiko Fujimori';
		return 'ambos por igual';
	});

	const resultCards = $derived.by(() => [
		{
			id: 'sanchez',
			name: 'Roberto Sánchez',
			shortName: 'Roberto',
			count: sanchezCount,
			percentage: sanchezPercent,
			image: '/roberto.png',
			logo: '/roberto-logo.svg',
			themeClass: 'result-candidate-sanchez'
		},
		{
			id: 'fujimori',
			name: 'Keiko Fujimori',
			shortName: 'Keiko',
			count: fujimoriCount,
			percentage: fujimoriPercent,
			image: '/keiko.png',
			logo: '/keiko-logo.svg',
			themeClass: 'result-candidate-fujimori'
		}
	]);

	const answeredResults = $derived.by(() =>
		shuffledQuestions.map((question) => ({
			...question,
			selected: votes[question.id]
		}))
	);

	const hasStarted = $derived(votedCount > 0);

	function optionOrder(q: Question): [CandidateId, CandidateId] {
		return optionOrders[q.id] ?? ['sanchez', 'fujimori'];
	}

	function vote(candidate: CandidateId) {
		if (!currentQuestion || isAdvancing) return;
		votes[currentQuestion.id] = candidate;
		isAdvancing = true;
		advanceTimeout = setTimeout(() => {
			isAdvancing = false;
			advanceTimeout = null;
			if (votedCount >= totalQuestions) {
				showResults = true;
			} else {
				currentIndex += 1;
			}
		}, 200);
	}

	function goBack() {
		if (currentIndex === 0 || isAdvancing) return;
		currentIndex -= 1;
	}

	function restartTest() {
		if (advanceTimeout) {
			clearTimeout(advanceTimeout);
			advanceTimeout = null;
		}
		const nextTestState = createShuffledTestState();
		shuffledQuestions = nextTestState.shuffledQuestions;
		optionOrders = nextTestState.optionOrders;
		currentIndex = 0;
		votes = {};
		showResults = false;
		isAdvancing = false;
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

{#if showResults}
	<section class="results-shell" aria-live="polite" bind:this={resultsSection} tabindex="-1">
		<Header
			className={testHeaderClass}
			navClass={testHeaderNavClass}
			linkClass={testHeaderLinkClass}
			menuButtonClass="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-black/5 transition-colors hover:bg-black/10"
			mobilePanelClass="absolute right-0 mt-3 flex min-w-[13rem] flex-col gap-2 rounded-3xl border border-black/10 bg-white/95 p-3 text-sm font-medium text-black shadow-[0_18px_50px_rgba(18,23,38,0.12)] backdrop-blur-xl"
			mobileLinkClass="rounded-2xl border border-black/10 bg-black/4 px-4 py-3 transition-colors hover:bg-black/7"
		/>

		<div class="results-layout">
			<div class="test-toolbar">
				<a href="/" class="test-back">
					<span aria-hidden="true">←</span>
					<span>Volver al inicio</span>
				</a>
			</div>

			<section class="results-hero">
				<h1>Resultados</h1>

				<div class="results-candidates">
					{#each resultCards as candidate}
						<article
							class={`result-candidate ${candidate.themeClass}`}
							style={`--candidate-size:${candidate.count || 1};--candidate-share:${candidate.percentage}%;`}
						>
							<div class="result-candidate-image-wrap">
								<img src={candidate.image} alt={candidate.name} class="result-candidate-image" />
							</div>
							<div class="result-candidate-overlay"></div>
							<div class="result-candidate-copy">
								<h2>{candidate.name}</h2>
								<p>{candidate.count} similitudes</p>
							</div>
							<img src={candidate.logo} alt="" class="result-candidate-logo" />
						</article>
					{/each}
				</div>

				<div class="results-bar" aria-label="Comparación de coincidencias">
					<div class="results-bar-track">
						<div
							class="results-bar-segment results-bar-segment-sanchez"
							style={`width:${sanchezPercent}%`}
						></div>
						<div
							class="results-bar-segment results-bar-segment-fujimori"
							style={`width:${fujimoriPercent}%`}
						></div>
					</div>
					<div class="results-bar-labels">
						<span>Roberto {sanchezCount}</span>
						<span>Keiko {fujimoriCount}</span>
					</div>
				</div>

				<p class="results-summary">
					{#if winnerName}
						Entre los dos candidatos, estás más cercano a <strong>{winnerName}</strong>.
					{:else}
						Entre los dos candidatos, estás exactamente al centro: <strong>{winnerLabel}</strong>.
					{/if}
				</p>
			</section>

			<section class="results-grid" aria-label="Detalle de coincidencias por tema">
				{#each answeredResults as result}
					<article
						class={`topic-card ${result.selected === 'sanchez' ? 'topic-card-sanchez' : 'topic-card-fujimori'}`}
					>
						<p class="topic-card-title">{result.tema}</p>
						<p class="topic-card-body">
							Te alineaste con
							<strong>{result.selected === 'sanchez' ? 'Roberto Sánchez' : 'Keiko Fujimori'}</strong>
						</p>
					</article>
				{/each}
			</section>

			<section class="results-note">
				<h3>¿Y el voto nulo?</h3>
				<p>
					Votar nulo no es votar por nadie. Es votar por ambos. Si uno de los dos candidatos te
					representa más que el otro, es mejor votar por él.
				</p>
			</section>

			<div class="results-actions">
				<button type="button" class="results-restart" onclick={restartTest}>Repetir test</button>
			</div>
		</div>
	</section>
{:else if currentQuestion}
	{@const [first, second] = optionOrder(currentQuestion)}
	<section class="test-shell">
		<Header
			className={testHeaderClass}
			navClass={testHeaderNavClass}
			linkClass={testHeaderLinkClass}
			menuButtonClass="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-black/5 transition-colors hover:bg-black/10"
			mobilePanelClass="absolute right-0 mt-3 flex min-w-[13rem] flex-col gap-2 rounded-3xl border border-black/10 bg-white/95 p-3 text-sm font-medium text-black shadow-[0_18px_50px_rgba(18,23,38,0.12)] backdrop-blur-xl"
			mobileLinkClass="rounded-2xl border border-black/10 bg-black/4 px-4 py-3 transition-colors hover:bg-black/7"
		/>

		<div class="test-layout">
			<div class="test-toolbar">
				<a href="/" class="test-back">
					<span aria-hidden="true">←</span>
					<span>Volver al inicio</span>
				</a>
			</div>

			<div class="test-headline">
				<h1>{currentQuestion.pregunta}</h1>
				<p aria-live="polite">Tema {currentIndex + 1} de {totalQuestions}</p>
			</div>

			<div class="test-options" role="group" aria-label="Opciones de respuesta">
				<button
					type="button"
					onclick={() => vote(first)}
					class:test-option-active={currentVote === first}
					class="test-option"
				>
					<span>{first === 'sanchez' ? currentQuestion.sanchez : currentQuestion.fujimori}</span>
				</button>

				<button
					type="button"
					onclick={() => vote(second)}
					class:test-option-active={currentVote === second}
					class="test-option"
				>
					<span>{second === 'sanchez' ? currentQuestion.sanchez : currentQuestion.fujimori}</span>
				</button>
			</div>

			<div class="test-footer">
				<div class="test-progress" aria-hidden="true">
					<div class="test-progress-bar" style="width: {progressPercent}%"></div>
				</div>

				<div class="test-footer-actions">
				<button
					type="button"
					class="test-info"
					onclick={goBack}
					disabled={currentIndex === 0}
					aria-label="Volver a la pregunta anterior"
				>
					? Más información
				</button>
				</div>
			</div>

			<p class="test-shortcuts max-sm:hidden">
				Usa <kbd>1</kbd> y <kbd>2</kbd> para responder. <kbd>←</kbd> vuelve a la pregunta anterior.
			</p>
		</div>
	</section>
{:else}
		<div class="rounded-md border border-dashed border-border bg-card/30 p-12 text-center">
			<p class="text-sm text-muted-foreground">No encontramos preguntas para este test.</p>
		</div>
{/if}

<style>
	.results-shell {
		min-height: 100dvh;
		background:
			radial-gradient(circle at top left, rgba(0, 102, 178, 0.06), transparent 18%),
			linear-gradient(180deg, #ffffff 0%, #fcfcfb 100%);
		color: #0a0a0a;
		overflow: hidden;
	}

	.test-shell {
		min-height: 100dvh;
		width: 100%;
		background:
			radial-gradient(circle at top center, rgba(0, 102, 178, 0.05), transparent 28%),
			linear-gradient(180deg, #ffffff 0%, #fbfbfb 100%);
		color: #0a0a0a;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.test-layout {
		width: 100%;
		max-width: 1680px;
		margin: 0 auto;
	}

	.test-back,
	.test-info {
		border-radius: 999px;
		background: rgba(12, 12, 12, 0.045);
		backdrop-filter: blur(8px);
		text-decoration: none;
		color: inherit;
		transition:
			transform 180ms ease,
			background-color 180ms ease;
	}

	.results-layout {
		width: min(100%, 1320px);
		margin: 0 auto;
		padding: 1.75rem 1.25rem 4rem;
	}

	.results-hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		padding: 1rem 0 0;
	}

	.results-hero h1 {
		margin: 0;
		font-size: clamp(3.3rem, 7vw, 5.8rem);
		line-height: 0.92;
		font-weight: 900;
		letter-spacing: -0.075em;
	}

	.results-candidates {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		gap: clamp(1rem, 2vw, 2.75rem);
		width: 100%;
		max-width: 760px;
	}

	.result-candidate {
		--card-height: calc(24rem + (var(--candidate-size) * 2rem));
		position: relative;
		width: min(100%, 19rem);
		height: var(--card-height);
		flex: 1 1 0;
		border-radius: 2rem;
		overflow: hidden;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding: 1.5rem;
		box-shadow: 0 24px 70px rgba(18, 23, 38, 0.1);
	}

	.result-candidate-sanchez {
		background: linear-gradient(180deg, rgba(211, 255, 184, 0.7) 0%, #71dd00 74%, #caff96 100%);
	}

	.result-candidate-fujimori {
		background: linear-gradient(180deg, rgba(255, 229, 216, 0.72) 0%, #ff5a0f 76%, #ffc487 100%);
	}

	.result-candidate-image-wrap {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: 1.6rem;
		z-index: 1;
	}

	.result-candidate-image {
		width: auto;
		height: calc(100% - 6.5rem);
		object-fit: contain;
		object-position: center top;
		filter: saturate(0.98) contrast(1.02);
	}

	.result-candidate-overlay {
		position: absolute;
		inset: auto 0 0;
		height: 55%;
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0) 0%,
			rgba(255, 255, 255, 0.18) 18%,
			rgba(255, 255, 255, 0.84) 100%
		);
		mix-blend-mode: screen;
		z-index: 2;
	}

	.result-candidate-copy,
	.result-candidate-logo {
		position: relative;
		z-index: 3;
	}

	.result-candidate-copy {
		text-align: center;
		color: white;
		text-shadow: 0 10px 25px rgba(0, 0, 0, 0.14);
		margin-bottom: 4.6rem;
	}

	.result-candidate-copy h2 {
		margin: 0;
		font-size: clamp(1.5rem, 2vw, 2.2rem);
		line-height: 1;
		font-weight: 800;
		letter-spacing: -0.05em;
	}

	.result-candidate-copy p {
		margin: 0.45rem 0 0;
		font-size: clamp(1rem, 1.4vw, 1.4rem);
		font-weight: 500;
	}

	.result-candidate-logo {
		position: absolute;
		left: 50%;
		bottom: 1rem;
		transform: translateX(-50%);
		width: 4.6rem;
		height: 4.6rem;
		object-fit: contain;
	}

	.results-bar {
		width: min(100%, 760px);
		display: grid;
		gap: 0.65rem;
	}

	.results-bar-track {
		display: flex;
		height: 1rem;
		overflow: hidden;
		border-radius: 999px;
		background: rgba(10, 10, 10, 0.08);
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
	}

	.results-bar-segment {
		height: 100%;
		transition: width 420ms ease;
	}

	.results-bar-segment-sanchez {
		background: linear-gradient(90deg, #7ce100 0%, #4ec700 100%);
	}

	.results-bar-segment-fujimori {
		background: linear-gradient(90deg, #ff8c4a 0%, #ff5a0f 100%);
	}

	.results-bar-labels {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: -0.03em;
	}

	.results-summary {
		margin: 0;
		max-width: 680px;
		text-align: center;
		font-size: clamp(1.6rem, 3vw, 2.55rem);
		line-height: 1.05;
		font-weight: 800;
		letter-spacing: -0.065em;
		text-wrap: balance;
	}

	.results-summary strong {
		font-weight: 900;
	}

	.results-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 1.2rem;
		margin-top: 4rem;
	}

	.topic-card {
		min-height: 17rem;
		border-radius: 1.6rem;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		box-shadow: 0 16px 44px rgba(18, 23, 38, 0.06);
	}

	.topic-card-sanchez {
		background: linear-gradient(180deg, #bbff7d 0%, #6adb00 100%);
	}

	.topic-card-fujimori {
		background: linear-gradient(180deg, #ffc387 0%, #ff5a0f 100%);
	}

	.topic-card-title {
		margin: 0;
		font-size: clamp(1rem, 1.3vw, 1.25rem);
		line-height: 1.12;
		font-weight: 500;
		letter-spacing: -0.04em;
	}

	.topic-card-body {
		margin: 0;
		font-size: clamp(1.7rem, 2vw, 2.2rem);
		line-height: 0.98;
		font-weight: 700;
		letter-spacing: -0.08em;
		max-width: 16rem;
	}

	.topic-card-body strong {
		display: block;
		font-weight: 900;
	}

	.results-note {
		margin: 2rem auto 0;
		width: min(100%, 760px);
		border: 1px solid rgba(10, 10, 10, 0.08);
		border-radius: 1.75rem;
		padding: 1.5rem 1.6rem;
		background: rgba(255, 255, 255, 0.76);
		backdrop-filter: blur(8px);
	}

	.results-note h3,
	.results-note p {
		margin: 0;
	}

	.results-note h3 {
		font-size: 1.15rem;
		font-weight: 800;
		letter-spacing: -0.04em;
	}

	.results-note p {
		margin-top: 0.55rem;
		font-size: 1rem;
		line-height: 1.5;
		color: rgba(10, 10, 10, 0.68);
	}

	.results-actions {
		display: flex;
		justify-content: center;
		margin-top: 1.5rem;
	}

	.results-restart {
		border: 0;
		border-radius: 999px;
		padding: 0.95rem 1.3rem;
		background: #0d0d0d;
		color: white;
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		cursor: pointer;
		transition:
			transform 180ms ease,
			opacity 180ms ease;
	}

	.results-restart:hover,
	.results-restart:focus-visible {
		transform: translateY(-1px);
		opacity: 0.92;
		outline: none;
	}

	.test-layout {
		flex: 1 1 auto;
		display: flex;
		flex-direction: column;
		padding: 1.75rem 1.25rem 1rem;
		min-height: 0;
	}

	.test-toolbar {
		display: flex;
		justify-content: flex-start;
		margin-bottom: 1.5rem;
	}

	.test-back {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.5rem 0.85rem;
		font-size: 0.8rem;
		border-radius: 100px;
	}

	.test-headline {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.test-headline h1 {
		margin: 0 auto;
		max-width: none;
		font-size: 3rem;
		line-height: 0.88;
		font-weight: 800;
		letter-spacing: -0.055em;
		text-wrap: balance;
	}

	.test-headline p {
		margin: 0.75rem 0 0;
		font-size: 0.9rem;
		color: rgba(10, 10, 10, 0.52);
	}

	.test-options {
		flex: 1 1 auto;
		min-height: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 2rem;
		align-items: stretch;
		margin-bottom: 1rem;
	}

	.test-option {
		min-height: 0;
		height: 100%;
		border: 1px solid rgba(12, 12, 12, 0.04);
		border-radius: 2rem;
		background: linear-gradient(180deg, #fbfbfb 0%, #f6f6f6 100%);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.9),
			0 18px 50px rgba(15, 23, 42, 0.05);
		padding: clamp(1.5rem, 2.5vw, 2.5rem);
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		font-size: clamp(1.2rem, 1.9vw, 1.85rem);
		line-height: 1.18;
		letter-spacing: -0.045em;
		cursor: pointer;
		transition:
			transform 180ms ease,
			box-shadow 180ms ease,
			border-color 180ms ease,
			background 180ms ease;
	}

	.test-option:hover,
	.test-option:focus-visible,
	.test-back:hover,
	.test-info:hover {
		transform: translateY(-2px);
		background: rgba(12, 12, 12, 0.06);
	}

	.test-option:hover,
	.test-option:focus-visible {
		border-color: rgba(0, 102, 178, 0.2);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.9),
			0 24px 55px rgba(0, 102, 178, 0.08);
		outline: none;
	}

	.test-option-active {
		border-color: rgba(0, 102, 178, 0.45);
		background: linear-gradient(180deg, rgba(0, 102, 178, 0.05), rgba(0, 102, 178, 0.09));
	}

	.test-footer {
		display: grid;
		gap: 0.85rem;
		flex: 0 0 auto;
	}

	.test-progress {
		height: 0.28rem;
		width: min(26rem, 22vw);
		margin: 0 auto;
		border-radius: 999px;
		background: rgba(12, 12, 12, 0.07);
		overflow: hidden;
	}

	.test-progress-bar {
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, #0066b2, #0d7fd8);
		transition: width 220ms ease;
	}

	.test-footer-actions {
		display: flex;
		justify-content: center;
	}

	.test-info {
		border: none;
		padding: 0.7rem 1rem;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.test-info:disabled {
		opacity: 0.45;
		cursor: not-allowed;
		transform: none;
	}

	.test-shortcuts {
		margin: 0;
		text-align: center;
		font-size: 0.85rem;
		color: rgba(10, 10, 10, 0.5);
		padding-top: 0.75rem;
		flex: 0 0 auto;
	}

	.test-shortcuts kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.6rem;
		padding: 0.15rem 0.35rem;
		border-radius: 0.4rem;
		background: rgba(12, 12, 12, 0.06);
		font-size: 0.8rem;
		font-weight: 700;
		color: rgba(10, 10, 10, 0.72);
	}

	@media (max-width: 900px) {
		.results-layout {
			padding: 1.25rem 0.75rem 2.5rem;
		}

		.results-hero {
			gap: 1.5rem;
		}

		.results-candidates {
			max-width: 100%;
			gap: 0.85rem;
		}

		.result-candidate {
			--card-height: calc(20rem + (var(--candidate-size) * 1.35rem));
			border-radius: 1.5rem;
			padding: 1rem;
		}

		.result-candidate-copy {
			margin-bottom: 4.2rem;
		}

		.result-candidate-logo {
			width: 3.8rem;
			height: 3.8rem;
		}

		.results-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			margin-top: 2.5rem;
			gap: 0.9rem;
		}

		.topic-card {
			min-height: 13.5rem;
		}

		.topic-card-body {
			font-size: clamp(1.35rem, 4vw, 1.8rem);
		}

		.test-layout {
			width: 100%;
		}

		.test-layout {
			padding: 1.25rem 0.75rem 0.9rem;
		}

		.test-headline h1 {
			font-size: 3rem;
		}

		.test-options {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.test-option {
			min-height: 11.5rem;
			font-size: clamp(1.2rem, 5vw, 1.6rem);
		}

		.test-progress {
			width: min(18rem, 72vw);
		}

		.test-shortcuts {
			padding-bottom: 0.5rem;
		}
	}

	@media (max-width: 640px) {
		.results-candidates {
			align-items: stretch;
		}

		.result-candidate {
			width: 100%;
		}

		.result-candidate-copy h2 {
			font-size: 1.35rem;
		}

		.result-candidate-copy p {
			font-size: 1rem;
		}

		.results-summary {
			font-size: 1.9rem;
		}

		.results-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
