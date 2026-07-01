// Materia: Computación Gráfica Aplicada y Sistemas Generativos.
// alumnos: Martín Nicolás Robles, Angel Matías Ojeda, Iara Maylen Camilletti, Nadia Belén Romero, Ezequiel Rodrigo Rodríguez, Valentina Carancini.
// TP1 Etapa 3: Entrega FInal


// GRILLA -----------------------------------
let gridSize = 5;
// ANILLOS -----------------------------------
let maxRings = 9;
let maxIntensidadSonido = 0;
// SALTOS -----------------------------------
let skipChance = 0.15;
// GROSOR -----------------------------------
let grosorUltimo = 0;
// COLOR -----------------------------------
let colorFondo = 0;
let colorFondoAntes = 0;


// --- Audio ---
let mic;
let audioIniciado = false;
let intensidad = 0;
let gestorAmp;
let AMP_MIN = 0.001;
let AMP_MAX = 0.13;

let umbralRuido = 0.1;
let umbralDuracionSonido = 500;

let haySonido = false;
let antesHabiaSonido = false;
let empezoElSonido = false;
let terminoElSonido = false;

let marcaInicioSonido = 0;
let durSonido = 0;
let sonidoLargo = false;

// --- Frecuencia ---
let notaMidi = 0;
let altura = 0;
let hayPitch = false;
let pitch;
let marcaUltimoPitch = 0;
let timeoutSinPitch = 300;
let gestorFrec;
let NOTA_MIN = 50;
let NOTA_MAX = 55;


// =================================
//              SETUP
// =================================
function setup() {
  createCanvas(700, 750);

  mic = new p5.AudioIn();
  gestorAmp = new GestorSenial(AMP_MIN, AMP_MAX);
  gestorFrec = new GestorSenial(NOTA_MIN, NOTA_MAX);

  loop();
}

// =================================
//              DRAW
// =================================
function draw() {

  // --- Pantalla de inicio ---
  if (!audioIniciado) {
    background(245, 244, 240);
    fill(80);
    textAlign(CENTER, CENTER);
    textSize(20);
    textFont('monospace');
    text("click para comenzar", width / 2, height / 2);
    return;
  }

  // --- Lectura de audio ---
  gestorAmp.actualizar(mic.getLevel());
  intensidad = gestorAmp.filtrada;

  // --- Frecuencia ---
  altura = gestorFrec.filtrada;

  haySonido = intensidad > umbralRuido;
  empezoElSonido = haySonido && !antesHabiaSonido;
  terminoElSonido = !haySonido && antesHabiaSonido;

  // --- Grosor por frecuencia ---
  let grosorFinal = (haySonido && hayPitch)
    ? map(altura, 0, 1, 100, 0)
    : grosorUltimo;

  if (empezoElSonido) {
    marcaInicioSonido = millis();
    sonidoLargo = false;
    colorFondoAntes = colorFondo;
    maxIntensidadSonido = 0;
  }

  if (haySonido) {
    durSonido = millis() - marcaInicioSonido;
    sonidoLargo = durSonido >= umbralDuracionSonido;
    maxIntensidadSonido = max(maxIntensidadSonido, intensidad);
    maxRings = floor(map(maxIntensidadSonido, 0, 1, 3, 12));
  }

  if (haySonido && hayPitch) {
    grosorUltimo = grosorFinal;
  }

  if (terminoElSonido) {
    durSonido = millis() - marcaInicioSonido;

    let fueCorto = durSonido < umbralDuracionSonido;
    if (fueCorto) {
      gridSize = gridSize >= 20 ? 5 : gridSize + 2;
    }
    grosorUltimo = grosorFinal;
    sonidoLargo = false;
  }

  // SONIDO LARGO
  if (sonidoLargo) {
    let delta = map(durSonido, umbralDuracionSonido, 1500, 0, 1 - colorFondoAntes);
    colorFondo = constrain(colorFondoAntes + delta, 0, 1);

    let skipExtra = map(durSonido, umbralDuracionSonido, 6000, 0, 1);
    skipChance = constrain(skipExtra, 0, 0.8);

  } else {
    if (colorFondo > 0) {
      colorFondo -= 0.02;
      if (colorFondo < 0) colorFondo = 0;
    }
  }

  antesHabiaSonido = haySonido;

  randomSeed(99);

  // --- Fondo ---
  let colorBlanco = color(245, 244, 240);
  let colorAmarillo = color(220, 205, 180);
  background(lerpColor(colorBlanco, colorAmarillo, colorFondo));

  // --- Dibujo ---
  let padding = 20;
  let cellSize = (width - padding * 2) / gridSize;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      let cx = padding + col * cellSize + cellSize / 2;
      let cy = padding + row * cellSize + cellSize / 2;
      drawNestedSquares(cx, cy, cellSize * 0.92, maxRings, grosorFinal);
    }
  }
  fill(80);
  noStroke();
}

// =================================
//           FUNCIONES
// =================================

function drawNestedSquares(cx, cy, outerSize, numRings, grosor) {
  let step = (outerSize * 0.45) / numRings;

  let skipProbExterno = 0.15;
  let skipProbInterno = constrain(skipChance * 1, 0, 0.8);

  let skip = new Set();
  for (let r = 0; r < numRings; r++) {
    let skipProb = r === 0 ? skipProbExterno : skipProbInterno * (1 + (r - 1) * 0.2);
    if (random() < skipProb) skip.add(r);
  }

  push();
  translate(cx, cy);
  stroke(40, 32, 37, 255);
  noFill();

  for (let r = 0; r < numRings; r++) {
    if (skip.has(r)) continue;
    let s = outerSize - r * step * 2;
    if (s <= 1) break;
    let minThickness = 1;
    let maxDelta = map(gridSize, 5, 20, 3, 0.8);
    let delta = map(grosor, 0, 100, 0, maxDelta);
    strokeWeight(minThickness + random(0, delta));
    rect(-s / 2, -s / 2, s, s);
  }

  pop();
}

// --- Audio ---
async function iniciarAudio() {
  if (audioIniciado) return;

  try {
    await userStartAudio();
    mic.start(
      () => {
        audioIniciado = true;
        marcaInicioSonido = millis();
        marcaUltimoPitch = millis();
        startPitch();
      },
      (error) => console.error("No se pudo iniciar el micrófono", error)
    );
  } catch (error) {
    console.error("No se pudo habilitar el contexto de audio", error);
  }
}

function mousePressed() {
  iniciarAudio();
}

function touchStarted() {
  iniciarAudio();
  return false;
}

// --- Pitch ---
function startPitch() {
  let model_url = "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/";
  pitch = ml5.pitchDetection(model_url, getAudioContext(), mic.stream, () => {
    getPitch();
  });
}

function getPitch() {
  pitch.getPitch(function (err, frequency) {
    if (err) {
      setTimeout(getPitch, 120);
      return;
    }

    if (frequency) {
      notaMidi = freqToMidi(frequency);
      hayPitch = true;
      marcaUltimoPitch = millis();
      gestorFrec.actualizar(notaMidi);
    } else {
      hayPitch = millis() - marcaUltimoPitch <= timeoutSinPitch;
    }

    getPitch();
  });
}