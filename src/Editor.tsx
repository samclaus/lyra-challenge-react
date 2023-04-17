import { useState } from "react";
import { clonePolygon, closestPointOnSimplePolygonToTarget, type Point, type Polygon } from "./geometry";
import { Tool } from "./types";
import Toolbar from "./Toolbar";
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react-lite";

class EditorState {

  activeTool: Tool = "triangle";
  addPolyPreview: Polygon | undefined = undefined; // make sure Mobx can see property
  polygons: Polygon[] = [];
  closestPoints: Point[] = [];
  selectedIndex = -1;
  mouseCoordsInSVG: Point | undefined = undefined; // make sure Mobx can see property
  draggingPolyIndex = -1;
  draggingPolyCoordsRelativeToMouse: Polygon = [];

  constructor() {
    makeAutoObservable(this);
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

export default observer(function Editor() {
  // NOTE: we do not need a state setter because the whole point of Mobx is that it
  // allows us to use mutable state and will automatically re-render this component
  // as necessary thanks to the observer() wrapper
  const [state] = useState(() => new EditorState);

  function saveEditorState(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    console.log(JSON.stringify(state.polygons, undefined, 4));
  }

  return (
    <main>

      <Toolbar
        activeTool={state.activeTool}
        onToolSelected={(tool, ev) => {
          if (ev instanceof KeyboardEvent) {
            ev.preventDefault();
            ev.stopPropagation();
          }
          state.activeTool = tool;
        }}
        onSaveButtonClicked={saveEditorState} />

      <svg
        id="canvas"
        xmlns="http://www.w3.org/2000/svg">



      </svg>

    </main>
  );
});
