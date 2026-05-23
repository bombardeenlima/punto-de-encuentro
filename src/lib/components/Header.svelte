<script lang="ts">
	import { base } from '$app/paths';
	import { Menu, X } from '@lucide/svelte';
	import favicon from '$lib/assets/favicon.svg';

	type HeaderLink = {
		href: string;
		label: string;
		target?: string;
		rel?: string;
	};

	const defaultLinks: HeaderLink[] = [
		{
			href: `${base}/informe-transparencia-voto-estrategico-2026.pdf`,
			label: 'Transparencia',
			target: '_blank',
			rel: 'noopener noreferrer'
		},
		{ href: `${base}/primera-vuelta`, label: 'Nosotros' }
	];

	export let className =
		'flex items-center justify-between px-5 py-5 sm:px-10 sm:py-7';
	export let brandHref = `${base}/`;
	export let brandLabel = 'Voto Estratégico';
	export let brandClass = 'flex items-center gap-2 text-base font-semibold tracking-tight sm:text-lg';
	export let navClass = 'hidden items-center gap-3 text-sm font-medium sm:flex sm:text-base';
	export let linkClass =
		'rounded-full border border-white/35 bg-white/14 px-4 py-2 backdrop-blur-md transition-colors hover:bg-white/22';
	export let menuButtonClass =
		'inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-white/14 backdrop-blur-md transition-colors hover:bg-white/22';
	export let mobilePanelClass =
		'absolute right-0 mt-3 flex min-w-[13rem] flex-col gap-2 rounded-3xl border border-white/20 bg-black/70 p-3 text-sm font-medium shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl';
	export let mobileLinkClass =
		'rounded-2xl border border-white/15 bg-white/10 px-4 py-3 transition-colors hover:bg-white/18';
	export let links: HeaderLink[] = defaultLinks;

	let mobileMenuOpen = false;

	function closeMenu() {
		mobileMenuOpen = false;
	}
</script>

<header class={className}>
	<a href={brandHref} class={brandClass}>
		<img src={favicon} alt="" class="h-5 w-5 sm:h-6 sm:w-6" />
		<span>{brandLabel}</span>
	</a>

	<nav class={navClass} aria-label="Navegacion principal">
		{#each links as link}
			<a href={link.href} target={link.target} rel={link.rel} class={linkClass}>
				{link.label}
			</a>
		{/each}
	</nav>

	<div class="relative sm:hidden">
		<button
			type="button"
			class={menuButtonClass}
			aria-label={mobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
			aria-expanded={mobileMenuOpen}
			aria-controls="mobile-header-menu"
			on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
		>
			{#if mobileMenuOpen}
				<X class="h-5 w-5" />
			{:else}
				<Menu class="h-5 w-5" />
			{/if}
		</button>

		{#if mobileMenuOpen}
			<div id="mobile-header-menu" class={mobilePanelClass}>
				{#each links as link}
					<a
						href={link.href}
						target={link.target}
						rel={link.rel}
						class={mobileLinkClass}
						on:click={closeMenu}
					>
						{link.label}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</header>
