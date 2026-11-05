import React,{createRef} from 'react';
import {readFile} from 'node:fs/promises';
import {beforeAll,it,expect,vi} from 'vitest';
import {create,act} from '@react-three/test-renderer';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Ray,Vector3} from 'three';
import {findNode} from '../src/core/rigs.js';
import {StudyProvider,useStudy} from '../src/core/StudyProvider.jsx';
import {Clock} from '../src/objects/Clock.jsx';
import {CDPlayer} from '../src/objects/CDPlayer.jsx';
import {Steam,Tea} from '../src/objects/Tea.jsx';
import {Bin} from '../src/objects/Bin.jsx';
const assets=vi.hoisted(()=>new Map());
vi.mock('@react-three/drei',()=>({useGLTF:url=>{const name=decodeURIComponent(url.split('/').at(-1));if(!assets.has(name))throw Error(`Missing real fixture ${name}`);return assets.get(name);}}));
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
let api;
function Probe(){api=useStudy();return null;}
const mount=(children,initial={})=>create(<StudyProvider storage={null} initial={initial}><Probe/>{children}</StudyProvider>);
beforeAll(async()=>{
 for(const file of ['alarm_clock.glb','CD.glb','tea cup.glb','rubbish can.glb']){
  const bytes=await readFile(new URL('../public/assets/'+file,import.meta.url));
  assets.set(file,await new GLTFLoader().parseAsync(new Uint8Array(bytes).buffer,''));
 }
});
function clockEvent(group,hand,steps,value,target){
 group.updateWorldMatrix(true,true);
 const pivot=hand.parent,angle=value/steps*Math.PI*2;
 const x=pivot.position.x+Math.sin(angle),y=pivot.position.y+Math.cos(angle);
 return {object:hand,pointerId:17,target,stopPropagation:vi.fn(),ray:new Ray(new Vector3(x,y,4).applyMatrix4(group.matrixWorld),new Vector3(0,0,-1).transformDirection(group.matrixWorld))};
}
it('drags the actual long clock hand for hours and short hand for minutes with capture/release',async()=>{
 const renderer=await mount(<Clock/>);
 const handler=renderer.scene.find(node=>typeof node.props.onPointerDown==='function'),group=handler.instance;
 const long=findNode(group,'Minute Hand'),short=findNode(group,'Hour Hand');
 expect(long.parent.name).toBe('Minute Hand pivot');expect(short.parent.name).toBe('Hour Hand pivot');
 const target={setPointerCapture:vi.fn(),releasePointerCapture:vi.fn()};
 await renderer.fireEvent(handler,'pointerDown',clockEvent(group,long,13,3,target));
 expect(api.state.timer.studyMs).toBe((3*60+25)*60000);expect(target.setPointerCapture).toHaveBeenCalledWith(17);
 await renderer.fireEvent(handler,'pointerMove',clockEvent(group,long,13,4,target));expect(api.state.timer.studyMs).toBe((4*60+25)*60000);
 await renderer.fireEvent(handler,'pointerUp',clockEvent(group,long,13,4,target));expect(target.releasePointerCapture).toHaveBeenCalledWith(17);
 await renderer.fireEvent(handler,'pointerDown',clockEvent(group,short,60,45,target));expect(api.state.timer.studyMs).toBe((4*60+45)*60000);
 await renderer.fireEvent(handler,'pointerUp',clockEvent(group,short,60,45,target));
 await renderer.unmount();
});
it('ignores clock drag while the timer runs and releases a lost pointer',async()=>{
 const renderer=await mount(<Clock/>),handler=renderer.scene.find(node=>typeof node.props.onPointerDown==='function'),group=handler.instance;
 const hand=findNode(group,'Minute Hand'),target={setPointerCapture:vi.fn(),releasePointerCapture:vi.fn()};
 await renderer.fireEvent(handler,'pointerDown',clockEvent(group,hand,13,2,target));
 await renderer.fireEvent(handler,'lostPointerCapture',{});
 await renderer.fireEvent(handler,'pointerMove',clockEvent(group,hand,13,6,target));expect(api.state.timer.studyMs).toBe((2*60+25)*60000);
 await act(async()=>api.dispatch({type:'TIMER_START',now:Date.now()}));
 await renderer.fireEvent(handler,'pointerDown',clockEvent(group,hand,13,7,target));expect(api.state.timer.studyMs).toBe((2*60+25)*60000);
 await renderer.unmount();
});
it('rotates actual CD artwork only while audio plays and leaves its case stationary',async()=>{
 const renderer=await mount(<CDPlayer/>),scene=renderer.scene.instance;
 const disc=findNode(scene,'CD_ROTATION_ROOT - animate this'),body=findNode(scene,'Main silver rounded CD player body');
 scene.updateMatrixWorld(true);const bodyMatrix=body.matrixWorld.clone(),start=disc.rotation.z;
 await act(async()=>renderer.advanceFrames(30,1/60));expect(disc.rotation.z).toBe(start);
 await act(async()=>api.dispatch({type:'AUDIO',status:'playing'}));await act(async()=>renderer.advanceFrames(30,1/60));
 expect(disc.rotation.z).toBeCloseTo(start-.9);scene.updateMatrixWorld(true);expect(body.matrixWorld.equals(bodyMatrix)).toBe(true);
 await act(async()=>api.dispatch({type:'AUDIO',status:'paused'}));const paused=disc.rotation.z;await act(async()=>renderer.advanceFrames(60,1/60));expect(disc.rotation.z).toBe(paused);
 await act(async()=>api.dispatch({type:'AUDIO',status:'error'}));await act(async()=>renderer.advanceFrames(30,1/60));expect(disc.rotation.z).toBe(paused);await renderer.unmount();
});
it('fades real steam strength gradually and updates rising particle positions and alpha',async()=>{
 const renderer=await create(<Steam active={false}/>),points=renderer.scene.findByType('Points').instance;
 await act(async()=>renderer.advanceFrames(1,1/60));expect(points.material.uniforms.strength.value).toBe(0);
 const before=points.geometry.attributes.position.array.slice();
 await renderer.update(<Steam active/>);await act(async()=>renderer.advanceFrames(60,1/60));const peak=points.material.uniforms.strength.value;
 expect(peak).toBeGreaterThan(.8);expect(Array.from(points.geometry.attributes.position.array)).not.toEqual(Array.from(before));expect(Math.max(...points.geometry.attributes.alpha.array)).toBeGreaterThan(0);
 await renderer.update(<Steam active={false}/>);await act(async()=>renderer.advanceFrames(1,1/60));expect(points.material.uniforms.strength.value).toBeGreaterThan(0);expect(points.material.uniforms.strength.value).toBeLessThan(peak);
 await act(async()=>renderer.advanceFrames(180,1/60));expect(points.material.uniforms.strength.value).toBeLessThan(.01);await renderer.unmount();
});
it('only enables cup steam during a running break',async()=>{
 const renderer=await mount(<Tea/>),points=renderer.scene.findByType('Points').instance;
 await act(async()=>api.dispatch({type:'TIMER_START',now:Date.now()}));await act(async()=>renderer.advanceFrames(60,1/60));expect(points.material.uniforms.strength.value).toBe(0);
 await act(async()=>api.dispatch({type:'TIMER_BREAK',now:Date.now()}));await act(async()=>renderer.advanceFrames(60,1/60));expect(points.material.uniforms.strength.value).toBeGreaterThan(.8);
 await act(async()=>api.dispatch({type:'TIMER_PAUSE',now:Date.now()}));await act(async()=>renderer.advanceFrames(180,1/60));expect(points.material.uniforms.strength.value).toBeLessThan(.01);await renderer.unmount();
});
it('guided throw traverses real physics into the bin and adds exactly one persistent paper mesh',async()=>{
 const ref=createRef();const renderer=await mount(<Bin ref={ref}/>,{papers:[{taskId:'one',status:'crumpled',completedAt:1},{taskId:'two',status:'ready',completedAt:2}]});
 let launched;await act(async()=>{launched=ref.current.throwPaper('one');});expect(launched).toBe(true);expect(api.state.papers[0].status).toBe('throwing');
 const ball=renderer.scene.findByProps({name:'pending-one'}).instance,start=ball.position.clone();
 await act(async()=>renderer.advanceFrames(10,1/60));expect(ball.position.distanceTo(start)).toBeGreaterThan(.1);
 await act(async()=>renderer.advanceFrames(120,1/60));expect(api.state.papers[0].status).toBe('binned');
 expect(renderer.scene.findAll(node=>node.instance.name==='paper-one')).toHaveLength(1);expect(api.state.papers.filter(p=>p.status==='binned')).toHaveLength(1);
 await act(async()=>{expect(ref.current.throwPaper('one')).toBe(false);expect(ref.current.throwPaper('two')).toBe(false);});
 await renderer.unmount();
});
it('returns missed paper for retry and bins it on the next guided throw',async()=>{
 const ref=createRef(),renderer=await mount(<Bin ref={ref}/>,{papers:[{taskId:'retry',status:'crumpled',completedAt:1}]});
 await act(async()=>{expect(ref.current.throwPaper('retry',[5,2,4])).toBe(true);});
 await act(async()=>renderer.advanceFrames(120,1/60));expect(api.state.papers[0].status).toBe('crumpled');
 expect(renderer.scene.findAll(node=>node.instance.name==='paper-retry')).toHaveLength(0);
 await act(async()=>{expect(ref.current.throwPaper('retry')).toBe(true);});await act(async()=>renderer.advanceFrames(120,1/60));
 expect(api.state.papers[0].status).toBe('binned');expect(renderer.scene.findAll(node=>node.instance.name==='paper-retry')).toHaveLength(1);await renderer.unmount();
});
it('restores a flying paper to crumpled when the bin view unmounts',async()=>{
 const ref=createRef(),renderer=await mount(<Bin ref={ref}/>,{papers:[{taskId:'flight',status:'crumpled',completedAt:1}]});
 await act(async()=>ref.current.throwPaper('flight'));await act(async()=>renderer.advanceFrames(5,1/60));expect(api.state.papers[0].status).toBe('throwing');
 await renderer.update(<StudyProvider storage={null}><Probe/></StudyProvider>);expect(api.state.papers[0].status).toBe('crumpled');await renderer.unmount();
});
