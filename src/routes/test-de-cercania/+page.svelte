<script lang="ts">
	import { Button } from "$lib";
	import type { PageData } from "./$types";

	const { data } = $props<{ data: PageData }>();
	const questions = data.questions;
	const totalQuestions = questions.length;

	let currentIndex = $state(0);
	let answers = $state<Record<string, number>>({});
	let showResults = $state(false);

	type AxisDescriptor = {
		label: string;
		higherKey: string;
		higherLabel: string;
		lowerKey: string;
		lowerLabel: string;
		interpretations: Record<"higher" | "lower" | "center", string>;
		guide?: {
			headline: string;
			questions: string[];
			highNote: string;
			lowNote: string;
		};
		axisRole?: "primary" | "secondary";
	};

	const axisDescriptors = {
		economic: {
			label: "Eje económico (X: izquierda <-> derecha)",
			higherKey: "left",
			higherLabel: "Izquierda",
			lowerKey: "right",
			lowerLabel: "Derecha",
			interpretations: {
				higher: "Estatismo, redistribución y nacionalización de sectores estratégicos.",
				lower: "Mercado libre, propiedad privada y prioridad a intereses corporativos o individuales.",
				center: "Combinás intervención estatal y mercado según el tema económico.",
			},
			guide: {
				headline: "Preguntas clave",
				questions: ["P1", "P2", "P4"],
				highNote: "Altos (4-5) -> Izquierda: estatismo, redistribución, nacionalización, protección de colectivos.",
				lowNote: "Bajos (1-2) -> Derecha: mercado libre, propiedad privada, prioridad a intereses individuales o corporativos.",
			},
			axisRole: "primary",
		} satisfies AxisDescriptor,
		social: {
			label: "Eje social (Y: autoritarismo <-> libertarismo)",
			higherKey: "authoritarian",
			higherLabel: "Autoritarismo",
			lowerKey: "libertarian",
			lowerLabel: "Libertarismo",
			interpretations: {
				higher: "Orden, moral tradicional, centralismo y soberanía cerrada frente al exterior.",
				lower: "Apertura cultural, descentralización y confianza en reformas institucionales.",
				center: "Equilibrás entre valores tradicionales y apertura social según el tema.",
			},
			guide: {
				headline: "Preguntas clave",
				questions: ["P3", "P5", "P6", "P7"],
				highNote: "Altos (4-5) -> Autoritarismo: énfasis en orden, moral tradicional, centralismo y nacionalismo.",
				lowNote: "Bajos (1-2) -> Libertarismo: apertura cultural, descentralización y cooperación internacional.",
			},
			axisRole: "primary",
		} satisfies AxisDescriptor,
		political_alignment: {
			label: "Representación política",
			higherKey: "represented",
			higherLabel: "Representado",
			lowerKey: "misaligned",
			lowerLabel: "Desalineado",
			interpretations: {
				higher: "Sentís que existe al menos una opción política cercana a tus ideas.",
				lower: "Percibís distancia con las alternativas políticas disponibles.",
				center: "Tu sensación de representación varía según el proceso electoral.",
			},
			axisRole: "secondary",
		} satisfies AxisDescriptor,
	} as const satisfies Record<string, AxisDescriptor>;

	type AxisKey = keyof typeof axisDescriptors;

	const currentQuestion = $derived.by(() => questions[currentIndex]);
	const currentSelection = $derived.by(() => (currentQuestion ? answers[currentQuestion.id] : undefined));
	const answeredCount = $derived.by(() => Object.keys(answers).length);
	const remainingQuestions = $derived.by(() => {
		if (showResults) return 0;
		return Math.max(0, totalQuestions - answeredCount);
	});
	const remainingProgress = $derived.by(() => {
		if (totalQuestions === 0) return 0;
		if (showResults) return 0;
		return Math.max(0, Math.round((remainingQuestions / totalQuestions) * 100));
	});

	function selectAnswer(value: number) {
		if (!currentQuestion) return;
		answers[currentQuestion.id] = value;
	}

	function goNext() {
		if (!currentQuestion) return;
		if (currentSelection == null) return;

		if (currentIndex >= totalQuestions - 1) {
			showResults = true;
			return;
		}

		currentIndex += 1;
	}

	function goBack() {
		if (currentIndex === 0) return;
		currentIndex -= 1;
		showResults = false;
	}

	function handleSubmit(event: Event) {
		event.preventDefault();
		goNext();
	}

	function restart() {
		answers = {};
		currentIndex = 0;
		showResults = false;
	}

	function describeLeaning(leaning: "higher" | "lower" | "center", axis: AxisKey) {
		const descriptor = axisDescriptors[axis];
		return descriptor?.interpretations?.[leaning] ?? "Visión equilibrada en este eje.";
	}

	const HIGH_THRESHOLD = 0.75;
	const LOW_THRESHOLD = 0.25;

	const results = $derived.by(() => {
		if (!showResults) return [];

		const aggregates = new Map<string, { total: number; weight: number; scaleMin: number; scaleMax: number }>();

		for (const question of questions) {
			const response = answers[question.id];
			if (response == null) continue;

			const [min, max] = question.scale;
			const normalized = (response - min) / (max - min || 1);
			const axis = question.axis as keyof typeof axisDescriptors;
			const descriptor = axisDescriptors[axis];
			if (!descriptor) continue;

			let aligned = normalized;
			if (question.higher !== descriptor.higherKey && question.higher !== "none") {
				aligned = 1 - normalized;
			}

			const entry =
				aggregates.get(axis) ?? { total: 0, weight: 0, scaleMin: min, scaleMax: max };
			entry.total += aligned * question.weight;
			entry.weight += question.weight;
			entry.scaleMin = Math.min(entry.scaleMin, min);
			entry.scaleMax = Math.max(entry.scaleMax, max);
			aggregates.set(axis, entry);
		}

		return Array.from(aggregates.entries()).map(([axis, { total, weight, scaleMin, scaleMax }]) => {
			const descriptor = axisDescriptors[axis as keyof typeof axisDescriptors];
			const average = weight > 0 ? total / weight : 0.5;
			const leaningKey = average >= HIGH_THRESHOLD ? "higher" : average <= LOW_THRESHOLD ? "lower" : "center";
			const leaningLabel =
				leaningKey === "higher"
					? descriptor.higherLabel
					: leaningKey === "lower"
						? descriptor.lowerLabel
						: "Equilibrio";
			const rawScore = scaleMin + average * (scaleMax - scaleMin);
			const formattedScore = Math.round(rawScore * 10) / 10;
			const intensity = Math.round(average * 100);

			return {
				axis,
				label: descriptor.label,
				leaningKey,
				leaningLabel,
				intensity,
				average,
				score: formattedScore,
				scoreMax: scaleMax,
				description: describeLeaning(leaningKey, axis as keyof typeof axisDescriptors),
				higherLabel: descriptor.higherLabel,
				lowerLabel: descriptor.lowerLabel,
				guide: descriptor.guide,
				axisRole: descriptor.axisRole ?? "secondary",
			};
		});
	});

	const resultByAxis = $derived.by(() => {
		return new Map(results.map((result) => [result.axis as string, result]));
	});

	const quadrant = $derived.by(() => {
		if (!showResults) return null;
		const economic = resultByAxis.get("economic");
		const social = resultByAxis.get("social");
		if (!economic || !social) return null;

		const econLean = economic.leaningKey;
		const socialLean = social.leaningKey;

		const quadrantMap = {
			left_libertarian: {
				name: "Izquierda Libertaria",
				description:
					"Estatismo económico con apertura cultural y énfasis en descentralización. Característico de movimientos progresistas urbanos, feministas o ambientalistas.",
			},
			left_authoritarian: {
				name: "Izquierda Autoritaria",
				description:
					"Economía estatista combinada con moral conservadora, centralismo y soberanía fuerte. Común en corrientes nacional-populares.",
			},
			right_libertarian: {
				name: "Derecha Libertaria",
				description:
					"Mercado libre con libertades sociales, apertura cultural y confianza en la globalización.",
			},
			right_authoritarian: {
				name: "Derecha Autoritaria",
				description:
					"Prioridad al mercado junto con orden social rígido, centralismo y defensa de valores tradicionales.",
			},
		};

		const isEconLeft = econLean === "higher";
		const isEconRight = econLean === "lower";
		const isSocialAuthoritarian = socialLean === "higher";
		const isSocialLibertarian = socialLean === "lower";

		if (!isEconLeft && !isEconRight || !isSocialAuthoritarian && !isSocialLibertarian) {
			return {
				name: "Zona intermedia",
				description:
					"Tus respuestas se ubican cerca del centro. Mezclás propuestas estatistas y de mercado con matices sociales que varían según el tema.",
			};
		}

		const key = `${isEconLeft ? "left" : "right"}_${isSocialAuthoritarian ? "authoritarian" : "libertarian"}` as const;
		return quadrantMap[key];
	});

	const readingTips = [
		"Si alguien marca alto en P6 pero bajo en P3 y P5 -> perfil anti-sistema libertario (protesta social, rechazo a partidos, pero no conservador).",
		"Si marca alto en P7 junto con P3 y P5 -> autoritarismo nacionalista (común en derechas e izquierdas conservadoras peruanas).",
		"Si combina alto en P1, P2 y P4 pero bajo en P3, P5 y P7 -> izquierda progresista o libertaria (movimientos urbanos, feministas, ambientalistas).",
	];
</script>

<svelte:head>
	<title>Test de cercanía con partidos</title>
</svelte:head>

<section class="min-h-screen bg-background">
	<div class="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-12 lg:py-16">
		<div class="flex justify-center">
			<Button variant="ghost" href="/">Volver a la página principal</Button>
		</div>
		<header class="space-y-3 text-center">
			<p class="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Test de cercanía</p>
			<h1 class="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Descubrí tu ubicación política</h1>
			<p class="mx-auto max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
				Respondé las afirmaciones y obtené un mapa claro de tus preferencias económicas y culturales.
			</p>
		</header>

		<div class="space-y-4">
			<div class="h-2 w-full rounded-full bg-muted">
				<div
					class="h-full rounded-full bg-primary transition-all duration-300"
					style={`width: ${remainingProgress}%`}
				></div>
			</div>
			<p class="text-sm text-muted-foreground">
				{showResults
					? "Resultados listos"
					: `Quedan ${remainingQuestions} ${remainingQuestions === 1 ? "pregunta" : "preguntas"} de ${totalQuestions}`}
			</p>
		</div>

		{#if showResults}
			<div class="space-y-8">
				<div class="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm shadow-black/5">
					<h2 class="text-2xl font-semibold text-foreground">Tus resultados</h2>
					<p class="mt-2 text-base text-muted-foreground">
						Promediamos tus respuestas en cada eje y las interpretamos según el mapa político peruano: economía (izquierda ↔ derecha) y sociedad (autoritarismo ↔ libertarismo).
					</p>
				</div>

				{#if quadrant}
					<article class="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm shadow-black/5">
						<p class="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Cuadrante final</p>
						<h3 class="mt-2 text-xl font-semibold text-foreground">{quadrant.name}</h3>
						<p class="mt-3 text-sm text-muted-foreground">{quadrant.description}</p>
					</article>
				{/if}

				<div class="grid gap-6 md:grid-cols-2">
					{#each results as result}
						<article class="flex h-full flex-col justify-between rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm shadow-black/5">
							<header class="space-y-1">
								<p class="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">{result.label}</p>
								<h3 class="text-xl font-semibold text-foreground">{result.leaningLabel === "Equilibrio" ? "Posición equilibrada" : `Tendencia ${result.leaningLabel}`}</h3>
							</header>
							<div class="mt-4 space-y-4">
								<p class="text-sm font-semibold text-foreground">Promedio: {result.score} / {result.scoreMax}</p>
								<p class="text-xs uppercase tracking-[0.25em] text-muted-foreground">Escala: {result.lowerLabel} ↔ {result.higherLabel}</p>
								<div class="h-2 w-full rounded-full bg-muted">
									<div
										class={`h-full rounded-full ${result.leaningKey === "higher" ? "bg-emerald-500" : result.leaningKey === "lower" ? "bg-amber-500" : "bg-primary"}`}
										style={`width: ${result.intensity}%`}
									></div>
								</div>
								<p class="text-sm text-muted-foreground">{result.description}</p>
								{#if result.guide}
									<hr class="border-border/60" />
									<div class="space-y-2 text-xs text-muted-foreground">
										<p class="font-semibold uppercase tracking-[0.2em]">{result.guide.headline}</p>
										<p>{result.guide.questions.join(", ")}</p>
										<ul class="space-y-1">
											<li>{result.guide.highNote}</li>
											<li>{result.guide.lowNote}</li>
										</ul>
									</div>
								{/if}
							</div>
						</article>
					{/each}
				</div>

				<div class="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm shadow-black/5">
					<p class="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Tips para leer casos concretos</p>
					<ul class="mt-3 space-y-2 text-sm text-muted-foreground">
						{#each readingTips as tip}
							<li>{tip}</li>
						{/each}
					</ul>
				</div>

				<div class="flex flex-wrap items-center gap-3">
					<Button variant="outline" onclick={restart}>Volver a empezar</Button>
				</div>
			</div>
		{:else if currentQuestion}
			<article class="space-y-6">
				<header class="space-y-2">
					<p class="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">{currentQuestion.axis === "economic" ? "Eje económico" : currentQuestion.axis === "social" ? "Eje cultural" : "Representación"}</p>
					<h2 class="text-2xl font-semibold text-foreground">{currentQuestion.text}</h2>
					{#if currentQuestion.note}
						<p class="text-sm text-muted-foreground">{currentQuestion.note}</p>
					{/if}
				</header>

				<form class="space-y-4" onsubmit={handleSubmit}>
					{#each currentQuestion.options as option}
						<label class={`block cursor-pointer rounded-xl border border-border/60 bg-card/70 px-4 py-3 transition hover:border-primary/60 ${currentSelection === option.value ? "border-primary bg-primary/10" : ""}`}>
							<input
								type="radio"
								name={currentQuestion.id}
								class="sr-only"
								value={option.value}
								checked={currentSelection === option.value}
								onchange={() => selectAnswer(option.value)}
							/>
							<span class="block text-base font-medium text-foreground">{option.label}</span>
						</label>
					{/each}

					<div class="flex flex-wrap items-center gap-3 pt-2">
						<Button variant="outline" type="button" onclick={goBack} disabled={currentIndex === 0}>Anterior</Button>
						<Button type="submit" disabled={currentSelection == null}>{currentIndex === totalQuestions - 1 ? "Ver resultados" : "Siguiente"}</Button>
					</div>
				</form>
			</article>
		{/if}
	</div>
</section>
