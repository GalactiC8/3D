class Light extends Point {
  constructor(x, y, z, lumen = 1350) {
    super(x, y, z);
    this.lumen = lumen;
  }
}
