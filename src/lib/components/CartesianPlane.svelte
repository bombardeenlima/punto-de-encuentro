<script lang="ts">
	import { createEventDispatcher } from "svelte";

	const RANGE = 32;
	const GRID_STEP = 4;
	const MAJOR_STEP = 8;
	const MARGIN = 1;
	const DOT_RADIUS = 0.55;
	const VIEW_EXTENT = RANGE + MARGIN;
	const VIEW_BOX = `${-VIEW_EXTENT} ${-VIEW_EXTENT} ${VIEW_EXTENT * 2} ${VIEW_EXTENT * 2}`;

	type SelectDetail = { x: number; y: number };

	const dispatch = createEventDispatcher<{ select: SelectDetail }>();

	let {
		x = $bindable(0),
		y = $bindable(0),
		interactive = false,
		label = "Plano cartesiano",
	} = $props<{
		x?: number;
		y?: number;
		interactive?: boolean;
		label?: string;
	}>();

	let svgEl = $state<SVGSVGElement | null>(null);

	const gridLines = $derived.by(() => {
		const lines: number[] = [];
		for (let value = -RANGE; value <= RANGE; value += GRID_STEP) {
			lines.push(Number(value.toFixed(5)));
		}
		return lines;
	});

	const majorTicks = $derived.by(() => gridLines.filter((value) => value % MAJOR_STEP === 0));

	const plotted = $derived.by(() => ({
		x: clampCoordinate(x),
		y: clampCoordinate(y),
	}));

	function clampCoordinate(value: number) {
		const rounded = Math.round(value * 100) / 100;
		return Math.max(-RANGE, Math.min(RANGE, rounded));
	}

	function normalisePointer(event: MouseEvent) {
		if (!svgEl) return null;
		const rect = svgEl.getBoundingClientRect();
		const px = event.clientX - rect.left;
		const py = event.clientY - rect.top;
		const svgX = (px / rect.width) * (VIEW_EXTENT * 2) - VIEW_EXTENT;
		const svgY = VIEW_EXTENT - (py / rect.height) * (VIEW_EXTENT * 2);
		return { x: clampCoordinate(svgX), y: clampCoordinate(svgY) } as const;
	}

	function handlePointer(event: MouseEvent) {
		if (!interactive) return;
		const point = normalisePointer(event);
		if (!point) return;
		x = point.x;
		y = point.y;
		dispatch("select", point);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!interactive) return;
		const step = event.shiftKey ? 4 : 1;
		let handled = true;
		switch (event.key) {
			case "ArrowUp":
				y = clampCoordinate(y + step);
				break;
			case "ArrowDown":
				y = clampCoordinate(y - step);
				break;
			case "ArrowRight":
				x = clampCoordinate(x + step);
				break;
			case "ArrowLeft":
				x = clampCoordinate(x - step);
				break;
			default:
				handled = false;
		}
		if (handled) {
			event.preventDefault();
			dispatch("select", { x, y });
		}
	}

</script>

{#if interactive}
	<div class="flex flex-col gap-3">
		<div class="flex items-center justify-between text-xs text-muted-foreground">
			<span class="font-medium uppercase tracking-[0.2em]">Plano</span>
			<span class="rounded-full bg-muted px-2 py-0.5 text-[10px]">Click o flechas para mover</span>
		</div>
		<button
			type="button"
			class="relative w-full overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			aria-label={label}
			onclick={handlePointer}
			onkeydown={handleKeyDown}
		>
			<svg
				bind:this={svgEl}
				viewBox={VIEW_BOX}
				class="pointer-events-none size-full"
			>
				<defs>
					<linearGradient id="plane-background" x1="0" x2="0" y1="0" y2="1">
						<stop offset="0%" stop-color="var(--color-secondary)" stop-opacity="0.7" />
						<stop offset="100%" stop-color="var(--color-secondary)" stop-opacity="0.95" />
					</linearGradient>
				</defs>

				<rect x={-VIEW_EXTENT} y={-VIEW_EXTENT} width={VIEW_EXTENT * 2} height={VIEW_EXTENT * 2} fill="url(#plane-background)" />

				<g class="stroke-border/60">
					{#each gridLines as value (value)}
						{#if value !== 0}
							<line x1={value} y1={-RANGE} x2={value} y2={RANGE} stroke-width="0.05" />
							<line x1={-RANGE} y1={-value} x2={RANGE} y2={-value} stroke-width="0.05" />
						{/if}
					{/each}
				</g>

				<g class="stroke-border/90">
					<line x1={0} y1={-RANGE} x2={0} y2={RANGE} stroke-width="0.2" />
					<line x1={-RANGE} y1={0} x2={RANGE} y2={0} stroke-width="0.2" />
				</g>

				<g class="fill-muted-foreground text-[1.5px]">
					{#each majorTicks as tick (tick)}
						{#if tick !== 0}
							<text x={tick} y={-0.8} text-anchor="middle">{tick}</text>
							<text x={0.8} y={-tick} text-anchor="start" alignment-baseline="middle">{tick}</text>
						{/if}
					{/each}
				</g>

				<g class="fill-muted-foreground/80 text-[1.2px]">
					<text x={RANGE - 1.5} y={-1.5} text-anchor="end">x</text>
					<text x={1.5} y={-(RANGE - 1.5)} text-anchor="start">y</text>
				</g>

				<circle cx={plotted.x} cy={-plotted.y} r={DOT_RADIUS * 2} class="fill-primary/20" stroke="var(--color-card)" stroke-width="0.2" />
				<circle cx={plotted.x} cy={-plotted.y} r={DOT_RADIUS} class="fill-primary" stroke="var(--color-card)" stroke-width="0.15" />
			</svg>
		</button>
		<div class="flex items-center justify-between text-xs text-muted-foreground">
			<span>
				x = <span class="font-medium text-foreground">{x.toFixed(2)}</span>
			</span>
			<span>
				y = <span class="font-medium text-foreground">{y.toFixed(2)}</span>
			</span>
		</div>
	</div>
{:else}
	<div class="flex flex-col gap-3">
		<div class="flex items-center justify-between text-xs text-muted-foreground">
			<span class="font-medium uppercase tracking-[0.2em]">Plano</span>
		</div>
		<div class="relative w-full overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-sm" role="img" aria-label={label}>
			<svg
				bind:this={svgEl}
				viewBox={VIEW_BOX}
				class="size-full"
			>
				<defs>
					<linearGradient id="plane-background" x1="0" x2="0" y1="0" y2="1">
						<stop offset="0%" stop-color="var(--color-secondary)" stop-opacity="0.7" />
						<stop offset="100%" stop-color="var(--color-secondary)" stop-opacity="0.95" />
					</linearGradient>
				</defs>

				<rect x={-VIEW_EXTENT} y={-VIEW_EXTENT} width={VIEW_EXTENT * 2} height={VIEW_EXTENT * 2} fill="url(#plane-background)" />

				<g class="stroke-border/60">
					{#each gridLines as value (value)}
						{#if value !== 0}
							<line x1={value} y1={-RANGE} x2={value} y2={RANGE} stroke-width="0.05" />
							<line x1={-RANGE} y1={-value} x2={RANGE} y2={-value} stroke-width="0.05" />
						{/if}
					{/each}
				</g>

				<g class="stroke-border/90">
					<line x1={0} y1={-RANGE} x2={0} y2={RANGE} stroke-width="0.2" />
					<line x1={-RANGE} y1={0} x2={RANGE} y2={0} stroke-width="0.2" />
				</g>

				<g class="fill-muted-foreground text-[1.5px]">
					{#each majorTicks as tick (tick)}
						{#if tick !== 0}
							<text x={tick} y={-0.8} text-anchor="middle">{tick}</text>
							<text x={0.8} y={-tick} text-anchor="start" alignment-baseline="middle">{tick}</text>
						{/if}
					{/each}
				</g>

				<g class="fill-muted-foreground/80 text-[1.2px]">
					<text x={RANGE - 1.5} y={-1.5} text-anchor="end">x</text>
					<text x={1.5} y={-(RANGE - 1.5)} text-anchor="start">y</text>
				</g>

				<circle cx={plotted.x} cy={-plotted.y} r={DOT_RADIUS * 2} class="fill-primary/20" stroke="var(--color-card)" stroke-width="0.2" />
				<circle cx={plotted.x} cy={-plotted.y} r={DOT_RADIUS} class="fill-primary" stroke="var(--color-card)" stroke-width="0.15" />
			</svg>
		</div>
		<div class="flex items-center justify-between text-xs text-muted-foreground">
			<span>
				x = <span class="font-medium text-foreground">{x.toFixed(2)}</span>
			</span>
			<span>
				y = <span class="font-medium text-foreground">{y.toFixed(2)}</span>
			</span>
		</div>
	</div>
{/if}
