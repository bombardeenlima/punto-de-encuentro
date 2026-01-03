<script lang="ts">
	import { ArrowRight, CheckCircle2, FileText, Users, Compass } from '@lucide/svelte';
</script>

<div class="mx-auto max-w-5xl px-6 py-16">
	<div class="mb-16">
		<h1 class="mb-4 text-5xl leading-tight font-bold tracking-tight text-foreground sm:text-6xl">
			Un test de cercanía política hecho para ti
		</h1>
		<p class="max-w-3xl text-xl leading-relaxed text-muted-foreground">
			Punto de Encuentro reúne las herramientas esenciales. Evalúa tu cercanía con los partidos,
			explora posiciones sobre los temas centrales y entiende el contexto que sostiene cada
			propuesta.
		</p>
	</div>

	<div class="mb-12 grid gap-3 sm:grid-cols-3">
		<a
			href="/test-de-cercania"
			class="group flex min-h-[200px] flex-col justify-between rounded-md border border-border bg-card p-8 transition-all hover:bg-accent/50"
		>
			<div class="mb-6">
				<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-muted">
					<Compass class="h-6 w-6 text-foreground/80" />
				</div>
				<h2 class="mb-2 text-xl font-semibold text-foreground">Comenzar test</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					Descubre tu afinidad con los partidos políticos
				</p>
			</div>
			<div
				class="flex items-center text-sm font-medium text-foreground/60 group-hover:text-foreground/80"
			>
				<span class="mr-1">Iniciar</span>
				<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
			</div>
		</a>

		<a
			href="/posiciones"
			class="group flex min-h-[200px] flex-col justify-between rounded-md border border-border bg-card p-8 transition-all hover:bg-accent/50"
		>
			<div class="mb-6">
				<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-muted">
					<FileText class="h-6 w-6 text-foreground/80" />
				</div>
				<h2 class="mb-2 text-xl font-semibold text-foreground">Ver posiciones</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					Explora las propuestas sobre temas centrales
				</p>
			</div>
			<div
				class="flex items-center text-sm font-medium text-foreground/60 group-hover:text-foreground/80"
			>
				<span class="mr-1">Explorar</span>
				<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
			</div>
		</a>

		<a
			href="/perfiles"
			class="group flex min-h-[200px] flex-col justify-between rounded-md border border-border bg-card p-8 transition-all hover:bg-accent/50"
		>
			<div class="mb-6">
				<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-muted">
					<Users class="h-6 w-6 text-foreground/80" />
				</div>
				<h2 class="mb-2 text-xl font-semibold text-foreground">Explorar perfiles</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					Conoce el contexto detrás de cada partido
				</p>
			</div>
			<div
				class="flex items-center text-sm font-medium text-foreground/60 group-hover:text-foreground/80"
			>
				<span class="mr-1">Descubrir</span>
				<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
			</div>
		</a>
	</div>

	<div
		class="flex items-center gap-6 rounded-md border border-border bg-card/30 px-6 py-4 text-sm text-muted-foreground"
	>
		<div class="flex items-center gap-2">
			<CheckCircle2 class="h-4 w-4" />
			<span>Fuentes verificadas y lenguaje neutro</span>
		</div>
		<div class="hidden h-4 w-px bg-border sm:block"></div>
		<span>Actualizaciones semanales y trazabilidad clara</span>
	</div>
</div>
