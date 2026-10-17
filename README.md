# xp-rover

Rover, the search companion dog from Windows XP, for any website.

- Plays his 29 original animations, with the original timing, random variations and sounds.
- Works with any stack: plain HTML, React, Vue, Svelte, Angular, Astro…
- No dependencies, no CSS to import, safe to import during server-side rendering.

**[Live demo](https://julioacvd.github.io/rover/)**

## Install

```sh
npm install xp-rover
```

Or load it straight from a CDN, no build step needed:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/xp-rover@0/dist/element.js"></script>

<xp-rover animation="Greet" scale="2"></xp-rover>
```

## Web Component

The easiest way to use Rover anywhere. Importing `xp-rover/element` registers the `<xp-rover>` tag.

```js
import "xp-rover/element";
```

```html
<xp-rover animation="Greet" scale="2"></xp-rover>
```

| Attribute   | Description                                                             |
| ----------- | ----------------------------------------------------------------------- |
| `animation` | Plays this animation, and plays it again whenever the value changes.     |
| `scale`     | Size multiplier over the original 80×80 px frames. Defaults to `1`.     |
| `manual`    | Rover stays still after an animation instead of idling.                |
| `sound`     | Turns his sounds on. Browsers only allow it after the user interacts with the page. |

The element also has `play(name)`, `exit()` and `stop()` methods, and fires an `xp-rover-change` event
with `{ animation, frameIndex, frameCount }` in `event.detail` on every frame.

To register it under another tag name, import the class instead:

```js
import { XpRoverElement } from "xp-rover/element";

customElements.define("my-dog", class extends XpRoverElement {});
```

### In frameworks

Custom elements work natively in React 19, Vue, Svelte, Angular, Solid, Astro and others:

```jsx
import "xp-rover/element";

export function Mascot() {
  return <xp-rover animation="Greet" scale={2} />;
}
```

Vue needs to be told that `xp-rover` is a custom element, through `compilerOptions.isCustomElement`.

## JavaScript API

For full control, render Rover inside any element:

```ts
import { createRover } from "xp-rover";

const rover = createRover(document.querySelector("#mascot")!, { scale: 2 });

rover.play("Searching");
button.addEventListener("click", () => rover.exit());
```

### Options

| Option        | Default          | Description                                                     |
| ------------- | ---------------- | --------------------------------------------------------------- |
| `scale`       | `1`              | Size multiplier over the original 80×80 px frames.              |
| `autoIdle`    | `true`           | Go back to `Idle` whenever an animation ends.                   |
| `spriteUrl`   | bundled sprite   | Serve the sprite sheet from your own URL or CDN.                |
| `agent`       | Rover's data     | Animation data in the clippy.js format, to drive another agent. |
| `soundPlayer` | Web Audio player | Replace how sounds are played.                                  |

### Methods

| Method                 | Description                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| `play(name)`           | Play an animation. If Rover is idling, he finishes idling first. Unknown names are ignored.  |
| `exit()`               | Let the current animation wrap up through its exit branches.                                 |
| `stop()`               | Freeze on the current frame. Rover won't go back to idle until you play something.           |
| `setMuted(muted)`      | Sound is off by default. Call `setMuted(false)` from a user gesture, such as a click.        |
| `setAutoIdle(enabled)` | Turn automatic idling on or off.                                                             |
| `subscribe(listener)`  | Get `{ animation, frameIndex, frameCount }` on every frame. Returns an unsubscribe function. |
| `destroy()`            | Stop everything and remove Rover from the page. Call it when your component unmounts.       |

## Animations

`Acknowledge`, `Books`, `Celebrity`, `CharacterSucceeds`, `ClickedOn`, `Congratulate`, `Cooking`,
`Embarrassed`, `GestureLeft`, `GetAttention`, `GetAttentionMinor`, `Greet`, `Hide`, `HideQuick`,
`Idle`, `ImageSearching`, `LookUp`, `LookUpLeft`, `Money`, `Pleased`, `RestPose`, `Searching`,
`Shopping`, `Show`, `Sports`, `Surprised`, `Thinking`, `Travel`, `Writing`.

`Searching`, `Thinking` and similar animations loop until you call `exit()`.

## How assets load

The sprite sheet (698 KB) ships as a separate file next to the code and is found through
`new URL(..., import.meta.url)`, which Vite, webpack, Rollup, Parcel, esbuild and CDNs understand without
any configuration. The sounds (29 KB) are only downloaded the first time sound is turned on.

## Development

Requires Node 22+ and pnpm 11.

```sh
pnpm install
pnpm dev        # demo at http://localhost:5173, using the source
pnpm test
pnpm typecheck
pnpm build      # package in dist/, demo in demo-dist/
```

Releases are published to npm by GitHub Actions when a `v*` tag is pushed. The tag must match the
version in `package.json`.

The animation data in `src/data` is generated from clippy.js with `scripts/convert-clippy-agent.mjs`.

## Credits

Rover, his artwork and sounds, and the Bliss wallpaper are © Microsoft Corporation and are not covered by
the MIT license. Sprite sheet, animation data and sounds come from
[clippy.js](https://github.com/smore-inc/clippy.js) (MIT). The demo uses
[XP.css](https://github.com/botoxparty/XP.css) (MIT). See [LICENSE](LICENSE) and [NOTICE](NOTICE).
