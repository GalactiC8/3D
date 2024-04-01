Surfaces.prototype.cube = function ({ color = '#ffff00' }) {
    const points = [
        new Point(10, 10, 10),
        new Point(10, -10, 10),
        new Point(-10, -10, 10),
        new Point(-10, 10, 10),

        new Point(-10, 10, -10),
        new Point(10, 10, -10),
        new Point(10, -10, -10),
        new Point(-10, -10, -10),
    ];

    const edges = [
        new Edge(0, 1),
        new Edge(1, 2),
        new Edge(2, 3),
        new Edge(3, 0),
        new Edge(0, 5),
        new Edge(1, 6),
        new Edge(2, 7),
        new Edge(3, 4),
        new Edge(4, 5),
        new Edge(5, 6),
        new Edge(6, 7),
        new Edge(7, 4)
    ];

    const polygons = [
        new Polygon([0, 1, 2, 3],color),
        new Polygon([4, 5, 6, 7],color), 
        new Polygon([0, 1, 6, 5],color), 
        new Polygon([3, 2, 7, 4],color), 
        new Polygon([0, 3, 4, 5],color), 
        new Polygon([1, 2, 7, 6],color), 
    ];
    return new Surface(points, edges, polygons);
};
