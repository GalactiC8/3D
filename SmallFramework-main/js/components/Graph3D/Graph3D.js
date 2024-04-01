window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

class Graph3D extends Component {
  constructor(options) {
    super(options);
    this.WIN = {
      LEFT: -10,
      BOTTOM: -10,
      WIDTH: 20,
      HEIGHT: 20,
      CENTER: new Point(0, 0, -30),
      CAMERA: new Point(0, 0, -50),
    };

    this.graph = new Graph({
      id: "canvas3D",
      width: 825,
      height: 825,
      WIN: this.WIN,
      callbacks: {
        wheel: (event) => this.wheel(event),
        mousemove: (event) => this.mousemove(event),
        mouseup: () => this.mouseup(),
        mousedown: () => this.mousedown(),
      },
    });
    this.math3D = new Math3D({ WIN: this.WIN });
    this.surfaces = new Surfaces();
    this.LIGHT = new Light(-40, 15, 0, 1500);

    this.scene = this.SolarSystem();

    this.dx = 0;
    this.dy = 0;

    this.canMove = false;
    this.drawPoints = true;
    this.drawEdges = true;
    this.drawPolygons = true;

    this.colorPoints = "#2E3234";
    this.colorEdges = "#2E3234";
    this.colorPolygons = { r: 173, g: 216, b: 230 };

    this.sizePoints = 0.5;
    this.sizeEdges = 0.2;

    setInterval(() => {
      this.scene.forEach((surface) => surface.doAnimation(this.math3D));
    }, 50);

    let FPS = 0;
    let countFPS = 0;
    let timestamp = Date.now();

    const renderLoop = () => {
      countFPS++;
      const currentTimestamp = Date.now();
      if (currentTimestamp - timestamp >= 1000) {
        FPS = countFPS;
        countFPS = 0;
        timestamp = currentTimestamp;
      }

      this.renderScene(FPS);
      requestAnimFrame(renderLoop);
    };
    renderLoop();
  }

  mouseup() {
    this.canMove = false;
  }

  mousedown() {
    this.canMove = true;
  }

  wheel(event) {
    event.preventDefault();
    const delta = event.wheelDelta > 0 ? 0.9 : 1.1;
    const matrix = this.math3D.zoom(delta);
    this.scene.forEach((surface) =>
      surface.points.forEach((point) => this.math3D.transform(matrix, point))
    );
  }

  mousemove(event) {
    if (this.canMove) {
      const alpha = Math.PI / 180 / 4;
      const matrix1 = this.math3D.rotateOx((this.dy - event.offsetY) * alpha);
      const matrix2 = this.math3D.rotateOy((this.dx - event.offsetX) * alpha);
      const matrix = this.math3D.getTransform(matrix1, matrix2);
      this.scene.forEach((surface) =>
        surface.points.forEach((point) => this.math3D.transform(matrix, point))
      );
    }
    this.dx = event.offsetX;
    this.dy = event.offsetY;
  }

  addEventListeners() {
    document
      .getElementById("selectSurface")
      .addEventListener("change", (event) => {
        this.scene = [this.surfaces[event.target.value]({})];
      });

    document.querySelectorAll(".customSurface").forEach((checkbox) => {
      checkbox.addEventListener("click", (event) => {
        this[event.target.dataset.custom] = !!event.target.checked;
      });
    });

    document.getElementById("colorPoints").addEventListener("change", (e) => {
      this.colorPoints = e.target.value;
    });

    document.getElementById("colorEdges").addEventListener("change", (e) => {
      this.colorEdges = e.target.value;
    });

    document.getElementById("colorPolygons").addEventListener("change", (e) => {
      const r = parseInt(e.target.value.substring(1, 3), 16);
      const g = parseInt(e.target.value.substring(3, 5), 16);
      const b = parseInt(e.target.value.substring(5, 7), 16);
      const rgb = { r, g, b };
      this.colorPolygons = rgb;
    });

    document.querySelectorAll(".customSizeRange").forEach((input) => {
      input.addEventListener("change", (event) => {
        pointsSizeInput.value = pointsSizeRange.value;
        edgesSizeInput.value = edgesSizeRange.value;
        this[event.target.dataset.custom] = event.target.value;
      });
    });

    document.querySelectorAll(".customSizeInput").forEach((input) => {
      input.addEventListener("input", (event) => {
        if (event.target.value > 0) {
          pointsSizeRange.value = pointsSizeInput.value;
          edgesSizeRange.value = edgesSizeInput.value;
          this[event.target.dataset.custom] = event.target.value;
        }
      });
    });

    document
      .getElementById("powerBrightnessRange")
      .addEventListener("change", (e) => {
        this.LIGHT.lumen = e.target.value;
        powerBrightnessInput.value = e.target.value;
      });

    document
      .getElementById("powerBrightnessInput")
      .addEventListener("input", (e) => {
        powerBrightnessRange.value = e.target.value;
        this.LIGHT.lumen = e.target.value;
      });
  }

  SolarSystem() {
    const Earth = this.surfaces.sphere({ r: 7.5, color: "#0096FF" });
    Earth.addAnimation("rotateOy", 0.1);
    const Moon = this.surfaces.sphere({ r: 2.5, y0: 18, color: "#C6C3B5" });
    Moon.addAnimation("rotateOy", 0.1);
    Moon.addAnimation("rotateOz", 0.03, Earth.center);
    return [Earth, Moon];
  }

  renderScene(FPS) {
    // console.log(FPS);

    this.graph.clear();
    if (this.drawPolygons) {
      const polygons = [];
      this.scene.forEach((surface, index) => {
        this.math3D.calcDistance(surface, this.WIN.CAMERA, `distance`);
        this.math3D.calcDistance(surface, this.LIGHT, `lumen`);
        surface.polygons.forEach((polygon) => {
          polygon.index = index;
          polygons.push(polygon);
        });
      });

    //   const polygons = [];
    //   this.scene.forEach((surface, index) => {
    //     this.math3D.calcCenter(surface);
    //     this.math3D.calcRadius(surface);
    //     this.math3D.calcDistance(surface, this.WIN.CAMERA, `distance`);
    //     this.math3D.calcDistance(surface, this.LIGHT, `lumen`);
    //     surface.polygons.forEach((polygon) => {
    //       polygon.index = index;
    //       polygons.push(polygon);
    //     });
    //   });

      this.math3D.sortByArtistAlgorithm(polygons);
    //   polygons.forEach((polygon) => {
    //     const points = [];
    //     let { r, g, b } = polygon.color;
    //     const { isShadow, dark } = this.math3D.calcShadow(
    //       polygon,
    //       this.scene,
    //       this.LIGHT
    //     );
    //     const lumen = this.math3D.calcIllumination(
    //       polygon.lumen,
    //       this.LIGHT.lumen * (isShadow ? dark : 1)
    //     );
    //   });

      polygons.forEach((polygon) => {
        polygon.color = this.colorPolygons;
        const points = polygon.points.map(
          (index) =>
            new Point(
              this.math3D.xs(this.scene[polygon.index].points[index]),
              this.math3D.ys(this.scene[polygon.index].points[index])
            )
        );
        const lumen = this.math3D.calcIllumination(
          polygon.lumen,
          this.LIGHT.lumen
        );
        let { r, g, b } = polygon.color;
        r = Math.round(r * lumen);
        g = Math.round(g * lumen);
        b = Math.round(b * lumen);
        this.graph.polygon(points, polygon.rgbToHex(r, g, b));
      });
    }

    if (this.drawPoints) {
      this.scene.forEach((surface) => {
        surface.points.forEach((point) =>
          this.graph.point(
            this.math3D.xs(point),
            this.math3D.ys(point),
            this.colorPoints,
            this.sizePoints
          )
        );
      });
    }

    if (this.drawEdges) {
      this.scene.forEach((surface) => {
        surface.edges.forEach((edge) => {
          const point1 = surface.points[edge.p1];
          const point2 = surface.points[edge.p2];
          this.graph.line(
            this.math3D.xs(point1),
            this.math3D.ys(point1),
            this.math3D.xs(point2),
            this.math3D.ys(point2),
            this.colorEdges,
            this.sizeEdges
          );
        });
      });
    }
  }
}
