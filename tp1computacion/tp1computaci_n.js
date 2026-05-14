// --- Parámetros ---
let gridSize   = 14;
let maxRings   = 7;
let skipChance = 0.25;
let grosorVar  = 50;
let maxAngle   = 0;
 
let sliderGrid, sliderRings, sliderSkip, sliderVar, sliderColor, sliderRot;
let cellAngles = [];
let lastGrid   = 0;
 
function setup() {
  createCanvas(700, 750);
  noLoop();
 
  sliderGrid  = createSlider(5, 20, gridSize, 1);
  sliderRings = createSlider(3, 12, maxRings, 1);
  sliderSkip  = createSlider(0, 80, skipChance * 100, 1);
  sliderVar   = createSlider(0, 100, grosorVar, 1);
  sliderColor = createSlider(0, 100, 0, 1);
  sliderRot   = createSlider(0, 45, 0, 1);
 
  for (let s of [sliderGrid, sliderRings, sliderSkip, sliderVar, sliderColor, sliderRot]) {
    s.style('width', '120px');
    s.input(redraw);
  }
 
  generateAngles(gridSize);
}
 
function generateAngles(g) {
  randomSeed(42);
  cellAngles = [];
  for (let i = 0; i < g * g; i++) {
    cellAngles.push(random(-1, 1));
  }
  lastGrid = g;
}
 
function draw() {
  gridSize   = sliderGrid.value();
  maxRings   = sliderRings.value();
  skipChance = sliderSkip.value() / 100;
  grosorVar  = sliderVar.value();
  maxAngle   = sliderRot.value();
 
  if (lastGrid !== gridSize) generateAngles(gridSize);
 
  randomSeed(99);
 
  let colorPorcentaje = sliderColor.value() / 100;
  let colorBlanco     = color(255, 255, 255);
  let colorAmarillo   = color(230, 218, 200);
  background(lerpColor(colorBlanco, colorAmarillo, colorPorcentaje));
 
  const padding  = 20;
  const cellSize = (width - padding * 2) / gridSize;
 
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      let cx    = padding + col * cellSize + cellSize / 2;
      let cy    = padding + row * cellSize + cellSize / 2;
      let idx   = row * gridSize + col;
      let angle = cellAngles[idx] * maxAngle;
      drawNestedSquares(cx, cy, cellSize * 0.92, maxRings, angle);
    }
  }
 
  // Labels
  fill(80);
  noStroke();
  textSize(11);
  textFont('monospace');
  text(`grilla: ${gridSize}×${gridSize}`,  10, height - 15);
  text(`rings: ${maxRings}`,              125, height - 15);
  text(`saltos: ${sliderSkip.value()}%`,  220, height - 15);
  text(`grosor: ${sliderVar.value()}%`,   335, height - 15);
  text(`fondo: ${sliderColor.value()}%`,  450, height - 15);
  text(`rotación: ${maxAngle}°`,          555, height - 15);
}
 
function drawNestedSquares(cx, cy, outerSize, numRings, angleDeg) {
  const step = (outerSize * 0.45) / numRings;
 
  let skip = new Set();
  for (let r = 1; r < numRings; r++) {
    if (random() < skipChance) skip.add(r);
  }
 
  push();
  translate(cx, cy);
  rotate(radians(angleDeg));
  stroke(58, 53, 48, 200);
  noFill();
 
  for (let r = 0; r < numRings; r++) {
    if (skip.has(r)) continue;
    let s = outerSize - r * step * 2;
    if (s <= 1) break;
    let maxThickness = map(grosorVar, 0, 100, 0.5, 12);
    strokeWeight(random(0.5, maxThickness));
    rect(-s / 2, -s / 2, s, s);
  }
 
  pop();
}
