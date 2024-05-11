
import { gsap } from 'gsap';


/**
 * Executes the callback when the function has not been called within delay argument.
 * @param callback The function to execute when delay has passed
 * @param delay The delay to wait before execution
 * @returns Callback wrapped in heartbeat functionality.
 */
function heartbeat(callback: (...args: any[]) => void, delay: number) {
  let timeoutId: number | undefined = undefined;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(args);
    }, delay);
  }
}

/**
 * Manages creating, destroying and updating pointer HTML elements.
 */
export class PointerManager {
  pointerClassname: string
  containerEl: HTMLElement
  heartbeats = new Map();

  constructor(containerId: string, pointerClassname: string) {
    this.pointerClassname = pointerClassname

    // ensure existance of pointer container
    const container = document.getElementById(containerId);
    if (container === null) {
      throw Error('Could not find pointer container');
    } else {
      this.containerEl = container
    }
  }

  addPointer(id: string, color: string) {
    // initialise the pointer DOM element
    const pointer = document.createElement('div');
    pointer.id = id;
    pointer.className = this.pointerClassname
    pointer.style.backgroundColor = color;
    this.containerEl.appendChild(pointer);

    // initialise the heartbeat function for this pointer
    const pointerHeartbeat = heartbeat(() => {
      gsap.to(`#${id}`, {
        opacity: 0,
        ease: 'slow',
        duration: 10
      })
    }, 2000)

    // trigger and store for later
    pointerHeartbeat();
    this.heartbeats.set(id, pointerHeartbeat);
  }

  updatePointer(id: string, x: number, y: number) {
    // provide pointer heartbeat
    this.heartbeats.get(id)();

    // stop other tweens (like fade) of pointer
    gsap.killTweensOf(`#${id}`);

    // update pointer visualisation
    gsap.to(`#${id}`, {
      left: x,
      top: y,
      ease: 'back.out',
      opacity: 1
    })
  }

  removePointer(id: string) {
    document.getElementById(id)?.remove();
  }
}
