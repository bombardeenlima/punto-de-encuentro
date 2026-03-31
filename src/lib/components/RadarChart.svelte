<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';

  let { userProfile, candidates } = $props<{
    userProfile: {
      izquierda_derecha: number;
      liberal_conservador: number;
      sistema_antisistema: number;
      nacionalista_globalista: number;
    };
    candidates: Array<{
      id: string;
      label: string;
      affinity: number;
      position: {
        izquierda_derecha?: number;
        liberal_conservador?: number;
        sistema_antisistema?: number;
        nacionalista_globalista?: number;
      };
    }>;
  }>();

  let canvas: HTMLCanvasElement;
  let chartInstance: Chart | null = null;

  // Los 8 vértices
  const labels = [
    'Izquierda',
    'Liberal',
    'Antisistema',
    'Globalista',
    'Derecha',
    'Conservador',
    'Sistema',
    'Nacionalista'
  ];

  function getRadarData(pos: any) {
    const leftOrRight = pos.izquierda_derecha ?? 0;
    const libOrCon = pos.liberal_conservador ?? 0;
    const sysOrAnti = pos.sistema_antisistema ?? 0;
    const nacOrGlob = pos.nacionalista_globalista ?? 0;

    return [
      Math.max(0, -leftOrRight), // Izquierda (< 0)
      Math.max(0, libOrCon),     // Liberal (> 0)
      Math.max(0, sysOrAnti),    // Antisistema (> 0)
      Math.max(0, nacOrGlob),    // Globalista (> 0)
      Math.max(0, leftOrRight),  // Derecha (> 0)
      Math.max(0, -libOrCon),    // Conservador (< 0)
      Math.max(0, -sysOrAnti),   // Sistema (< 0)
      Math.max(0, -nacOrGlob)    // Nacionalista (< 0)
    ];
  }

  // Generar un color único para cada participante iterando en la rueda de color HSL
  function getColor(index: number, total: number) {
    const hue = (index * (360 / total)) % 360;
    return {
      main: `hsl(${hue}, 80%, 55%)`,
      bg: `hsla(${hue}, 80%, 55%, 0.2)`
    };
  }

  $effect(() => {
    if (!canvas) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    // Preparar datasets
    // 1. Usuario (siempre visible)
    const datasets: any[] = [
      {
        label: 'Tú',
        data: getRadarData(userProfile),
        backgroundColor: 'rgba(59, 130, 246, 0.4)', // Azul claro tailwind
        borderColor: 'rgba(59, 130, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 3,
        hidden: false
      }
    ];

    // Ordenar candidatos por afinidad para saber cuáles son los 3 mejores
    // (Asumimos que candidates.affinity ya viene calculado desde el componente padre, 
    // pero si no, asumimos el orden que envían)
    const sortedCandidates = [...candidates].sort((a, b) => b.affinity - a.affinity);
    const top3Ids = new Set(sortedCandidates.slice(0, 3).map(c => c.id));

    sortedCandidates.forEach((c, index) => {
      const colors = getColor(index, sortedCandidates.length);
      datasets.push({
        label: c.label,
        data: getRadarData(c.position || {}),
        backgroundColor: colors.bg,
        borderColor: colors.main,
        pointBackgroundColor: colors.main,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colors.main,
        borderWidth: 2,
        // Solo mostramos los 3 más afines por defecto
        hidden: !top3Ids.has(c.id)
      });
    });

    chartInstance = new Chart(canvas, {
      type: 'radar',
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 1,
            ticks: {
              display: false,
              stepSize: 0.25
            },
            pointLabels: {
              font: {
                size: 11,
                family: 'system-ui, -apple-system, sans-serif'
              },
  color: '#64748b' // Slate 500
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 13
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return ` ${context.dataset.label}: ${(context.raw as number * 100).toFixed(0)}%`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  });
</script>

<div class="relative h-[500px] w-full mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
  <div class="mb-4 flex flex-col items-center">
    <h3 class="text-xl font-bold">Análisis de Similitud</h3>
    <p class="text-xs text-muted-foreground text-center mt-1 max-w-xl">
      Haz clic en los nombres del partido abajo para ocultar/mostrar su perfil. Por defecto se muestran tus 3 candidatos más afines.
    </p>
  </div>
  <div class="h-[380px] w-full">
    <canvas bind:this={canvas}></canvas>
  </div>
</div>
