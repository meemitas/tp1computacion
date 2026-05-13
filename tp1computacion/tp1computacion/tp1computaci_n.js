// --- Parámetros ---
let gridSize   = 14;   // cuántas celdas por lado
let maxRings   = 7;    // máximo de cuadrados por celda
let skipChance = 0.25; // probabilidad de que un ring se salte (0 a 1)
let grosorVar  = 50;   // variación aleatoria de grosor (0 a 100)
// Sliders p5
let sliderGrid, sliderRings, sliderSkip, sliderVar, sliderColor;


function setup() {
  createCanvas(700, 750);
  noLoop(); // solo dibuja cuando algo cambia

  // Crear sliders
  sliderGrid  = createSlider(5, 20, gridSize, 1);
  sliderRings = createSlider(3, 12, maxRings, 1);
  sliderSkip  = createSlider(0, 80, skipChance * 100, 1);
  sliderVar   = createSlider(0, 100, grosorVar, 1);
  sliderColor = createSlider(0, 100, 0, 1);
  // Redibujar al mover cualquier slider
  for (let s of [sliderGrid, sliderRings, sliderSkip, sliderVar, sliderColor]) {
    s.input(redraw);
  }

  // Estilo de los sliders (opcional, puramente CSS)
  for (let s of [sliderGrid, sliderRings, sliderSkip, sliderVar, sliderColor]) {
    s.style('width', '120px');
  }
}


function draw() {
  // Leer valores actuales
  gridSize   = sliderGrid.value();
  maxRings   = sliderRings.value();
  skipChance = sliderSkip.value() / 100;
  grosorVar  = sliderVar.value();

// Mezcla de blanco a amarillento según la barra
  let colorPorcentaje = sliderColor.value() / 100;
  let colorBlanco = color(255, 255, 255);
  let colorAmarillo = color(230, 218, 200); // Tono amarillento/pergamino
  background(lerpColor(colorBlanco, colorAmarillo, colorPorcentaje));

  const padding  = 20;
  const cellSize = (width - padding * 2) / gridSize;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      let cx = padding + col * cellSize + cellSize / 2;
      let cy = padding + row * cellSize + cellSize / 2;
      drawNestedSquares(cx, cy, cellSize * 0.92, maxRings);
    }
  }

  // Labels
  fill(80);
  noStroke();
  textSize(11);
  textFont('monospace');
  text(`grilla: ${gridSize}×${gridSize}`, 10, height + 18);
  text(`rings: ${maxRings}`,              160, height + 18);
  text(`saltos: ${sliderSkip.value()}%`,  280, height + 18);
  text(`grosor: ${sliderVar.value()}%`,    400, height + 18);
  text(`fondo: ${sliderColor.value()}%`, 520, height + 18);
}

function drawNestedSquares(cx, cy, outerSize, numRings) {
  const step = (outerSize * 0.45) / numRings;

  // Decidir qué rings saltear (el exterior, r=0, siempre se dibuja)
  let skip = new Set();
  for (let r = 1; r < numRings; r++) {
    if (random() < skipChance) skip.add(r);
  }

  let offsetX = 0;
  let offsetY = 0;

  stroke(58, 53, 48, 200); // marrón oscuro semitransparente
  strokeWeight(0.7);
  noFill();

  for (let r = 0; r < numRings; r++) {
    if (skip.has(r)) continue;

    let s = outerSize - r * step * 2;
    if (s <= 1) break;

// Mapear el valor del slider a un grosor máximo (de 0.5 a 12)
    let maxThickness = map(grosorVar, 0, 100, 0.5, 12);
    
    // Asignar grosor aleatorio a este cuadrado
    let currentWeight = random(0.5, maxThickness);
    strokeWeight(currentWeight);

    // Dibujar el cuadrado sin offset
    rect(cx - s / 2, cy - s / 2, s, s);
  }
}
