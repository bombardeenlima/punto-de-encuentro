import type { PageServerLoad } from './$types';
import { getQuestions, getCandidates } from '$lib/server/data';

const shuffleQuestions = <T>(items: readonly T[]) => {
	const shuffled = [...items];
	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
	}
	return shuffled;
};

export const load: PageServerLoad = async () => {
	type LoadedQuestion = ReturnType<typeof getQuestions>[0];
	type Candidate = ReturnType<typeof getCandidates>[0];

	const questions = getQuestions();
	const candidates = getCandidates();

	return {
		questions: shuffleQuestions(questions),
		rawQuestions: questions, // useful if not shuffled for calculation index lookup
		candidates
	};
};
