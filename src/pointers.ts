
import { gsap } from 'gsap';

/**
 * Manages creating, destroying and updating pointer HTML elements.
 */
export class PointerManager {
  pointerClassname: string
  containerEl: HTMLElement

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
    const pointer = document.createElement('div');
    pointer.id = id;
    pointer.className = this.pointerClassname
    pointer.style.backgroundColor = color;
    this.containerEl.appendChild(pointer);
  }

  updatePointer(id: string, x: number, y: number) {
    gsap.to(`#${id}`, {
      left: x,
      top: y,
      ease: 'back.out'
    })
  }

  removePointer(id: string) {
    document.getElementById(id)?.remove();
  }
}
