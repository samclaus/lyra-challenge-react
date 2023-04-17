import { useEffect } from "react";
import { Tool } from "./types";

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

// Apparently namespace merging works even for default exports--nice. :)
namespace Toolbar {
    export interface Props {
        /**
         * The currently active tool to be highlighted in the toolbar. This is a pure controlled component.
         */
        readonly activeTool: Tool;
        /**
         * Callback for when a tool is selected. The event will be a React wrapper for a MouseEvent if one
         * of the buttons was clicked, or a native KeyboardEvent if a hotkey was pressed. The parent component
         * is responsible for preventing the default behavior and/or propagation for keyboard events, as well
         * as deciding whether to activate the selected tool in the first place.
         * 
         * This component does not make assumptions about behavior.
         */
        readonly onToolSelected: (
            t: Tool,
            ev: React.MouseEvent<HTMLButtonElement, MouseEvent> | KeyboardEvent,
        ) => void;
        /**
         * Callback for when the save button is clicked. There is no keyboard shortcut for the save button, so
         * the event will always be a React wrapper for a MouseEvent.
         */
        readonly onSaveButtonClicked: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    }
}
function Toolbar({ activeTool, onToolSelected, onSaveButtonClicked }: Toolbar.Props) {
    useEffect(() => {
        /**
         * When a key is pressed (down) from anywhere within the app, we need to check if it is
         * a hotkey. If it is, activate the relevant tool and intercept the event.
         */
        function windowKeyDown(ev: KeyboardEvent): void {
            if (!ev.metaKey && !ev.shiftKey) {
                const tool = KEY_TO_TOOL[ev.key];

                if (tool) {
                    onToolSelected(tool, ev);
                }
            }
        }

        window.addEventListener("keydown", windowKeyDown, true);

        return () => window.removeEventListener("keydown", windowKeyDown, true);
    }, []);

    return <div
        id="main-toolbar"
        aria-label="Main toolbar"
        role="toolbar"
        aria-orientation="vertical">

        <button
            aria-label="Select"
            aria-keyshortcuts="1"
            aria-pressed={activeTool === "select"}
            onClick={ev => onToolSelected("select", ev)}>
            <svg><use xlinkHref="#cursor" /></svg>
            <kbd aria-hidden="true">1</kbd>
        </button>
        <button
            aria-label="Move"
            aria-keyshortcuts="2"
            aria-pressed={activeTool === "move"}
            onClick={ev => onToolSelected("move", ev)}>
            <svg><use xlinkHref="#move" /></svg>
            <kbd aria-hidden="true">2</kbd>
        </button>
        <button
            aria-label="Closest points"
            aria-keyshortcuts="3"
            aria-pressed={activeTool === "closest-points"}
            onClick={ev => onToolSelected("closest-points", ev)}>
            <svg><use xlinkHref="#closest-point" /></svg>
            <kbd aria-hidden="true">3</kbd>
        </button>

        <div style={{flex: 1, maxHeight: "40px"}} />

        <button
            aria-label="Triangle"
            aria-keyshortcuts="4"
            aria-pressed={activeTool === "triangle"}
            onClick={ev => onToolSelected("triangle", ev)}>
            <svg><use xlinkHref="#triangle" /></svg>
            <kbd aria-hidden="true">4</kbd>
        </button>
        <button
            aria-label="Square"
            aria-keyshortcuts="5"
            aria-pressed={activeTool === "square"}
            onClick={ev => onToolSelected("square", ev)}>
            <svg><use xlinkHref="#square" /></svg>
            <kbd aria-hidden="true">5</kbd>
        </button>
        <button
            aria-label="Hexagon"
            aria-keyshortcuts="6"
            aria-pressed={activeTool === "hexagon"}
            onClick={ev => onToolSelected("hexagon", ev)}>
            <svg><use xlinkHref="#hexagon" /></svg>
            <kbd aria-hidden="true">6</kbd>
        </button>

        <div style={{flex: 1}} />

        <button
            aria-label="Save document"
            onClick={onSaveButtonClicked}>
            <svg><use xlinkHref="#export" /></svg>
        </button>
  </div>
}

export default Toolbar;
