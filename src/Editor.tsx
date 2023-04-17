import { useState } from "react";
import { clonePolygon, closestPointOnSimplePolygonToTarget, type Point, type Polygon } from "./geometry";
import { Tool } from "./types";
import Toolbar from "./Toolbar";

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

export default function Editor() {
  const [activeTool, setActiveTool] = useState<Tool>("triangle");

  function saveEditorState(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    // TODO
  }

  return (
    <main>

      <Toolbar
        activeTool={activeTool}
        onToolSelected={(tool, ev) => {
          if (ev instanceof KeyboardEvent) {
            ev.preventDefault();
            ev.stopPropagation();
          }
          setActiveTool(tool);
        }}
        onSaveButtonClicked={saveEditorState} />

      <svg
        id="canvas"
        xmlns="http://www.w3.org/2000/svg">



      </svg>

    </main>
  );
}
