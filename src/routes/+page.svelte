<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import Header from '$lib/components/Header.svelte';
</script>

<svelte:head>
	<title>Voto Estratégico - Segunda Vuelta 2026</title>
</svelte:head>

<section class="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
	<img
		src="/final.GIF"
		alt=""
		aria-hidden="true"
		class="absolute inset-0 h-full w-full object-cover"
		draggable="false"
		fetchpriority="high"
	/>
	<div class="absolute inset-0 bg-black/40"></div>
	<div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_12%,rgba(0,0,0,0.45)_100%)]"></div>

	<Header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-10 sm:py-7" />

	<div
		class="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-6 pb-16 pt-28 text-center sm:px-10 sm:pb-20 sm:pt-32"
	>
		<h1
			class="max-w-6xl text-[4.5rem] leading-[0.88] font-extrabold tracking-[-0.04em] text-balance uppercase sm:text-[6.5rem] lg:text-[9rem]"
			style="font-family: 'Barlow Condensed', sans-serif;"
		>
			VOTO NULO ES UN<br />
			VOTO PARA AMBOS
		</h1>
		<p
			class="mt-6 max-w-3xl text-lg leading-tight font-normal text-white/92 sm:text-2xl"
			style="font-family: 'Instrument Sans', sans-serif;"
		>
			Si votas en blanco, bajas la valla. Es mejor votar por el candidato que te representa
			más.
		</p>
		<div class="mt-20">
			<a
				href="/test"
				class="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/18 px-6 py-3 text-lg font-medium text-white shadow-[0_8px_40px_rgba(0,0,0,0.2)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/24 sm:px-8 sm:text-xl"
			>
				<ArrowRight class="h-5 w-5 sm:h-6 sm:w-6" />
				<span>Encuentra tu candidato</span>
			</a>
		</div>
	</div>
</section>

<div class="sr-only">
	<a href="/primera-vuelta">Ir a primera vuelta</a>
	<a href="/informe-transparencia-voto-estrategico-2026.pdf">Ver transparencia</a>
</div>
