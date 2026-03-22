import re

with open("src/routes/test-de-cercania/+page.svelte", "r") as f:
    text = f.read()

# Replace script block
script_block = """<script lang="ts">
import { Button, CartesianPlane } from '$lib';
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
{ label: 'Muy en desacuerdo', value: -2 },
{ label: 'En desacuerdo', value: -1 },
{ label: 'Neutral / No opino', value: 0 },
{ label: 'De acuerdo', value: 1 },
{ label: 'Muy de acuerdo', value: 2 }
] as const;

const activeQuestions = $derived(questions);

let currentIndex = $state(0);
let answers = $state<Record<string, number>>({});
let showResults = $state(false);

const totalQuestions = $derived(activeQuestions.length);
const currentQuestion = $derived(activeQuestions[currentIndex]);
const currentAnswer = $derived(currentQuestion ? answers[currentQuestion.id] : undefined);
const answeredCount = $derived(
activeQuestions.reduce((count, q) => (answers[q.id] == null ? count : count + 1), 0)
);
const progressPercent = $derived(
totalQuestions === 0 ? 0 : Math.round((answeredCount / totalQuestions) * 100)
);

const hasStarted = $derived(!showResults);

const userProfile = $derived.by(() => {
if (!showResults) return null;
return calculateUserProfile(answers, rawQuestions);
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
.map((candidate) => {
const pos = candidate.position;
if (!pos) return null;
return {
x: (pos.izquierda_derecha ?? 0) * 32,
y: (pos.liberal_conservador ?? 0) * 32,
label: candidate.name,
id: candidate.id
} satisfies PlotPoint;
})
.filter((point): point is PlotPoint => point != null)
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

const nearestParties = $derived.by(() => {
if (!userProfile) return [];

return candidates
.map((candidate) => {
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
affinity
};
})
.sort((a, b) => a.distance - b.distance);
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

if (hasStarted && !showResults && questionContainerRef) {
queueMicrotask(() => {
questionContainerRef?.focus();
});
}
});

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

function handleKeyboardNavigation(event: KeyboardEvent) {
if (!hasStarted || showResults) return;

if (event.key === 'ArrowLeft' && currentIndex > 0) {
event.preventDefault();
goBack();
} else if (event.key === 'ArrowRight' && currentAnswer != null) {
event.preventDefault();
goNext();
}

if (currentQuestion && event.key >= '1' && event.key <= '5') {
event.preventDefault();
const answerIndex = parseInt(event.key) - 1;
if (answerIndex < answerChoices.length) {
recordAnswer(currentQuestion.id, answerChoices[answerIndex].value);
}
}

if (event.key === 'Enter' && currentAnswer != null) {
event.preventDefault();
goNext();
}
}
</script>"""

new_text = re.sub(r"<script lang=\"ts\">.*?</script>", script_block, text, flags=re.DOTALL)
new_text = new_text.replace("currentQuestion._id", "currentQuestion.id")

# Replacing `party.distance` with affinity percentage mapping in HTML
new_text = new_text.replace("{party.distance.toFixed(1)}u", "{party.affinity}%")

with open("src/routes/test-de-cercania/+page.svelte", "w") as f:
    f.write(new_text)

