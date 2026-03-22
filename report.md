# Cálculo de Cercanía y Afinidad

Este documento explica detalladamente cómo se calcula el nivel de "cercanía" o "afinidad" (en porcentaje) entre un usuario y un candidato basándose en el modelo de evaluación implementado en el sistema (`src/lib/calculo.ts`).

## 1. Modelo Espacial (4 Dimensiones)

Para poder correlacionar ideologías, el sistema parametriza y sitúa a cada persona dentro de un plano hiperespacial compuesto de 4 dimensiones, donde cada dimensión representa un eje temático separado:
1. `liberal_conservador`
2. `izquierda_derecha`
3. `sistema_antisistema`
4. `nacionalista_globalista`

Debido a la fórmula de normalización de las preguntas, un perfil (ya sea una persona respondiendo o la base de datos de un candidato preconfigurado) siempre obtiene una coordenada o puntuación específica que **oscila entre `-1.0` y `+1.0`** en cada uno de estos ejes.

## 2. Cálculo de la Distancia Euclidiana

Para determinar qué tan "lejos" o "cerca" están diametralmente dos posturas dadas, el sistema recurre a la fórmula clásica de la **Distancia Euclidiana**, que evalúa distancias directas entre dos puntos en un espacio multidimensional.

La formulación matemática es:
$$d = \sqrt{ \sum_{i=1}^{n} (p1_i - p2_i)^2 }$$

A nivel de código (`calculateEuclideanDistance`), se evalúan las diferencias lineales por eje, se eleva cada diferencia al cuadrado, se acumula la sumatoria de las 4 diferencias cuadráticas, y por último se saca su raíz matemática.

## 3. Determinación de la Distancia Máxima (`MAX_DISTANCE`)

Dado que las coordenadas de cada persona están rígidamente confinadas de `-1.0` a `+1.0`, existe un límite geométrico sobre qué tan separadas pueden llegar a estar dos personas como máximo teórico.

Esta situación se alcanza si un perfil se encuentra en el vértice `[-1, -1, -1, -1]` y su antítesis exacta ideológica es diametralmente contraria en `[1, 1, 1, 1]`.

Realizando el cálculo del máximo alejamiento:
- En cada eje, la distancia máxima posible al cuadrado es: $(1 - (-1))^2 = (2)^2 = 4$
- Dado que existen 4 ejes independientes, la suma total de esas diferencias cuadráticas es: $4 \times 4 = 16$
- La distancia euclidiana teórica máxima es la raíz cuadrada del total: $\sqrt{16} = 4$

Por ende, el código define la constante matemática límite del espectro espacial como:
`const MAX_DISTANCE = 4;`

## 4. Obtención del Porcentaje de Afinidad

Como la "Distancia Euclidiana" (que va de 0 a 4) no es una escala transparente para el usuario promedio, el sistema (`calculateAffinityPercentage`) transforma este nivel de distancia a un porcentaje de afinidad pura (de `100%` a `0%`).

La fórmula final del sistema es:
$$ \text{Afinidad} = \left( 1 - \frac{\min(\text{Distancia Euclidiana}, \text{MAX\_DISTANCE})}{\text{MAX\_DISTANCE}} \right) \times 100 $$

Esta proyección inversamente proporcional estipula un nivel de precisión tal que:
- **Distancia de 0 (Posición idéntica):** Afinidad del $100\%$
- **Distancia de 2 (Posición ortogonal/intermedia):** Afinidad del $50\%$
- **Distancia de 4 o más (Posición totalmente opuesta):** Afinidad del $0\%$

El algoritmo acorta además cualquier leve desviación decimal y redondea el valor (`Math.round()`) para dotar a la interfaz de porcentajes comprensibles y exactos (ej. `83%`).
