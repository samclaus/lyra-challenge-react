import { useEffect, useRef, useState } from "react";
import { clonePolygon, closestPointOnSimplePolygonToTarget, type Point, type Polygon } from "./geometry";
import { action, makeAutoObservable } from "mobx";
import { observer } from "mobx-react-lite";

/**
 * Tool is an enumeration of all available tools for the editor.
 */
export type Tool = "select" | "move" | "closest-points" | "triangle" | "square" | "hexagon";

/**
 * Maps from key code (as in, the 'key' property of a KeyboardEvent) to tool, for
 * keyboard shortcuts.
 */
const KEY_TO_TOOL: { readonly [key: string]: Tool } = {
  1: "select",
  2: "move",
  3: "closest-points",
  4: "triangle",
  5: "square",
  6: "hexagon"
};

class EditorState {

  activeTool: Tool = "triangle";
  polygons: Polygon[] = [];
  selectedIndex = -1;
  mouseCoordsInSVG: Point | undefined = undefined; // make sure Mobx can see property

  get closestPoints(): Point[] {
    const { activeTool, polygons, mouseCoordsInSVG } = this;

    if (activeTool !== "closest-points" || !mouseCoordsInSVG) {
      return [];
    }

    return polygons.map(
      poly => closestPointOnSimplePolygonToTarget(poly, mouseCoordsInSVG),
    );
  }

  get addPolyPreview(): Polygon | undefined {
    const { activeTool, mouseCoordsInSVG } = this;

    if (mouseCoordsInSVG) {
      const [mouseX, mouseY] = mouseCoordsInSVG;

      return BASE_POLYGONS[activeTool]?.map(
        ([x, y]) => [x + mouseX, y + mouseY],
      );
    }

    return undefined;
  }

  constructor() {
    makeAutoObservable(this);
  }

  setActiveTool(tool: Tool): void {
    this.activeTool = tool;

    if (tool !== "select") {
      this.selectedIndex = -1;
    }
  }

}

/**
 * These are used to compute the dotted line preview for adding new polygons, using
 * the mouse coordinates from "mousemove" events to translate the respective polygon.
 * 
 * For any tools that do not involve adding shapes, there will be no base polygon and
 * thus no indicator will be shown.
 */
const BASE_POLYGONS: { readonly [T in Tool]?: Polygon } = {
  triangle: [
    [30, 0],
    [60, 45],
    [0, 45],
  ],
  square: [
    [0, 0],
    [50, 0],
    [50, 50],
    [0, 50],
  ],
  hexagon: [
    [60, 26],
    [45, 52],
    [15, 52],
    [0, 26],
    [15, 0],
    [45, 0],
  ],
};

function getMouseCoordinatesInSVG(svgEl: SVGSVGElement | null, ev: MouseEvent): Point | undefined {
  if (!svgEl) {
    return undefined;
  }

  const { top, left } = svgEl.getBoundingClientRect();
  return [ev.clientX - left, ev.clientY - top];
}

/**
 * Returns the numerical index/ID of the polygon corresponding to the given DOM
 * element, or -1 if the element does not correspond to a polygon.
 */
function getPolygonIndexForElement(el: unknown): number {
  if (el instanceof SVGPolygonElement) {
    const index = +(el.dataset.index as any);

    if (Number.isSafeInteger(index)) {
      return index;
    }
  }
  return -1;
}

interface BaseProps {
  readonly state: EditorState;
}

interface ToolbarProps extends BaseProps {
  onSaveButtonClick(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

const Toolbar = observer(function Toolbar({ state, onSaveButtonClick }: ToolbarProps) {
  useEffect(() => {
    /**
     * When a key is pressed (down) from anywhere within the app, we need to check if it is
     * a hotkey. If it is, activate the relevant tool and intercept the event.
     */
    function windowKeyDown(ev: KeyboardEvent): void {
      if (!ev.metaKey && !ev.shiftKey) {
        const tool = KEY_TO_TOOL[ev.key];

        if (tool) {
          ev.preventDefault();
          ev.stopPropagation();
          state.setActiveTool(tool);
        }
      }
    }

    window.addEventListener("keydown", windowKeyDown, true);

    return () => window.removeEventListener("keydown", windowKeyDown, true);
  }, []);

  const { activeTool } = state;

  return (
    <div
      id="main-toolbar"
      aria-label="Main toolbar"
      role="toolbar"
      aria-orientation="vertical">

      <button
        aria-label="Select"
        aria-keyshortcuts="1"
        aria-pressed={activeTool === "select"}
        onClick={() => state.setActiveTool("select")}>
        <svg><use xlinkHref="#cursor" /></svg>
        <kbd aria-hidden="true">1</kbd>
      </button>
      <button
        aria-label="Move"
        aria-keyshortcuts="2"
        aria-pressed={activeTool === "move"}
        onClick={() => state.setActiveTool("move")}>
        <svg><use xlinkHref="#move" /></svg>
        <kbd aria-hidden="true">2</kbd>
      </button>
      <button
        aria-label="Closest points"
        aria-keyshortcuts="3"
        aria-pressed={activeTool === "closest-points"}
        onClick={() => state.setActiveTool("closest-points")}>
        <svg><use xlinkHref="#closest-point" /></svg>
        <kbd aria-hidden="true">3</kbd>
      </button>

      <div style={{ flex: 1, maxHeight: "40px" }} />

      <button
        aria-label="Triangle"
        aria-keyshortcuts="4"
        aria-pressed={activeTool === "triangle"}
        onClick={() => state.setActiveTool("triangle")}>
        <svg><use xlinkHref="#triangle" /></svg>
        <kbd aria-hidden="true">4</kbd>
      </button>
      <button
        aria-label="Square"
        aria-keyshortcuts="5"
        aria-pressed={activeTool === "square"}
        onClick={() => state.setActiveTool("square")}>
        <svg><use xlinkHref="#square" /></svg>
        <kbd aria-hidden="true">5</kbd>
      </button>
      <button
        aria-label="Hexagon"
        aria-keyshortcuts="6"
        aria-pressed={activeTool === "hexagon"}
        onClick={() => state.setActiveTool("hexagon")}>
        <svg><use xlinkHref="#hexagon" /></svg>
        <kbd aria-hidden="true">6</kbd>
      </button>

      <div style={{ flex: 1 }} />

      <button
        aria-label="Save document"
        onClick={onSaveButtonClick}>
        <svg><use xlinkHref="#export" /></svg>
      </button>
    </div>
  );
});

const Polygons = observer(function Polygons({ state }: BaseProps) {
  const { selectedIndex } = state;

  return (
    <>
      {state.polygons.map((poly, i) =>
        <polygon
          key={i}
          data-index={i}
          fill={i === selectedIndex ? "#00897B" : "#E53935"}
          stroke="#00897B"
          strokeWidth="3"
          points={poly.map(([x, y]) => x + "," + y).join(" ")} />
      )}
    </>
  );
});

const ClosestPoints = observer(function ClosestPoints({ state }: BaseProps) {
  return (
    <>
      {state.closestPoints.map(([x, y], i) =>
        <circle
          key={i}
          fill="#D500F9"
          stroke="#651FFF"
          strokeWidth="1"
          cx={x}
          cy={y}
          r="5" />
      )}
    </>
  );
});

interface DragState {
  polyIndex: number;
  relCoords: Polygon;
}

export default observer(function Editor() {
  // NOTE: we do not need a state setter because the whole point of Mobx is that it
  // allows us to use mutable state and will automatically re-render this component
  // as necessary thanks to the observer() wrapper
  const [state] = useState(() => new EditorState);
  const { activeTool, addPolyPreview } = state;
  const svgRef = useRef<SVGSVGElement>(null);
  const dragState = useRef<DragState | null>(null);

  /**
   * If the user presses the mouse down on the SVG, we should start a drag operation if:
   * 
   * 1. They are currently using the "move" tool
   * 2. They pressed on one of the polygons, and not any other element (including the SVG itself)
   */
  function svgMouseDown(ev: React.MouseEvent<SVGSVGElement, MouseEvent>): void {
    if (activeTool === "move") {
      const index = getPolygonIndexForElement(ev.target);

      // NOTE: we only want to dereference polygons from the state object inside this function, as
      // opposed to the component body, because we don't want Mobx to tell the outer Editor component
      // to re-render whenever the polygons change.
      const { polygons } = state;

      if (index >= 0 && index < polygons.length) {
        const poly = polygons[index]!;
        const mouseCoords = getMouseCoordinatesInSVG(svgRef.current, ev.nativeEvent);

        if (mouseCoords) {
          const [mouseX, mouseY] = mouseCoords;

          dragState.current = {
            polyIndex: index,
            relCoords: poly.map(
              // NOTE: it is important that we make a DEEP copy of this polygon
              ([x, y]) => [x - mouseX, y - mouseY],
            )
          }
        } else {
          dragState.current = null;
        }
      }
    }
  }

  /**
   * Whenever the user stops holding the mouse down, just make sure to stop any drag operation.
   */
  function svgMouseUp(ev: React.MouseEvent<SVGSVGElement, MouseEvent>): void {
    dragState.current = null;
  }

  /**
   * All of tools, except the "move" and "closest-points" tools, care about mouse clicks
   * within the SVG. For the "select" tool, any polygon that gets clicked on should be
   * marked as the selected on. For any of the polygon creation tools, we can simply
   * make the current dotted line preview polygon 'permanent' by copying it into the
   * polygon array.
   */
  function svgMouseClick(ev: React.MouseEvent<SVGSVGElement, MouseEvent>): void {
    if (state.activeTool === "select") {
      const index = getPolygonIndexForElement(ev.target);

      if (index >= 0) {
        state.selectedIndex = index;
      }
    } else if (addPolyPreview) {
      state.polygons.push(clonePolygon(addPolyPreview));
    }
  }

  /**
   * Every tool except the "select" tool cares about the mouse moving inside of the SVG. The
   * "move" tool will directly use this opportunity to update the coordinates of whatever
   * polygon (if any) we are currently dragging, while the rest of the tools (closest points,
   * and the polygon creation tools) will have their logic run by Svelte once we update the
   * current mouse coordinates.
   */
  function svgMouseMove(ev: React.MouseEvent<SVGSVGElement, MouseEvent>): void {
    // This will trigger a reactive declaration for rendering closest points, etc.
    state.mouseCoordsInSVG = getMouseCoordinatesInSVG(svgRef.current, ev.nativeEvent);

    if (activeTool === "move" && dragState.current && state.mouseCoordsInSVG) {
      const {polyIndex, relCoords} = dragState.current;
      const {polygons} = state;

      if (polyIndex >= 0 && polyIndex < polygons.length) {
        const poly = polygons[polyIndex]!;
        const len = Math.min(relCoords.length, poly.length);
        const [mouseX, mouseY] = state.mouseCoordsInSVG;

        for (let i = 0; i < len; ++i) {
          const pAbs = poly[i]!;
          const pRel = relCoords[i]!;

          pAbs[0] = pRel[0] + mouseX;
          pAbs[1] = pRel[1] + mouseY;
        }
      }
    }
  }

  /**
   * When the mouse leaves the canvas, we should stop any drag operation, but also get rid of
   * any tool visuals like closest points and the mouse-following preview for adding a polygon.
   */
  function svgMouseLeave(): void {
    dragState.current = null;
    state.mouseCoordsInSVG = undefined;
  }

  function saveEditorState(): void {
    console.log(JSON.stringify(state.polygons, undefined, 4));
  }

  return (
    <main>

      <Toolbar
        state={state}
        onSaveButtonClick={saveEditorState} />

      <svg
        id="canvas"
        xmlns="http://www.w3.org/2000/svg"
        className={activeTool}
        ref={svgRef}
        onMouseMove={action(svgMouseMove)}
        onMouseDown={action(svgMouseDown)}
        onMouseUp={action(svgMouseUp)}
        onClick={action(svgMouseClick)}
        onMouseLeave={action(svgMouseLeave)}>

        {/* Separate component so we don't re-render everything when polygon array is modified */}
        <Polygons state={state} />

        {/*
          NOTE: all of the closest point circles are intentionally rendered after ALL
          of the polygons, meaning that if two polygons are overlapping, the closest
          point for the covered one will still be visible.

          Also, again, separate component so Mobx triggers minimal re-render diffing.
        */}
        <ClosestPoints state={state} />

        {addPolyPreview &&
          <polygon
            fill="transparent"
            stroke="#FFFF00"
            strokeWidth="1"
            strokeDasharray="1 1"
            points={addPolyPreview.map(([x, y]) => x + "," + y).join(" ")}
            pointerEvents="none" />
        }

      </svg>

    </main>
  );
});
