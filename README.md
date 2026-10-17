# Rover

Rover, the search companion dog from Windows XP, brought back to the web.
A small, dependency-free TypeScript engine that plays his original animations,
with weighted random branches, graceful exits and his original sounds.

The repository also contains a demo styled as the Windows XP Search Companion.

## Usage

```ts
import { createRover } from "./src/rover";

const rover = createRover(document.querySelector("#rover")!, { scale: 2 });

rover.play("Greet");
```

Rover renders inside the container you give him and idles on his own when nothing else is playing.

### Options

| Option        | Default             | Description                                                    |
| ------------- | ------------------- | -------------------------------------------------------------- |
| `scale`       | `1`                 | Size multiplier over the original 80×80 px frames.             |
| `autoIdle`    | `true`              | Go back to `Idle` whenever an animation ends.                  |
| `spriteUrl`   | bundled sprite      | Serve the sprite sheet from your own URL.                      |
| `agent`       | Rover's data        | Animation data in the clippy.js format, to drive another agent. |
| `soundPlayer` | Web Audio player    | Replace how sounds are played.                                 |

### Methods

| Method                  | Description                                                                      |
| ----------------------- | -------------------------------------------------------------------------------- |
| `play(name)`            | Play an animation. If Rover is idling, he finishes idling first. Unknown names are ignored. |
| `exit()`                | Let the current animation wrap up through its exit branches.                     |
| `stop()`                | Freeze on the current frame. Rover won't go back to idle until you play something. |
| `setMuted(muted)`       | Sound is off by default. Call `setMuted(false)` from a user gesture, such as a click. |
| `setAutoIdle(enabled)`  | Turn automatic idling on or off.                                                 |
| `subscribe(listener)`   | Get `{ animation, frameIndex, frameCount }` on every frame. Returns an unsubscribe function. |
| `destroy()`             | Stop everything and remove Rover from the page.                                  |

### Animations

`Acknowledge`, `Books`, `Celebrity`, `CharacterSucceeds`, `ClickedOn`, `Congratulate`, `Cooking`,
`Embarrassed`, `GestureLeft`, `GetAttention`, `GetAttentionMinor`, `Greet`, `Hide`, `HideQuick`,
`Idle`, `ImageSearching`, `LookUp`, `LookUpLeft`, `Money`, `Pleased`, `RestPose`, `Searching`,
`Shopping`, `Show`, `Sports`, `Surprised`, `Thinking`, `Travel`, `Writing`.

`Searching`, `Thinking` and similar animations loop until you call `exit()`.

## Development

Requires Node 22+ and pnpm 11.

```sh
pnpm install
pnpm dev        # demo at http://localhost:5173
pnpm test       # unit tests
pnpm typecheck
pnpm build      # demo build in dist/
```

The animation data in `src/rover/data` is generated from clippy.js with
`scripts/convert-clippy-agent.mjs`; see that file for usage.

## Credits

Rover, his artwork and sounds, and the Bliss wallpaper are © Microsoft Corporation.
Sprite sheet, animation data and sounds come from [clippy.js](https://github.com/smore-inc/clippy.js) (MIT).
Windows XP styling by [XP.css](https://github.com/botoxparty/XP.css) (MIT). See [NOTICE](NOTICE).
