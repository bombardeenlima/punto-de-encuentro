<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const RANGE = 32;
	const GRID_STEP = 4;
	const MAJOR_STEP = 8;
	const MARGIN = 1;
	const DOT_RADIUS = 0.55;
	const VIEW_EXTENT = RANGE + MARGIN;
	const MIN_ZOOM = 1;
	const MAX_ZOOM = 12;
	const ZOOM_SENSITIVITY = 0.0015;
	const LEVEL_THRESHOLD = RANGE / 2;

	type SelectDetail = { x: number; y: number };
	type PlanePoint = {
		x: number;
		y: number;
		label?: string;
		isUser?: boolean;
		color?: string;
		id?: string;
		slug?: string;
	};

	type HoveredPoint = {
		point: PlanePoint;
		index: number;
	};

	type KDNode = {
		point: PlanePoint;
		axis: number;
		left: KDNode | null;
		right: KDNode | null;
	};

	type Neighbor = {
		point: PlanePoint;
		dist: number;
	};

	type PointActivateDetail = { point: PlanePoint };
	type HorizontalAlignment = 'left' | 'right';
	type VerticalAlignment = 'authoritarian' | 'libertarian';
	type IntensityLevel = 'high' | 'moderate';
	type QuadrantMessage = {
		heading: string;
		title: string;
		description: string;
	};

	const dispatch = createEventDispatcher<{
		select: SelectDetail;
		pointActivate: PointActivateDetail;
	}>();

	let {
		x = $bindable(0),
		y = $bindable(0),
		points = [] as PlanePoint[],
		interactive = false,
		label = 'Plano cartesiano',
		narrative = $bindable<QuadrantMessage | null>(null),
		singlePointMode = false,
		describedBy = undefined as string | undefined
	} = $props<{
		x?: number;
		y?: number;
		points?: PlanePoint[];
		interactive?: boolean;
		label?: string;
		narrative?: QuadrantMessage | null;
		singlePointMode?: boolean;
		describedBy?: string;
	}>();

	let svgEl = $state<SVGSVGElement | null>(null);
	let hovered = $state<HoveredPoint | null>(null);
	let zoom = $state(1);
	let pan = $state({ x: 0, y: 0 });
	let initialPinchDistance = $state<number | null>(null);
	let initialPinchZoom = $state(1);
	const activePointers = new Map<number, PointerEvent>();

	const viewExtent = $derived.by(() => VIEW_EXTENT / zoom);
	const viewBounds = $derived.by(() => {
		const extent = viewExtent;
		const span = extent * 2;
		const minX = -extent + pan.x;
		const maxX = extent + pan.x;
		const minY = -extent + pan.y;
		const maxY = extent + pan.y;
		return { minX, maxX, minY, maxY, span };
	});
	const axesInView = $derived.by(() => ({
		xAxis: viewBounds.minY <= 0 && viewBounds.maxY >= 0,
		yAxis: viewBounds.minX <= 0 && viewBounds.maxX >= 0
	}));
	const viewBox = $derived.by(
		() => `${viewBounds.minX} ${viewBounds.minY} ${viewBounds.span} ${viewBounds.span}`
	);

	const tooltip = $derived.by(() => {
		if (!hovered || !hovered.point.label) return null;
		const { point } = hovered;
		const { minX, minY, span } = viewBounds;
		const svgY = -point.y;
		const xPercent = ((point.x - minX) / span) * 100;
		const yPercent = ((svgY - minY) / span) * 100;
		return {
			label: point.label,
			x: clampPercent(xPercent),
			y: clampPercent(yPercent),
			isUser: point.isUser ?? false
		};
	});

	const stepScale = $derived.by(() => {
		const exponent = Math.floor(Math.log2(zoom));
		return Math.pow(2, exponent);
	});

	const displayGridStep = $derived.by(() => Math.max(GRID_STEP / stepScale, GRID_STEP / 16));

	const displayMajorStep = $derived.by(() => displayGridStep * (MAJOR_STEP / GRID_STEP));

	const gridLines = $derived.by(() => {
		const step = displayGridStep;
		const vertical: number[] = [];
		const horizontal: number[] = [];
		if (step <= 0) return { vertical, horizontal };
		const { minX, maxX, minY, maxY } = viewBounds;
		const startX = Math.ceil(minX / step) * step;
		for (let value = startX; value <= maxX + step / 2; value += step) {
			vertical.push(Number(value.toFixed(5)));
		}
		if (vertical[0] !== minX) vertical.unshift(minX);
		if (vertical[vertical.length - 1] !== maxX) vertical.push(maxX);
		const startY = Math.ceil(minY / step) * step;
		for (let value = startY; value <= maxY + step / 2; value += step) {
			horizontal.push(Number(value.toFixed(5)));
		}
		if (horizontal[0] !== minY) horizontal.unshift(minY);
		if (horizontal[horizontal.length - 1] !== maxY) horizontal.push(maxY);
		return { vertical, horizontal };
	});

	const majorTicks = $derived.by(() => {
		const step = displayMajorStep;
		const xTicks: number[] = [];
		const yTicks: number[] = [];
		if (step <= 0) return { x: xTicks, y: yTicks };
		const { minX, maxX, minY, maxY } = viewBounds;
		const startX = Math.ceil(minX / step) * step;
		for (let value = startX; value <= maxX + step / 2; value += step) {
			xTicks.push(Number(value.toFixed(5)));
		}
		const startY = Math.ceil(minY / step) * step;
		for (let value = startY; value <= maxY + step / 2; value += step) {
			yTicks.push(Number(value.toFixed(5)));
		}
		return { x: xTicks, y: yTicks };
	});

	const plotted = $derived.by(() => ({
		x: clampCoordinate(x),
		y: clampCoordinate(y)
	}));

	const resolvedPoints = $derived.by(() => {
		const prepared = points.map((point: PlanePoint) => ({
			...point,
			x: clampCoordinate(point.x),
			y: clampCoordinate(point.y)
		}));
		if (!interactive && prepared.length === 0) {
			prepared.push({
				x: plotted.x,
				y: plotted.y,
				label
			});
		}
		return prepared;
	});

	const interactivePoint = $derived.by(() => (interactive ? plotted : null));

	const gridStrokeWidth = $derived.by(() => 0.05 / zoom);
	const axisStrokeWidth = $derived.by(() => 0.2 / zoom);
	const tickFontSize = $derived.by(() => {
		const base = 1.5 / zoom;
		const boost = 1 + 0.2 * Math.log2(Math.max(1, zoom));
		return base * boost;
	});
	const axisFontSize = $derived.by(() => {
		const base = 1.2 / zoom;
		const boost = 1 + 0.15 * Math.log2(Math.max(1, zoom));
		return base * boost;
	});
	const tickLabelOffset = $derived.by(() => Math.max(0.35, 0.8 / zoom));
	const axisLabelOffset = $derived.by(() => Math.max(0.6, 1.5 / zoom));
	const outerDotRadius = $derived.by(() => (DOT_RADIUS * 2) / zoom);
	const innerDotRadius = $derived.by(() => DOT_RADIUS / zoom);
	const outerDotStroke = $derived.by(() => 0.2 / zoom);
	const innerDotStroke = $derived.by(() => 0.15 / zoom);

	const partyPoints = $derived.by(() =>
		singlePointMode ? [] : resolvedPoints.filter((point: PlanePoint) => !point.isUser)
	);
	const kdTree = $derived.by(() => buildKDTree(partyPoints));
	const nearestParties = $derived.by(() => {
		if (!kdTree || partyPoints.length === 0) return [] as { point: PlanePoint; distance: number }[];
		const target = { x: plotted.x, y: plotted.y };
		const neighbors = nearestNeighbors(kdTree, target, 3);
		return neighbors
			.sort((a, b) => a.dist - b.dist)
			.map((entry) => ({ point: entry.point, distance: entry.dist }));
	});

	const displayedPoints = $derived.by(() => {
		if (!singlePointMode) return resolvedPoints;
		const userPoints = resolvedPoints.filter((point: PlanePoint) => point.isUser);
		if (userPoints.length > 0) return userPoints;
		if (resolvedPoints.length > 0) return resolvedPoints.slice(0, 1);
		return [] as PlanePoint[];
	});

	const quadrantMessages: Record<
		HorizontalAlignment,
		Record<VerticalAlignment, Record<IntensityLevel, Record<IntensityLevel, QuadrantMessage>>>
	> = {
		left: {
			authoritarian: {
				high: {
					high: {
						heading: 'Izquierda Autoritaria',
						title: 'Alto colectivismo y alto control',
						description:
							'Sistemas de planificación económica centralizada con fuerte centralización política.'
					},
					moderate: {
						heading: 'Izquierda Autoritaria',
						title: 'Alto colectivismo y control moderado',
						description: 'Economías planificadas con cierta apertura a espacios de participación.'
					}
				},
				moderate: {
					high: {
						heading: 'Izquierda Autoritaria',
						title: 'Colectivismo moderado y alto control',
						description:
							'Modelos que priorizan el papel del Estado en la economía junto con un fuerte control social.'
					},
					moderate: {
						heading: 'Izquierda Autoritaria',
						title: 'Colectivismo moderado y control moderado',
						description:
							'Esquemas de economía mixta con énfasis en el Estado y un marco político menos abierto.'
					}
				}
			},
			libertarian: {
				high: {
					high: {
						heading: 'Izquierda Libertaria',
						title: 'Alto colectivismo y alta libertad',
						description:
							'Propuestas de organización comunitaria sin estructuras jerárquicas fuertes.'
					},
					moderate: {
						heading: 'Izquierda Libertaria',
						title: 'Alto colectivismo y libertad moderada',
						description: 'Descentralización cooperativa con cierto grado de normas compartidas.'
					}
				},
				moderate: {
					high: {
						heading: 'Izquierda Libertaria',
						title: 'Colectivismo moderado y alta libertad',
						description: 'Modelos de democracia plural con un Estado activo en la redistribución.'
					},
					moderate: {
						heading: 'Izquierda Libertaria',
						title: 'Colectivismo moderado y libertad moderada',
						description:
							'Sistemas progresistas con Estado de bienestar, dentro de marcos institucionales amplios.'
					}
				}
			}
		},
		right: {
			authoritarian: {
				high: {
					high: {
						heading: 'Derecha Autoritaria',
						title: 'Alto mercado y alto control',
						description: 'Liberalización económica combinada con fuerte centralización política.'
					},
					moderate: {
						heading: 'Derecha Autoritaria',
						title: 'Alto mercado y control moderado',
						description:
							'Economías abiertas con gobiernos de orientación tecnocrática y limitada pluralidad política.'
					}
				},
				moderate: {
					high: {
						heading: 'Derecha Autoritaria',
						title: 'Mercado moderado y alto control',
						description:
							'Políticas económicas mixtas con instituciones sociales y culturales restrictivas.'
					},
					moderate: {
						heading: 'Derecha Autoritaria',
						title: 'Mercado moderado y control moderado',
						description:
							'Economías con participación estatal selectiva y sistemas políticos con menor apertura.'
					}
				}
			},
			libertarian: {
				high: {
					high: {
						heading: 'Derecha Libertaria',
						title: 'Alto mercado y alta libertad',
						description:
							'Economías totalmente liberalizadas y con énfasis en la autonomía individual.'
					},
					moderate: {
						heading: 'Derecha Libertaria',
						title: 'Alto mercado y libertad moderada',
						description: 'Predominio del mercado con un Estado reducido a funciones mínimas.'
					}
				},
				moderate: {
					high: {
						heading: 'Derecha Libertaria',
						title: 'Mercado moderado y alta libertad',
						description:
							'Economías de mercado con regulación limitada y fuerte protección de libertades civiles.'
					},
					moderate: {
						heading: 'Derecha Libertaria',
						title: 'Mercado moderado y libertad moderada',
						description:
							'Sistemas de mercado con intervención moderada y un marco institucional liberal.'
					}
				}
			}
		}
	};
	$effect(() => {
		const horizontal: HorizontalAlignment = plotted.x <= 0 ? 'left' : 'right';
		const vertical: VerticalAlignment = plotted.y >= 0 ? 'authoritarian' : 'libertarian';
		const economicIntensity: IntensityLevel =
			Math.abs(plotted.x) >= LEVEL_THRESHOLD ? 'high' : 'moderate';
		const libertyIntensity: IntensityLevel =
			Math.abs(plotted.y) >= LEVEL_THRESHOLD ? 'high' : 'moderate';
		narrative = quadrantMessages[horizontal][vertical][economicIntensity][libertyIntensity];
	});

	export { narrative };

	function clampCoordinate(value: number) {
		const rounded = Math.round(value * 100) / 100;
		return Math.max(-RANGE, Math.min(RANGE, rounded));
	}

	function clampPercent(value: number) {
		return Math.min(95, Math.max(5, value));
	}

	function buildKDTree(points: PlanePoint[], depth = 0): KDNode | null {
		if (points.length === 0) return null;
		const axis = depth % 2;
		const sorted = [...points].sort((a, b) => (axis === 0 ? a.x - b.x : a.y - b.y));
		const median = Math.floor(sorted.length / 2);
		return {
			point: sorted[median],
			axis,
			left: buildKDTree(sorted.slice(0, median), depth + 1),
			right: buildKDTree(sorted.slice(median + 1), depth + 1)
		};
	}

	function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
		return Math.hypot(a.x - b.x, a.y - b.y);
	}

	function updateBestNeighbors(best: Neighbor[], candidate: Neighbor, k: number) {
		const existingIndex = best.findIndex((entry) => entry.point === candidate.point);
		if (existingIndex !== -1) {
			if (candidate.dist < best[existingIndex].dist) {
				best[existingIndex] = candidate;
			}
		} else {
			best.push(candidate);
		}
		best.sort((a, b) => a.dist - b.dist);
		if (best.length > k) best.length = k;
		return best;
	}

	function nearestNeighbors(
		node: KDNode | null,
		target: { x: number; y: number },
		k: number,
		best: Neighbor[] = []
	) {
		if (!node) return best;
		const dist = distance(target, node.point);
		best = updateBestNeighbors(best, { point: node.point, dist }, k);
		const diff = node.axis === 0 ? target.x - node.point.x : target.y - node.point.y;
		const primary = diff < 0 ? node.left : node.right;
		const secondary = diff < 0 ? node.right : node.left;
		best = nearestNeighbors(primary, target, k, best);
		const threshold = best.length === k ? best[best.length - 1].dist : Infinity;
		if (Math.abs(diff) < threshold || best.length < k) {
			best = nearestNeighbors(secondary, target, k, best);
		}
		return best;
	}

	function formatDistance(value: number) {
		return `${value.toFixed(2)} u.`;
	}

	function normalisePointer(event: MouseEvent | PointerEvent) {
		if (!svgEl) return null;
		const rect = svgEl.getBoundingClientRect();
		const px = event.clientX - rect.left;
		const py = event.clientY - rect.top;
		if (rect.width === 0 || rect.height === 0) return null;
		const span = viewBounds.span;
		const svgX = viewBounds.minX + (px / rect.width) * span;
		const svgY = viewBounds.minY + (py / rect.height) * span;
		return { x: clampCoordinate(svgX), y: clampCoordinate(-svgY) } as const;
	}

	function handlePointer(event: MouseEvent) {
		if (!interactive) return;
		const point = normalisePointer(event);
		if (!point) return;
		x = point.x;
		y = point.y;
		dispatch('select', point);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!interactive) return;
		const step = event.shiftKey ? 4 : 1;
		let handled = true;
		switch (event.key) {
			case 'ArrowUp':
				y = clampCoordinate(y + step);
				break;
			case 'ArrowDown':
				y = clampCoordinate(y - step);
				break;
			case 'ArrowRight':
				x = clampCoordinate(x + step);
				break;
			case 'ArrowLeft':
				x = clampCoordinate(x - step);
				break;
			default:
				handled = false;
		}
		if (handled) {
			event.preventDefault();
			dispatch('select', { x, y });
		}
	}

	function getPointColor(point: PlanePoint) {
		if (point.color) return point.color;
		return point.isUser ? 'var(--color-destructive)' : 'var(--color-primary)';
	}

	function getPointKey(point: PlanePoint, index: number) {
		if (point.id) return point.id;
		if (point.label) return `${point.label}-${index}`;
		return `point-${index}`;
	}

	function showHover(point: PlanePoint, index: number) {
		hovered = { point, index };
	}

	function clearHover() {
		hovered = null;
	}

	function handlePointActivate(point: PlanePoint) {
		if (point.isUser) return;
		dispatch('pointActivate', { point });
	}

	let lastClick = $state<{ key: string; time: number } | null>(null);

	function handlePointClick(point: PlanePoint, key: string) {
		if (point.isUser) return;
		const now = Date.now();
		if (lastClick && lastClick.key === key && now - lastClick.time <= 500) {
			handlePointActivate(point);
			lastClick = null;
			return;
		}
		lastClick = { key, time: now };
	}

	type ZoomFocus = {
		fx: number;
		fy: number;
		svgX: number;
		svgY: number;
	};

	function clampZoom(value: number) {
		return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
	}

	function clampPan(value: { x: number; y: number }, currentZoom = zoom) {
		const extent = VIEW_EXTENT / currentZoom;
		const lowerBound = -RANGE + extent;
		const upperBound = RANGE - extent;
		const clampValue = (coordinate: number) => {
			if (lowerBound > upperBound) return 0;
			return Math.max(lowerBound, Math.min(upperBound, coordinate));
		};
		return { x: clampValue(value.x), y: clampValue(value.y) };
	}

	function getZoomFocus(clientX: number, clientY: number): ZoomFocus | null {
		if (!svgEl) return null;
		const rect = svgEl.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) return null;
		const rawFx = (clientX - rect.left) / rect.width;
		const rawFy = (clientY - rect.top) / rect.height;
		const fx = rawFx;
		const fy = rawFy;
		const span = viewBounds.span;
		const svgX = viewBounds.minX + fx * span;
		const svgY = viewBounds.minY + fy * span;
		return { fx, fy, svgX, svgY };
	}

	function updateZoom(nextZoom: number, focus?: ZoomFocus | null) {
		const clampedZoom = clampZoom(nextZoom);
		if (clampedZoom === zoom) return;
		if (focus) {
			const newExtent = VIEW_EXTENT / clampedZoom;
			const newSpan = newExtent * 2;
			const minX = focus.svgX - focus.fx * newSpan;
			const minY = focus.svgY - focus.fy * newSpan;
			const desiredPan = {
				x: minX + newExtent,
				y: minY + newExtent
			};
			pan = clampPan(desiredPan, clampedZoom);
		} else {
			pan = clampPan(pan, clampedZoom);
		}
		zoom = clampedZoom;
	}

	function handleWheel(event: WheelEvent) {
		if (!svgEl) return;
		event.preventDefault();
		const factor = Math.exp(-event.deltaY * ZOOM_SENSITIVITY);
		const focus = getZoomFocus(event.clientX, event.clientY);
		updateZoom(zoom * factor, focus);
	}

	function handlePointerDown(event: PointerEvent) {
		if (event.pointerType === 'mouse' && event.button !== 0) return;
		if (event.pointerType === 'touch') {
			event.preventDefault();
		}
		if (svgEl) svgEl.setPointerCapture(event.pointerId);
		activePointers.set(event.pointerId, event);
		if (activePointers.size === 2) {
			const pointers = Array.from(activePointers.values());
			initialPinchDistance = getDistance(pointers[0], pointers[1]);
			initialPinchZoom = zoom;
		}
	}

	function handlePointerMove(event: PointerEvent) {
		if (!activePointers.has(event.pointerId)) return;
		if (event.pointerType === 'touch') {
			event.preventDefault();
		}
		const previous = activePointers.get(event.pointerId);
		if (!previous) return;
		activePointers.set(event.pointerId, event);
		if (activePointers.size === 1) {
			applyPanDelta(previous, event);
		}
		if (activePointers.size === 2 && initialPinchDistance) {
			const pointers = Array.from(activePointers.values());
			const currentDistance = getDistance(pointers[0], pointers[1]);
			if (initialPinchDistance > 0) {
				const factor = currentDistance / initialPinchDistance;
				const midClientX = (pointers[0].clientX + pointers[1].clientX) / 2;
				const midClientY = (pointers[0].clientY + pointers[1].clientY) / 2;
				const focus = getZoomFocus(midClientX, midClientY);
				updateZoom(initialPinchZoom * factor, focus);
			}
		}
	}

	function handlePointerUp(event: PointerEvent) {
		if (svgEl && svgEl.hasPointerCapture(event.pointerId)) {
			svgEl.releasePointerCapture(event.pointerId);
		}
		activePointers.delete(event.pointerId);
		if (activePointers.size < 2) {
			initialPinchDistance = null;
			initialPinchZoom = zoom;
		}
	}

	function handlePointerCancel(event: PointerEvent) {
		if (svgEl && svgEl.hasPointerCapture(event.pointerId)) {
			svgEl.releasePointerCapture(event.pointerId);
		}
		activePointers.delete(event.pointerId);
		if (activePointers.size < 2) {
			initialPinchDistance = null;
			initialPinchZoom = zoom;
		}
	}

	function getDistance(a: PointerEvent, b: PointerEvent) {
		const dx = a.clientX - b.clientX;
		const dy = a.clientY - b.clientY;
		return Math.hypot(dx, dy);
	}

	function applyPanDelta(previous: PointerEvent, current: PointerEvent) {
		if (!svgEl) return;
		const rect = svgEl.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) return;
		const span = viewBounds.span;
		const dxWorld = ((current.clientX - previous.clientX) / rect.width) * span;
		const dyWorld = ((current.clientY - previous.clientY) / rect.height) * span;
		if (dxWorld === 0 && dyWorld === 0) return;
		pan = clampPan({
			x: pan.x - dxWorld,
			y: pan.y - dyWorld
		});
	}

	function formatTick(value: number) {
		const rounded = Math.abs(value) < 1e-6 ? 0 : value;
		if (Number.isInteger(rounded)) return rounded.toString();
		return rounded.toFixed(2).replace(/\.0+$/, '').replace(/0+$/, '');
	}
	const wrapperBaseClass =
		'relative w-full overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-sm';
	const interactiveWrapperClass = `${wrapperBaseClass} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`;
</script>

<div class="flex flex-col gap-3">
	{#if interactive}
		<div class="flex items-center justify-between text-xs text-muted-foreground">
			<span class="font-medium">Plano </span>
			<span class="rounded-full bg-muted px-2 py-0.5 text-[10px]">Click o flechas para mover</span>
		</div>
		<button
			type="button"
			class={interactiveWrapperClass}
			aria-label={label}
			aria-describedby={describedBy}
			onclick={handlePointer}
			onkeydown={handleKeyDown}
		>
			<svg
				bind:this={svgEl}
				{viewBox}
				class="size-full"
				onwheel={handleWheel}
				onpointerdown={handlePointerDown}
				onpointermove={handlePointerMove}
				onpointerup={handlePointerUp}
				onpointercancel={handlePointerCancel}
			>
				<defs>
					<linearGradient id="plane-background" x1="0" x2="0" y1="0" y2="1">
						<stop offset="0%" stop-color="var(--color-secondary)" stop-opacity="0.7" />
						<stop offset="100%" stop-color="var(--color-secondary)" stop-opacity="0.95" />
					</linearGradient>
				</defs>

				<rect
					x={viewBounds.minX}
					y={viewBounds.minY}
					width={viewBounds.span}
					height={viewBounds.span}
					fill="url(#plane-background)"
				/>

				<g class="stroke-border/60">
					{#each gridLines.vertical as value (value)}
						{#if Math.abs(value) > 1e-6}
							<line
								x1={value}
								y1={-viewBounds.maxY}
								x2={value}
								y2={-viewBounds.minY}
								stroke-width={gridStrokeWidth}
							/>
						{/if}
					{/each}
					{#each gridLines.horizontal as value (value)}
						{#if Math.abs(value) > 1e-6}
							<line
								x1={viewBounds.minX}
								y1={-value}
								x2={viewBounds.maxX}
								y2={-value}
								stroke-width={gridStrokeWidth}
							/>
						{/if}
					{/each}
				</g>

				<g class="stroke-border/90">
					{#if axesInView.yAxis}
						<line
							x1={0}
							y1={-viewBounds.maxY}
							x2={0}
							y2={-viewBounds.minY}
							stroke-width={axisStrokeWidth}
						/>
					{/if}
					{#if axesInView.xAxis}
						<line
							x1={viewBounds.minX}
							y1={0}
							x2={viewBounds.maxX}
							y2={0}
							stroke-width={axisStrokeWidth}
						/>
					{/if}
				</g>

				{#if axesInView.yAxis}
					<g class="fill-muted-foreground" font-size={tickFontSize}>
						{#each majorTicks.x as tick (tick)}
							{#if Math.abs(tick) > 1e-6}
								<text x={tick} y={-tickLabelOffset} text-anchor="middle">{formatTick(tick)}</text>
							{/if}
						{/each}
					</g>
				{/if}

				{#if axesInView.xAxis}
					<g class="fill-muted-foreground" font-size={tickFontSize}>
						{#each majorTicks.y as tick (tick)}
							{#if Math.abs(tick) > 1e-6}
								<text x={tickLabelOffset} y={-tick} text-anchor="start" alignment-baseline="middle"
									>{formatTick(tick)}</text
								>
							{/if}
						{/each}
					</g>
				{/if}

				<g class="fill-muted-foreground/80" font-size={axisFontSize}>
					{#if axesInView.yAxis}
						<text x={viewBounds.maxX - axisLabelOffset} y={-axisLabelOffset} text-anchor="end"
							>x</text
						>
					{/if}
					{#if axesInView.xAxis}
						<text x={axisLabelOffset} y={-(viewBounds.maxY - axisLabelOffset)} text-anchor="start"
							>y</text
						>
					{/if}
				</g>

				<g>
					{#each displayedPoints as point, index (getPointKey(point, index))}
						{@const pointKey = getPointKey(point, index)}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<g
							role="presentation"
							onmouseenter={() => showHover(point, index)}
							onmouseleave={clearHover}
							onclick={() => handlePointClick(point, pointKey)}
						>
							{#if point.label}
								<title>{point.label}</title>
							{/if}
							<circle
								cx={point.x}
								cy={-point.y}
								r={outerDotRadius}
								stroke="var(--color-card)"
								stroke-width={outerDotStroke}
								style={`fill: ${getPointColor(point)};`}
								fill-opacity="0.2"
							/>
							<circle
								cx={point.x}
								cy={-point.y}
								r={innerDotRadius}
								stroke="var(--color-card)"
								stroke-width={innerDotStroke}
								style={`fill: ${getPointColor(point)};`}
							/>
						</g>
					{/each}
				</g>

				{#if interactivePoint}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<g
						role="presentation"
						onmouseenter={() => showHover({ ...interactivePoint, label }, displayedPoints.length)}
						onmouseleave={clearHover}
					>
						<title>{label}</title>
						<circle
							cx={interactivePoint.x}
							cy={-interactivePoint.y}
							r={outerDotRadius}
							stroke="var(--color-card)"
							stroke-width={outerDotStroke}
							style="fill: var(--color-primary);"
							fill-opacity="0.2"
						/>
						<circle
							cx={interactivePoint.x}
							cy={-interactivePoint.y}
							r={innerDotRadius}
							stroke="var(--color-card)"
							stroke-width={innerDotStroke}
							style="fill: var(--color-primary);"
						/>
					</g>
				{/if}
			</svg>
			{#if tooltip}
				<div
					class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border/70 bg-card/95 px-2 py-1 text-[11px] font-medium text-foreground shadow-sm"
					style={`left: ${tooltip.x}%; top: ${tooltip.y}%;`}
				>
					{tooltip.label}
				</div>
			{/if}
		</button>
	{:else}
		<div class={wrapperBaseClass} role="img" aria-label={label} aria-describedby={describedBy}>
			<svg
				bind:this={svgEl}
				{viewBox}
				class="size-full"
				onwheel={handleWheel}
				onpointerdown={handlePointerDown}
				onpointermove={handlePointerMove}
				onpointerup={handlePointerUp}
				onpointercancel={handlePointerCancel}
			>
				<defs>
					<linearGradient id="plane-background" x1="0" x2="0" y1="0" y2="1">
						<stop offset="0%" stop-color="var(--color-secondary)" stop-opacity="0.7" />
						<stop offset="100%" stop-color="var(--color-secondary)" stop-opacity="0.95" />
					</linearGradient>
				</defs>

				<rect
					x={viewBounds.minX}
					y={viewBounds.minY}
					width={viewBounds.span}
					height={viewBounds.span}
					fill="url(#plane-background)"
				/>

				<g class="stroke-border/60">
					{#each gridLines.vertical as value (value)}
						{#if Math.abs(value) > 1e-6}
							<line
								x1={value}
								y1={-viewBounds.maxY}
								x2={value}
								y2={-viewBounds.minY}
								stroke-width={gridStrokeWidth}
							/>
						{/if}
					{/each}
					{#each gridLines.horizontal as value (value)}
						{#if Math.abs(value) > 1e-6}
							<line
								x1={viewBounds.minX}
								y1={-value}
								x2={viewBounds.maxX}
								y2={-value}
								stroke-width={gridStrokeWidth}
							/>
						{/if}
					{/each}
				</g>

				<g class="stroke-border/90">
					{#if axesInView.yAxis}
						<line
							x1={0}
							y1={-viewBounds.maxY}
							x2={0}
							y2={-viewBounds.minY}
							stroke-width={axisStrokeWidth}
						/>
					{/if}
					{#if axesInView.xAxis}
						<line
							x1={viewBounds.minX}
							y1={0}
							x2={viewBounds.maxX}
							y2={0}
							stroke-width={axisStrokeWidth}
						/>
					{/if}
				</g>

				{#if axesInView.yAxis}
					<g class="fill-muted-foreground" font-size={tickFontSize}>
						{#each majorTicks.x as tick (tick)}
							{#if Math.abs(tick) > 1e-6}
								<text x={tick} y={-tickLabelOffset} text-anchor="middle">{formatTick(tick)}</text>
							{/if}
						{/each}
					</g>
				{/if}

				{#if axesInView.xAxis}
					<g class="fill-muted-foreground" font-size={tickFontSize}>
						{#each majorTicks.y as tick (tick)}
							{#if Math.abs(tick) > 1e-6}
								<text x={tickLabelOffset} y={-tick} text-anchor="start" alignment-baseline="middle"
									>{formatTick(tick)}</text
								>
							{/if}
						{/each}
					</g>
				{/if}

				<g class="fill-muted-foreground/80" font-size={axisFontSize}>
					{#if axesInView.yAxis}
						<text x={viewBounds.maxX - axisLabelOffset} y={-axisLabelOffset} text-anchor="end"
							>x</text
						>
					{/if}
					{#if axesInView.xAxis}
						<text x={axisLabelOffset} y={-(viewBounds.maxY - axisLabelOffset)} text-anchor="start"
							>y</text
						>
					{/if}
				</g>

				{#each displayedPoints as point, index (getPointKey(point, index))}
					{@const pointKey = getPointKey(point, index)}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<g
						role="presentation"
						onmouseenter={() => showHover(point, index)}
						onmouseleave={clearHover}
						onclick={() => handlePointClick(point, pointKey)}
					>
						{#if point.label}
							<title>{point.label}</title>
						{/if}
						<circle
							cx={point.x}
							cy={-point.y}
							r={outerDotRadius}
							stroke="var(--color-card)"
							stroke-width={outerDotStroke}
							style={`fill: ${getPointColor(point)};`}
							fill-opacity="0.2"
						/>
						<circle
							cx={point.x}
							cy={-point.y}
							r={innerDotRadius}
							stroke="var(--color-card)"
							stroke-width={innerDotStroke}
							style={`fill: ${getPointColor(point)};`}
						/>
					</g>
				{/each}
			</svg>
			{#if tooltip}
				<div
					class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border/70 bg-card/95 px-2 py-1 text-[11px] font-medium text-foreground shadow-sm"
					style={`left: ${tooltip.x}%; top: ${tooltip.y}%;`}
				>
					{tooltip.label}
				</div>
			{/if}
		</div>
	{/if}
	{#if !singlePointMode && nearestParties.length > 0}
		<div class="rounded-2xl border border-border/70 bg-card/80 p-3 text-xs text-muted-foreground">
			<span class="mb-2 block font-medium text-foreground">Partidos más cercanos</span>
			<ul class="space-y-1">
				{#each nearestParties as party, index}
					{@const slug = party.point.slug ?? null}
					<li class="flex items-center justify-between">
						{#if slug}
							<a class="text-foreground transition hover:text-primary" href={`/perfiles/${slug}`}>
								{index + 1}. {party.point.label ?? 'Sin nombre'}
							</a>
						{:else}
							<span class="text-foreground">{index + 1}. {party.point.label ?? 'Sin nombre'}</span>
						{/if}
						<span>{formatDistance(party.distance)}</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
