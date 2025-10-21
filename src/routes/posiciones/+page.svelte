<script lang="ts">
	import { Button } from "$lib";
	import {
		Accordion,
		AccordionContent,
		AccordionItem,
		AccordionTrigger,
	} from "$lib/components/ui/accordion";
	import type { PageData } from "./$types";

	export let data: PageData;

	const topics = data.topics;
	const filteredTopics = topics
		.map((topic) => ({
			...topic,
			parties: topic.parties.filter((party) => {
				const postura = party.postura?.trim();
				return postura && postura.length > 0;
			}),
		}))
		.filter((topic) => topic.parties.length > 0);
</script>

<main
	id="main-content"
	class="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-16 sm:px-10"
	aria-labelledby="topics-title"
	aria-describedby="topics-description"
>
	<div class="flex justify-center sm:justify-start">
		<Button
			variant="ghost"
			href="/"
			class="flex w-fit items-center gap-2 px-0 text-sm text-muted-foreground hover:text-foreground"
		>
			<span aria-hidden="true">←</span>
			<span>Ir al Inicio</span>
		</Button>
	</div>
	<header class="space-y-4 text-center sm:text-left">
		<h1
			id="topics-title"
			class="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
		>
			Posiciones de los partidos
		</h1>
		<p
			id="topics-description"
			class="mx-auto max-w-2xl text-pretty text-muted-foreground sm:mx-0"
		>
			Explorá cómo se posiciona cada partido frente a los temas que marcan la agenda
			pública.
		</p>
	</header>

	{#if filteredTopics.length > 0}
		<Accordion
			type="multiple"
			class="rounded-lg border border-border/70 bg-background/95"
			aria-label="Temas y posiciones de los partidos"
			aria-labelledby="topics-title"
			aria-describedby="topics-description"
		>
			{#each filteredTopics as topic}
				<AccordionItem value={topic.tema}>
					<AccordionTrigger
						class="text-base font-semibold text-foreground px-4 py-3 sm:px-6"
						level={2}
					>
						{topic.tema}
					</AccordionTrigger>
					<AccordionContent class="space-y-4 px-4 pb-6 pt-4 text-sm text-muted-foreground">
						<ul
							class="space-y-3"
							aria-label={`Posiciones de partidos sobre ${topic.tema}`}
						>
							{#each topic.parties as party}
								<li class="border-border/60 bg-muted/40 rounded-md border p-4 sm:p-6">
									<h3 class="text-sm font-semibold text-foreground">
										{party.displayName}
									</h3>
									<p class="mt-2 text-sm text-muted-foreground">
										{party.postura}
									</p>
								</li>
							{/each}
						</ul>
					</AccordionContent>
				</AccordionItem>
			{/each}
		</Accordion>
	{:else}
		<p class="text-center text-muted-foreground sm:text-left">
			Aún no hay posiciones registradas. Volvé pronto.
		</p>
	{/if}
</main>
