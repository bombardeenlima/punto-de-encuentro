<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	const siteName = 'Voto Estrategico';
	const pageTitle = 'Voto Estrategico - 2026';
	const pageDescription =
		'Responde preguntas sobre tus posiciones y encuentra a los candidatos mas cercanos con viabilidad real.';
	const socialImage = '/social-preview.jpeg';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content={socialImage} />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={socialImage} />
</svelte:head>

<a class="skip-link" href="#main-content">Saltar al contenido principal</a>

<div class="min-h-screen bg-background text-foreground">
	<div class="mx-auto max-w-5xl px-4 py-10">
		<main id="main-content" class="space-y-6">
			{@render children?.()}
		</main>
	</div>
</div>
