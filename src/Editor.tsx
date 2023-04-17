import { useEffect, useState } from "react";
import { clonePolygon, closestPointOnSimplePolygonToTarget, type Point, type Polygon } from "./geometry";
import { makeAutoObservable } from "mobx";
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

  setActiveTool(tool: Tool): void {
    this.activeTool = tool;
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

export default observer(function Editor() {
  // NOTE: we do not need a state setter because the whole point of Mobx is that it
  // allows us to use mutable state and will automatically re-render this component
  // as necessary thanks to the observer() wrapper
  const [state] = useState(() => new EditorState);

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
        xmlns="http://www.w3.org/2000/svg">

      </svg>

    </main>
  );
});
