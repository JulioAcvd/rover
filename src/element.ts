import { createRover, type Rover, type RoverAnimationName, type RoverState } from "./rover.js";

const ElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;

export class XpRoverElement extends ElementBase {
  static readonly observedAttributes = ["animation", "scale", "manual", "sound"];

  #rover: Rover | undefined;

  connectedCallback(): void {
    this.#mount();
  }

  disconnectedCallback(): void {
    this.#rover?.destroy();
    this.#rover = undefined;
  }

  attributeChangedCallback(name: string, _oldValue: string | null, value: string | null): void {
    if (!this.#rover) return;
    switch (name) {
      case "animation":
        if (value) this.#rover.play(value);
        break;
      case "scale":
        this.disconnectedCallback();
        this.#mount();
        break;
      case "manual":
        this.#rover.setAutoIdle(value === null);
        break;
      case "sound":
        this.#rover.setMuted(value === null);
        break;
    }
  }

  play(name: RoverAnimationName | (string & {})): void {
    this.#rover?.play(name);
  }

  exit(): void {
    this.#rover?.exit();
  }

  stop(): void {
    this.#rover?.stop();
  }

  #mount(): void {
    const stage = this.shadowRoot ?? this.#createShadowRoot();
    const rover = createRover(stage, {
      scale: Number(this.getAttribute("scale")) || 1,
      autoIdle: !this.hasAttribute("manual"),
    });
    rover.subscribe((state) => {
      this.dispatchEvent(new CustomEvent<RoverState>("xp-rover-change", { detail: state }));
    });
    if (this.hasAttribute("sound")) rover.setMuted(false);
    const animation = this.getAttribute("animation");
    if (animation) rover.play(animation);
    this.#rover = rover;
  }

  #createShadowRoot(): ShadowRoot {
    const shadowRoot = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = ":host { display: inline-block; }";
    shadowRoot.append(style);
    return shadowRoot;
  }
}

if (globalThis.customElements && !customElements.get("xp-rover")) {
  customElements.define("xp-rover", XpRoverElement);
}
