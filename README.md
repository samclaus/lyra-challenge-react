This repository is my React/Mobx-based solution to [a job candidate challenge from Lyra Solar](https://docs.google.com/document/d/e/2PACX-1vQu8Vf3kWChnXuKylxWAQuFOzlaFr4SFyAkj-X5UvjjkhC_J5p1YOaZH1bisgtSKrFy6MUXNO9mdWh4/pub).

The project uses React as the UI framework/library, Mobx for managing state (i.e., reactivity: telling React to re-render when variables change), and Vite for bundling. For an alternative solution in Svelte, see https://github.com/samclaus/lyra-challenge-svelte.

I use [PNPM](https://pnpm.io/) instead of NPM as my package manager, but NPM should still work just fine. To run in development mode:

```Bash
npm install
npm run dev
```

## High-level Design

All code is in the `src/` folder, which contains the following files:

- `Editor.tsx`: all of the UI logic. The editor is split up into several React function components (which are wrapped with the Mobx `observer` API), because doing so is critical for fine-grained re-rendering, i.e., we don't want to re-render all the polygons when just the selected tool changed, and vice versa. The file also contains the Mobx-based `EditorState` class which holds all the application state except a couple things like the current drag information.

- `geometry.ts`: vanilla TypeScript polygon types and math functions. I copy-pasted this as-is from the Svelte version of this project. It defines core data types for the application and powers the "Closest points" editor tool.

- `index.css`: all of the CSS for the application. React does not appear to have a good go-to solution for CSS so I decided to dump everything in one file so I could feel secure in knowing Vite would minify it away and performance would be good.

- `main.tsx`: imports the editor component and renders it with `react-dom`, nothing more.

## Comparison with the Svelte version

- React + Mobx = much bigger bundle size than Svelte. (Try building both projects for production with `npm run build` and check Vite output file sizes.)
- React + Mobx = more verbose code than Svelte. (Compare `Editor.tsx` with `Editor.svelte`, remembering that `Editor.svelte` also contains quite a few CSS styles.)
- React + Mobx = worse runtime performance than Svelte, even with measures like breaking up components as an optimization. (Svelte computes dependency graphs for variables at compile-time and injects imperative update code after every assignment it finds to variables that other things depend on, as opposed to all the Mobx runtime getter/setter/callback behind-the-scenes magic and React VDOM diffing, etc.)
- For the things I think I could have improved upon, please see the [README for the Svelte version of this app](https://github.com/samclaus/lyra-challenge-svelte#things-i-dont-like-about-my-solution).
