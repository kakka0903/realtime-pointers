import PocketBase from 'pocketbase';
import { PointerManager } from './pointers';
import './style.css';

const pb = new PocketBase(import.meta.env.VITE_PB_URL);
const pm = new PointerManager('pointers', 'pointer');
const updateFreq = Number(import.meta.env.VITE_UPDATE_FREQ)
const publicURL = import.meta.env.VITE_PUBLIC_URL;

function randomColor() {
  const colors = ['red', 'blue', 'green', 'orange'];
  return colors[Math.floor(Math.random() * colors.length)];
}

async function getMyPointer() {
  let id = localStorage.getItem('myPointerId');
  let pointer = null;
  if(id !== 'null' && id !== null) {
    try {
      pointer = await pb.collection('visitors').getOne(id);
    } catch (error) {
      localStorage.removeItem('myPointerId')
      return null
    }
  } else {
    pointer = await pb.collection('visitors').create({
      color: randomColor()
    });
  }
  localStorage.setItem('myPointerId', pointer.id);
  return pointer;
}

// use persisted pointer or create a new one
const myPointer = await getMyPointer();
console.log('pointer id:', myPointer?.id);

// create pointers for all connected clients (including this one)
const allPointers = await pb.collection('visitors').getFullList()
allPointers.forEach(pointer => {
  pm.addPointer(pointer.id, pointer.color);
});

export function throttle(callback: (...args: any[]) => void, delay = 1000) {
  let shouldWait = false;
  return (...args: any[]) => {
    if (shouldWait) return;
    callback(...args);
    shouldWait = true;
    setTimeout(() => {
      shouldWait = false;
    }, delay);
  };
}

// update pointer position locally with no delay
window.addEventListener('mousemove',(e) => {
  if(myPointer !== null) {
    pm.updatePointer(myPointer.id, e.clientX, e.clientY)
  }
})

// throttle pointer position updates to server
window.addEventListener('mousemove',throttle((e) => {
  if(myPointer !== null) {
    pb.collection('visitors').update(myPointer.id, {
      x: e.clientX,
      y: e.clientY
    });
  }
}, updateFreq))

// subscribe to updates from other clients
pb.collection('visitors').subscribe('*', (e) => {
  if(e.action == 'create') {
    pm.addPointer(e.record.id, e.record.color);
    pm.updatePointer(e.record.id, e.record.x, e.record.y);
  } else if (e.action == 'delete') {
    pm.removePointer(e.record.id);
  } else {
    pm.updatePointer(e.record.id, e.record.x, e.record.y);
  }
})

function addCopyUrlListener () {
  const button = document.getElementById('#copy-url');
  const copyText = document.getElementById('#copy-text');
  const copyIcon = document.getElementById('#icon-copy');
  const copiedIcon = document.getElementById('#icon-copied');

  if (button == null || copyText == null|| copyIcon == null || copiedIcon == null) {
    console.error('could not register listener: missing elements');
    return;
  }

  button?.addEventListener('click', () => {
    navigator.clipboard.writeText(publicURL);

    copyIcon.style.display = 'none';
    copiedIcon.style.display = 'block';
    copyText.innerHTML = 'Copied!'

    setTimeout(() => {
      copyIcon.style.display = 'block';
      copiedIcon.style.display = 'none';
      copyText.innerHTML = 'Copy URL'
    }, 2000)
  })
}

addCopyUrlListener();
