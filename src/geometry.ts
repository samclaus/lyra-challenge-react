
/**
 * Point is a simple [x, y] tuple.
 */
export type Point = [number, number];

/**
 * Polygon is a collection of points, in clockwise or counter-clockwise order.
 */
export type Polygon = Point[];

/**
 * Creates a deep copy of the given point.
 */
export function clonePoint([x, y]: Point): Point {
    return [x, y];
}

/**
 * Creates a deep copy of the given polygon.
 */
export function clonePolygon(p: Polygon): Polygon {
    return p.map(clonePoint);
}

/**
 * Check if a point is inside of a SIMPLE (non-self-intersecting) polygon. This does
 * not always handle the case where the point lies on an edge of the polygon, which is
 * apparently an intended "edge" case (pun intended) for the algorithm used.
 * 
 * Uses the Jordan Curve Theorem, with code ported from
 * https://wrfranklin.org/Research/Short_Notes/pnpoly.html.
 */
export function isPointInsideSimplePolygon(point: Point, poly: Polygon): boolean {
    const nvert = poly.length;
    const [testx, testy] = point;
    
    let inside = false;

    // Loop over every edge of the polygon, where i and j are the two current vertices
    for (let i = 0, j = nvert-1; i < nvert; j = i++) {
        if (
            ((poly[i][1] > testy) != (poly[j][1] > testy)) &&
            (testx < (poly[j][0] - poly[i][0]) * (testy - poly[i][1] ) / (poly[j][1] - poly[i][1] ) + poly[i][0])
        ) {
            inside = !inside;
        }
    }

    return inside;
}

function euclideanDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x1 - x2)**2 + (y1 - y2)**2);
}

/**
 * Check if a point is on the edge of a SIMPLE (non-self-intersecting) polygon.
 * 
 * Code ported from
 * https://gist.github.com/danijak/4904451c68e476e2fb0a11207c9061dd#file-ispointonpolygon-cpp.
 */
export function isPointOnEdgeOfSimplePolygon(point: Point, poly: Polygon): boolean {
    const nvert = poly.length;
    const [px, py] = point;

    // Loop over every edge of the polygon, where i and j are the two current vertices
    for (let i = 0, j = nvert-1; i < nvert; j = i++) {  
        const [ix, iy] = poly[i];
        const [jx, jy] = poly[j];
        const ip = euclideanDistance(ix, iy, px, py);
        const pj = euclideanDistance(px, py, jx, jy);
        const ij = euclideanDistance(ix, iy, jx, jy);

        // If the sum of the target point's distances from i and j are the same as the
        // distance between i and j themselves, the point must lie on the edge between
        // the two vertices
        if (ip + pj === ij) {
            return true;
        }               
    }

    return false;
}

/**
 * Find the point on a SIMPLE (non-self-intersecting) polygon which is closest to the
 * target point. If the target point is inside the polygon or on an edge of the polygon,
 * it IS the closest point.
 * 
 * Code ported from https://javedali-iitkgp.medium.com/get-closest-point-on-a-polygon-23b68e26a33.
 */
export function closestPointOnSimplePolygonToTarget(poly: Polygon, target: Point): Point {
    if (
        // Case 1: the point is strictly inside the polygon
        isPointInsideSimplePolygon(target, poly) ||
        // Case 2: the point is on one of the edges of the polygon
        isPointOnEdgeOfSimplePolygon(target, poly)
    ) {
        // Make a copy so that we can safely mutate the original point (JS arrays are passed
        // by reference like other objects)
        return [...target];
    }

    // Case 3: the point is outside the polygon..
    //
    // Honestly, I understand some of the principles behind this algorithm, but I don't
    // understand it fully and I wouldn't have been able to come up with it myself in any
    // sane amount of time. Thankfully we have the internet.

    const nvert = poly.length;
    const [tx, ty] = target;

	let
        min_x = 0,
        min_y = 0,
        min_dist = 100000,
        dist: number;

    // Loop over every edge of the polygon, where i and j are the two current vertices
	for (let i = 0, j = nvert-1; i < nvert; j = i++) {		
		const
            [ix, iy] = poly[i],
            [jx, jy] = poly[j],
            a = tx - ix,
		    b = ty - iy,
		    c = jx - ix,
		    d = jy - iy,
		    dot = a*c+b*d,
		    len_sq = c*c+d*d,
		    cos_theta = dot/len_sq;

        let
            px: number,
            py: number;

		if (cos_theta < 0) {
			px = ix;
			py = iy;
		} else if (cos_theta > 1) {
			px = jx;
			py = jy;
		} else {
			px = ix + cos_theta*c;
			py = iy + cos_theta*d;
		}

        dist = euclideanDistance(tx, ty, px, py);

		if (dist < min_dist) {
			min_x = px;
			min_y = py;
			min_dist = dist;
		}
	}

	return [min_x, min_y];
}
