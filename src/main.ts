import PocketBase from 'pocketbase';
import { PointerManager } from './pointers';
import './style.css';

const pb = new PocketBase('http://127.0.0.1:8090');
const pm = new PointerManager('pointers', 'pointer');

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
  pm.updatePointer(pointer.id, pointer.x, pointer.y)
});

// register listener to provide updates to other clients
window.addEventListener('mousemove', (e) => {
  if(myPointer === null) {
    return;
  }

  pm.updatePointer(myPointer.id, e.clientX, e.clientY)
  pb.collection('visitors').update(myPointer.id, {
    x: e.clientX,
    y: e.clientY
  });
})

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
