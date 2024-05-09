import PocketBase from 'pocketbase';
import { PointerManager } from './pointers';
import './style.css';

const pb = new PocketBase('http://127.0.0.1:8090');
const pm = new PointerManager('pointers', 'pointer');

const pointerOneId = 'djnqneemu70fbwp';
const pointerTwoId = 'fh8eph2o9m6ewrq';
let myPointerId = '';

pm.addPointer(pointerOneId)
pm.addPointer(pointerTwoId)

document.querySelectorAll('.use-pointer').forEach((element) => {
  element.addEventListener('click', (e) => {
    const idx = e.target?.dataset.idx;
    myPointerId = (idx == 1) ? pointerOneId : pointerTwoId
  })
});

pb.collection('visitors').subscribe('*', (e) => {
  pm.updatePointer(e.record.id, e.record.mice_x, e.record.mice_y);
})

window.addEventListener('mousemove', (e) => {
  if (myPointerId !== '') {
    pb.collection('visitors').update(myPointerId, {
      mice_x: e.clientX,
      mice_y: e.clientY
    });
    pm.updatePointer(myPointerId, e.clientX, e.clientY)
    console.log('updated ' + myPointerId);
  }
})
