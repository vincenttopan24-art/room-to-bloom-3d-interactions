import React from 'react';
import {describe,it,expect,vi} from 'vitest';
import {useThree} from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import {CameraFocusController,steamParticle,approach} from '../src/controllers/AnimationController.jsx';
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
describe('animation controllers',()=>{
 it('steam rises, curls, and fades at its end',()=>{const a=steamParticle(0,1),b=steamParticle(.5,1),c=steamParticle(1,1);expect(b[1]).toBeGreaterThan(a[1]);expect(b[3]).toBeGreaterThan(0);expect(c[3]).toBe(0);expect(b[0]).not.toBe(a[0]);});
 it('damping is independent of frame subdivision',()=>{let a=0;for(let i=0;i<60;i++)a=approach(a,1,3,1/60);expect(a).toBeCloseTo(approach(0,1,3,1),7);});
 it('camera focuses then returns to its original position',async()=>{const callback=vi.fn();let camera;function Probe(){camera=useThree(s=>s.camera);return null;}const r=await ReactThreeTestRenderer.create(<><Probe/><CameraFocusController focused target={[0,0,5]} onReturned={callback}/></>,{camera:{position:[0,0,10]}});await r.advanceFrames(120,1/60);expect(camera.position.z).toBeCloseTo(5,1);await r.update(<><Probe/><CameraFocusController focused={false} target={[0,0,5]} onReturned={callback}/></>);await r.advanceFrames(180,1/60);expect(callback).toHaveBeenCalledTimes(1);await r.unmount();});
});
