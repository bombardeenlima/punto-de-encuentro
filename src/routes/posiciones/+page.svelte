<script lang="ts">
	import { Button } from '$lib';
	import { ChevronDown } from '@lucide/svelte';
	import type { PageData } from './$types';

	const { data } = $props<{ data: PageData }>();

	const topics = data.topics;
	const filteredTopics = topics
		.map((topic) => ({
			...topic,
			parties: topic.parties.filter((party) => {
				const postura = party.postura?.trim();
				return postura && postura.length > 0;
			})
		}))
		.filter((topic) => topic.parties.length > 0);

	let expandedTopics = $state<Set<string>>(new Set());

	function toggleTopic(tema: string) {
		const newExpanded = new Set(expandedTopics);
		if (newExpanded.has(tema)) {
			newExpanded.delete(tema);
		} else {
			newExpanded.add(tema);
		}
		expandedTopics = newExpanded;
	}
</script>

<div class="mx-auto max-w-5xl px-6 py-16">
	<div class="mb-12 flex items-start justify-between">
		<div>
			<Button
				variant="ghost"
				href="/"
				class="mb-6 flex w-fit items-center gap-2 px-0 text-sm text-muted-foreground hover:text-foreground"
			>
				<span aria-hidden="true">←</span>
				<span>Ir al Inicio</span>
			</Button>
			<h1
				id="topics-title"
				class="mb-4 text-5xl leading-tight font-bold tracking-tight text-foreground"
			>
				Posiciones de los partidos
			</h1>
			<p id="topics-description" class="max-w-2xl text-lg text-muted-foreground">
				Explorá cómo se posiciona cada partido frente a los temas que marcan la agenda pública.
			</p>
		</div>
	</div>

	{#if filteredTopics.length > 0}
		<div class="space-y-3">
			{#each filteredTopics as topic}
				{@const isExpanded = expandedTopics.has(topic.tema)}
				<div class="overflow-hidden rounded-md border border-border bg-card transition-all">
					<button
						onclick={() => toggleTopic(topic.tema)}
						class="group flex w-full items-center justify-between p-6 text-left transition-all hover:bg-accent/50"
						aria-expanded={isExpanded}
					>
						<div class="flex-1">
							<h2 class="text-xl font-semibold text-foreground">
								{topic.tema}
							</h2>
							<p class="mt-1 text-sm text-muted-foreground">
								{topic.parties.length}
								{topic.parties.length === 1 ? 'posición' : 'posiciones'}
							</p>
						</div>
						<ChevronDown
							class="h-5 w-5 text-muted-foreground transition-transform {isExpanded
								? 'rotate-180'
								: ''}"
						/>
					</button>

					{#if isExpanded}
						<div class="border-t border-border bg-background/50 p-6">
							<div class="grid gap-4 sm:grid-cols-2">
								{#each topic.parties as party}
									<div class="rounded-md border border-border bg-card p-5">
										<h3 class="mb-2 font-semibold text-foreground">
											{party.displayName}
										</h3>
										<p class="text-sm leading-relaxed text-muted-foreground">
											{party.postura}
										</p>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div class="rounded-md border border-dashed border-border bg-card/30 p-12 text-center">
			<p class="text-muted-foreground">Aún no hay posiciones registradas. Volvé pronto.</p>
		</div>
	{/if}
</div>
