
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

  addPointer(id: string) {
    const pointer = document.createElement('div');
    pointer.id = id;
    pointer.className = this.pointerClassname
    pointer.style.backgroundColor = 'red';
    this.containerEl.appendChild(pointer);
  }

  updatePointer(id: string, x: number, y: number) {
    const pointer = document.getElementById(id);
    if(pointer !== null) {
      pointer.style.left = x.toString()+'px';
      pointer.style.top = y.toString()+'px';
      console.log(x,y)
    }
  }

  removePointer(id: string) {
    document.getElementById(id)?.remove();
  }
}
