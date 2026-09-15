import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cylinderState,order} from './physics.js';
test('all cylinders fire at 120 degree intervals in the stated order',()=>{order.forEach((n,i)=>{const s=cylinderState(i*120,n-1);assert.equal(s.local,0);assert.ok(Math.abs(s.displacement)<1e-10);});});
test('slider crank has 86 mm stroke, periodicity and fixed connecting rod length',()=>{for(let i=0;i<6;i++)for(let angle=0;angle<720;angle++){const s=cylinderState(angle,i);assert.ok(s.displacement>=-1e-9&&s.displacement<=86+1e-9);assert.ok(Math.abs(Math.hypot(s.pin.x,s.y-s.pin.y)-2.1)<1e-10);assert.equal(s.y,cylinderState(angle+720,i).y);}});
test('four strokes and valve states agree',()=>{assert.equal(cylinderState(90,0).phase,0);assert.equal(cylinderState(270,0).exhaust,true);assert.equal(cylinderState(450,0).intake,true);assert.equal(cylinderState(630,0).phase,3);assert.ok(Math.abs(cylinderState(180,0).displacement-86)<1e-10);});
