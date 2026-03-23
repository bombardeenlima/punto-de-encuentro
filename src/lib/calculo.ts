// src/lib/calculo.ts
import type { QuestionRow } from './server/data';

// Definition of Poles
export const POLES = {
	NEGATIVE: ['Conservador', 'Nacionalista', 'Sistema', 'Derecha'],
	POSITIVE: ['Liberal', 'Globalista', 'Antisistema', 'Izquierda']
};

export const AXIS_KEYS = {
	'Liberal-Conservador': 'liberal_conservador',
	'Izquierda-Derecha': 'izquierda_derecha',
	'Sistema-Antisistema': 'sistema_antisistema',
	'Nacionalista-Globalista': 'nacionalista_globalista'
} as const;

export type Eje = keyof typeof AXIS_KEYS;
export type EjeKey = typeof AXIS_KEYS[keyof typeof AXIS_KEYS];

/**
 * Normalizes candidate CSV 'Valor numérico' or user responses
 * by summing and dividing by (2 * number of valid answers in the axis).
 * 
 * For the user, we first convert the raw answer (-2 to 2) to the directional score.
 * For the candidates, their 'Valor numérico' is already the directional score.
 */

// Calculates user's profile based on their answers
export function calculateUserProfile(
	answers: Record<string, number | null>, // questionId -> answer value (-2 to +2, or null for skip)
	questions: QuestionRow[]
): Record<EjeKey, number> {
	const scores: Record<EjeKey, { total: number; count: number }> = {
		'liberal_conservador': { total: 0, count: 0 },
		'izquierda_derecha': { total: 0, count: 0 },
		'sistema_antisistema': { total: 0, count: 0 },
		'nacionalista_globalista': { total: 0, count: 0 }
	};

	for (const q of questions) {
		const answer = answers[q.id];
		// Empty, undefined, or missing answers are completely skipped
		if (answer === undefined || answer === null || isNaN(answer)) continue;

		const axisKey = AXIS_KEYS[q.eje as Eje];
		if (!axisKey) continue;

		let directionalScore = answer;
		
		// If the question pushes towards the negative side, we flip the user's answer
		// E.g. answering +2 to a Conservador question means -2 on the axis.
		if (POLES.NEGATIVE.includes(q.muyDeAcuerdoSignifica)) {
			directionalScore = -answer;
		} else if (!POLES.POSITIVE.includes(q.muyDeAcuerdoSignifica)) {
			// Fallback/safeguard, assuming positive by default or ignore
		}

		scores[axisKey].total += directionalScore;
		scores[axisKey].count += 1;
	}

	const profile: Record<EjeKey, number> = {
		'liberal_conservador': 0,
		'izquierda_derecha': 0,
		'sistema_antisistema': 0,
		'nacionalista_globalista': 0
	};

	for (const key of Object.keys(scores) as EjeKey[]) {
		const { total, count } = scores[key];
		// Position = Puntaje bruto / (2 * valid answers count)
		profile[key] = count > 0 ? total / (2 * count) : 0;
	}

	return profile;
}

// Calculates candidate profile based on their prepared directional scores
export function calculateCandidateProfile(
	candidateResponses: Record<string, { valorNumerico: number | null }>,
	questions: QuestionRow[]
): Record<EjeKey, number> {
	const scores: Record<EjeKey, { total: number; count: number }> = {
		'liberal_conservador': { total: 0, count: 0 },
		'izquierda_derecha': { total: 0, count: 0 },
		'sistema_antisistema': { total: 0, count: 0 },
		'nacionalista_globalista': { total: 0, count: 0 }
	};

	for (const q of questions) {
		const response = candidateResponses[q.id];
		if (!response || response.valorNumerico === null || isNaN(response.valorNumerico)) {
			continue;
		}

		const axisKey = AXIS_KEYS[q.eje as Eje];
		if (!axisKey) continue;

		// The candidate's `Valor numérico` is already the directional score
		scores[axisKey].total += response.valorNumerico;
		// Count explicitly ONLY when there is a valid answer. 'Neutral' (0) counts!
		scores[axisKey].count += 1;
	}

	const profile: Record<EjeKey, number> = {
		'liberal_conservador': 0,
		'izquierda_derecha': 0,
		'sistema_antisistema': 0,
		'nacionalista_globalista': 0
	};

	for (const key of Object.keys(scores) as EjeKey[]) {
		const { total, count } = scores[key];
		profile[key] = count > 0 ? total / (2 * count) : 0;
	}

	return profile;
}

/**
 * Calculates Euclidean distance between two profiles across the 4 dimensions.
 */
export function calculateEuclideanDistance(
	p1: Record<EjeKey, number>,
	p2: Record<EjeKey, number>
): number {
	const axes = Object.keys(AXIS_KEYS).map(k => AXIS_KEYS[k as Eje]) as EjeKey[];
	let sumSquared = 0;
	
	for (const axis of axes) {
		const diff = p1[axis] - p2[axis];
		sumSquared += diff * diff;
	}
	
	return Math.sqrt(sumSquared);
}

// Affinity is a percentage (100% means perfectly aligned, distance 0)
// Max Euclidean distance in a 4D space where each axis goes from -1 to 1 is sqrt(4 * 2^2) = 4
export function calculateAffinityPercentage(distance: number): number {
	const MAX_DISTANCE = 4;
	const normalizedDistance = Math.min(distance, MAX_DISTANCE) / MAX_DISTANCE;
	return Math.round((1 - normalizedDistance) * 100);
}
