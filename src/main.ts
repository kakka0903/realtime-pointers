import PocketBase from 'pocketbase';
import { PointerManager } from './pointers';
import './style.css';

const pb = new PocketBase('http://127.0.0.1:8090');
const pm = new PointerManager('pointers', 'pointer');

async function getPointerId() {
  let id = localStorage.getItem('myPointerId');
  if(id !== 'null' && id !== null) {
    // TODO: verify record exists on server
    return id;
  }

  const myPointer = await pb.collection('visitors').create({});
  localStorage.setItem('myPointerId', myPointer.id);
  return myPointer.id
}

// obtain a pointer id
let myPointerId = await getPointerId()
console.log('pointer id:', myPointerId);

// create pointers for all connected clients (including this one)
const allPointers = await pb.collection('visitors').getFullList()
allPointers.forEach(pointer => {
  pm.addPointer(pointer.id);
  pm.updatePointer(pointer.id, pointer.x, pointer.y)
});

// register listener to provide updates to other clients
window.addEventListener('mousemove', (e) => {
  pm.updatePointer(myPointerId, e.clientX, e.clientY)
  pb.collection('visitors').update(myPointerId, {
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
