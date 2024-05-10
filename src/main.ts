import PocketBase from 'pocketbase';
import { PointerManager } from './pointers';
import './style.css';

const pb = new PocketBase('http://145.97.164.133:8090');
const pm = new PointerManager('pointers', 'pointer');

async function getMyPointer() {
  let id = localStorage.getItem('myPointerId');

  if(id !== 'null' && id !== null) {
    // TODO: handle non-existant pointer
    const pointer = await pb.collection('visitors').getOne(id);
    return pointer;
  } else {
    const pointer = await pb.collection('visitors').create({});
    localStorage.setItem('myPointerId', pointer.id);
    return pointer;
  }
}

// obtain a pointer id
const myPointer = await getMyPointer();
console.log('pointer id:', myPointer.id);

// create pointers for all connected clients (including this one)
const allPointers = await pb.collection('visitors').getFullList()
allPointers.forEach(pointer => {
  pm.addPointer(pointer.id);
  pm.updatePointer(pointer.id, pointer.x, pointer.y)
});

// register listener to provide updates to other clients
window.addEventListener('mousemove', (e) => {
  pm.updatePointer(myPointer.id, e.clientX, e.clientY)
  pb.collection('visitors').update(myPointer.id, {
    x: e.clientX,
    y: e.clientY
  });
})

// subscribe to updates from other clients
pb.collection('visitors').subscribe('*', (e) => {
  if(e.action == 'create') {
    pm.addPointer(e.record.id);
    pm.updatePointer(e.record.id, e.record.x, e.record.y);
  } else if (e.action == 'delete') {
    pm.removePointer(e.record.id);
  } else {
    pm.updatePointer(e.record.id, e.record.x, e.record.y);
  }
})
