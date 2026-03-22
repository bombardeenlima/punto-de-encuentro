import papa from 'papaparse';
import { calculateCandidateProfile } from '../calculo';

export interface QuestionRow {
id: string; // From the candidate files (e.g., "Suspension_libertades_indefinida")
pregunta: string;
muyDeAcuerdoSignifica: string;
eje: string;
}

export interface CandidateResponse {
preguntaId: string;
respuesta: string;
posturaPolitica: string;
valorNumerico: number | null;
cita: string;
fuente: string;
enlace: string;
minuto: string;
}

export interface Candidate {
id: string;
name: string;
responses: Record<string, CandidateResponse>;
// Will hold the calculated position in 4 axes
position: Record<string, number>;
}

// Map axes strings to standardized keys
export const AXIS_KEYS = {
'Liberal-Conservador': 'liberal_conservador',
'Izquierda-Derecha': 'izquierda_derecha',
'Sistema-Antisistema': 'sistema_antisistema',
'Nacionalista-Globalista': 'nacionalista_globalista'
} as const;

export type EjeKey = typeof AXIS_KEYS[keyof typeof AXIS_KEYS];

let cachedQuestions: QuestionRow[] | null = null;
let cachedCandidates: Candidate[] | null = null;

function loadData() {
if (cachedQuestions && cachedCandidates) {
return { questions: cachedQuestions, candidates: cachedCandidates };
}

const preguntasRaw = import.meta.glob('../assets/preguntas.csv', { query: '?raw', import: 'default', eager: true })['../assets/preguntas.csv'] as string;
const candidateFilesRaw = import.meta.glob('../assets/candidatos/*.csv', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

// 1. Load Carlos Alvarez to extract question IDs
const carlosRaw = candidateFilesRaw['../assets/candidatos/Carlos Alvarez.csv'];
if (!carlosRaw) {
throw new Error('Carlos Alvarez.csv not found');
}

const carlosData = papa.parse<any>(carlosRaw, { header: true }).data;
const questionIds = carlosData
.map(row => row.Pregunta)
.filter(Boolean)
.filter(id => !id.startsWith('Posición'));

// 2. Load and parse expected questions
const preguntasList = papa.parse<any>(preguntasRaw, { header: true }).data.filter(r => r.Pregunta);

if (preguntasList.length !== questionIds.length) {
throw new Error('Mismatch between preguntas.csv length and candidate question IDs');
}

const questions: QuestionRow[] = preguntasList.map((row, i) => ({
id: questionIds[i],
pregunta: row.Pregunta,
muyDeAcuerdoSignifica: row['Muy de acuerdo significa'],
eje: row.Eje
}));

// 3. Load all candidates
const candidates: Candidate[] = [];

for (const [path, raw] of Object.entries(candidateFilesRaw)) {
const file = path.split('/').pop()!;
const name = file.replace('.csv', '');
const data = papa.parse<any>(raw, { header: true }).data;

const responses: Record<string, CandidateResponse> = {};

for (const row of data) {
const qId = row.Pregunta;
if (!qId || qId.startsWith('Posición')) continue;

// Parsing value logic
let val = null;
if (row['Valor numérico'] && row['Valor numérico'].trim() !== '') {
val = parseInt(row['Valor numérico'], 10);
if (isNaN(val)) val = null;
}

responses[qId] = {
preguntaId: qId,
respuesta: row.Respuesta || '',
posturaPolitica: row['Postura política'] || '',
valorNumerico: val,
cita: row.Cita || '',
fuente: row.Fuente || '',
enlace: row.Enlace || '',
minuto: row.Minuto || ''
};
}

candidates.push({
id: name.toLowerCase().replace(/\s+/g, '-'),
name,
responses,
position: calculateCandidateProfile(responses, questions)
});
}

cachedQuestions = questions;
cachedCandidates = candidates;

return { questions, candidates };
}

export function getQuestions(): QuestionRow[] {
return loadData().questions;
}

export function getCandidates(): Candidate[] {
return loadData().candidates;
}
