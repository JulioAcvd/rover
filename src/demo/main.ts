import "xp.css/dist/XP.css";
import "./demo.css";
import { createRover, type RoverState } from "../rover";

interface DemoAnimation {
  readonly name: string;
  readonly label: string;
  readonly key?: string;
}

const DEMO_ANIMATIONS: readonly DemoAnimation[] = [
  { name: "Show", label: "Come out", key: "1" },
  { name: "Hide", label: "Go away", key: "2" },
  { name: "Greet", label: "Say hello", key: "3" },
  { name: "Idle", label: "Hang around", key: "4" },
  { name: "Searching", label: "Search", key: "5" },
  { name: "Thinking", label: "Think", key: "6" },
  { name: "GetAttention", label: "Get my attention", key: "7" },
  { name: "ClickedOn", label: "React to a pat", key: "8" },
  { name: "Pleased", label: "Look pleased", key: "9" },
  { name: "Acknowledge", label: "Acknowledge", key: "0" },
  { name: "RestPose", label: "Sit still" },
];

const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing element #${id}`);
  return element as T;
};

const stage = byId("rover-stage");
const list = byId<HTMLUListElement>("animation-list");
const soundToggle = byId<HTMLInputElement>("sound-toggle");
const idleToggle = byId<HTMLInputElement>("idle-toggle");
const statusAnimation = byId("status-animation");
const statusFrame = byId("status-frame");
const statusSound = byId("status-sound");

const rover = createRover(stage, { scale: 2, autoIdle: false });

const buttons = new Map(
  DEMO_ANIMATIONS.map((animation) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "task-pane__link";
    button.setAttribute("aria-pressed", "false");
    button.textContent = animation.label;
    if (animation.key) {
      const shortcut = document.createElement("kbd");
      shortcut.textContent = animation.key;
      button.append(shortcut);
    }
    button.addEventListener("click", () => rover.play(animation.name));

    const item = document.createElement("li");
    item.append(button);
    list.append(item);
    return [animation.name, button] as const;
  }),
);

const labelOf = (name: string) => DEMO_ANIMATIONS.find((animation) => animation.name === name)?.label ?? name;

let shownAnimation: string | undefined;

function renderStatus({ animation, frameIndex, frameCount }: RoverState): void {
  if (animation !== shownAnimation) {
    shownAnimation = animation;
    statusAnimation.textContent = animation ? `Playing: ${labelOf(animation)}` : "Ready";
    for (const [name, button] of buttons) button.setAttribute("aria-pressed", String(name === animation));
  }
  statusFrame.textContent = animation ? `Frame ${frameIndex + 1} of ${frameCount}` : "Frame –";
}

rover.subscribe(renderStatus);

stage.addEventListener("click", () => rover.play("ClickedOn"));
stage.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  rover.play("ClickedOn");
});
byId("finish-button").addEventListener("click", () => rover.exit());
byId("stop-button").addEventListener("click", () => rover.stop());

soundToggle.addEventListener("change", () => {
  rover.setMuted(!soundToggle.checked);
  statusSound.textContent = soundToggle.checked ? "Sound on" : "Sound off";
});
idleToggle.addEventListener("change", () => rover.setAutoIdle(idleToggle.checked));

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target instanceof HTMLInputElement) return;
  if (event.key === "Escape") return rover.exit();
  const animation = DEMO_ANIMATIONS.find(({ key }) => key === event.key);
  if (animation) rover.play(animation.name);
});

rover.play("Show");
rover.setAutoIdle(idleToggle.checked);
