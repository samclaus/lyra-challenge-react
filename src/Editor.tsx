import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { clonePolygon, closestPointOnSimplePolygonToTarget, type Point, type Polygon } from "./geometry";

type Tool = "select" | "move" | "closest-points" | "triangle" | "square" | "hexagon";

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

function Editor() {
  const [activeTool, setActiveTool] = useState<Tool>("triangle");

  function saveEditorState(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    // TODO
  }

  return (
    <main>
      <div
        id="main-toolbar"
        aria-label="Main toolbar"
        role="toolbar"
        aria-orientation="vertical">

        <button
          aria-label="Select"
          aria-keyshortcuts="1"
          aria-pressed={activeTool === "select"}
          onClick={() => setActiveTool("select")}>
          <svg><use xlinkHref="#cursor" /></svg>
          <kbd aria-hidden="true">1</kbd>
        </button>
        <button
          aria-label="Move"
          aria-keyshortcuts="2"
          aria-pressed={activeTool === "move"}
          onClick={() => setActiveTool("move")}>
          <svg><use xlinkHref="#move" /></svg>
          <kbd aria-hidden="true">2</kbd>
        </button>
        <button
          aria-label="Closest points"
          aria-keyshortcuts="3"
          aria-pressed={activeTool === "closest-points"}
          onClick={() => setActiveTool("closest-points")}>
          <svg><use xlinkHref="#closest-point" /></svg>
          <kbd aria-hidden="true">3</kbd>
        </button>

        <div style={{flex: 1, maxHeight: "40px"}} />

        <button
          aria-label="Triangle"
          aria-keyshortcuts="4"
          aria-pressed={activeTool === "triangle"}
          onClick={() => setActiveTool("triangle")}>
          <svg><use xlinkHref="#triangle" /></svg>
          <kbd aria-hidden="true">4</kbd>
        </button>
        <button
          aria-label="Square"
          aria-keyshortcuts="5"
          aria-pressed={activeTool === "square"}
          onClick={() => setActiveTool("square")}>
          <svg><use xlinkHref="#square" /></svg>
          <kbd aria-hidden="true">5</kbd>
        </button>
        <button
          aria-label="Hexagon"
          aria-keyshortcuts="6"
          aria-pressed={activeTool === "hexagon"}
          onClick={() => setActiveTool("hexagon")}>
          <svg><use xlinkHref="#hexagon" /></svg>
          <kbd aria-hidden="true">6</kbd>
        </button>

        <div style={{flex: 1}} />

        <button
          aria-label="Save document"
          onClick={saveEditorState}>
          <svg><use xlinkHref="#export" /></svg>
        </button>

      </div>
      <svg
        id="canvas"
        xmlns="http://www.w3.org/2000/svg">



      </svg>
    </main>
  );
}

export default Editor;
