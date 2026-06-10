class GestorSenial {
  constructor(minimo_, maximo_) {
    this.minimo = minimo_;
    this.maximo = maximo_;
    this.filtrada = 0;
    this.f = 0.80;
  }

  actualizar(entrada_) {
    let mapeada = map(entrada_, this.minimo, this.maximo, 0.0, 1.0);
    mapeada = constrain(mapeada, 0.0, 1.0);
    this.filtrada = this.filtrada * this.f + mapeada * (1 - this.f);
  }
}