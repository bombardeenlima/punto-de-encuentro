<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<a class="skip-link" href="#main-content">Saltar al contenido principal</a>

<div class="min-h-screen bg-background text-foreground">
	<div class="mx-auto max-w-5xl px-4 py-10">
		<main id="main-content" class="space-y-6">
			{@render children?.()}
		</main>
	</div>
</div>
