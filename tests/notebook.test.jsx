import React from 'react';
import {it,expect,vi,beforeEach} from 'vitest';
import {create,act} from '@react-three/test-renderer';
import {Group,Mesh,BoxGeometry,MeshStandardMaterial} from 'three';
const shared=vi.hoisted(()=>({state:{book:{open:false,page:0,turn:0},mainTask:'Finish the project',tasks:[{id:'a',text:'Read chapter',completed:false}]},model:null,dispose:vi.fn()}));
vi.mock('../src/core/StudyProvider.jsx',()=>({useStudyState:()=>shared.state}));
vi.mock('../src/objects/InteractiveGLB.jsx',()=>({usePreparedModel:()=>shared.model,InteractiveGLB:({model,children})=><group><primitive object={model.scene}/>{children}</group>}));
import {Notebook} from '../src/objects/Notebook.jsx';
beforeEach(()=>{
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 shared.state={book:{open:false,page:0,turn:0},mainTask:'Finish the project',tasks:[{id:'a',text:'Read chapter',completed:false}]};
 const scene=new Group();
 for(const name of ['Top Royal Blue Hardcover','Planning White Cover Title','Thick Cream Paper Block']){const mesh=new Mesh(new BoxGeometry(1,.1,1),new MeshStandardMaterial());mesh.name=name;scene.add(mesh);}
 shared.model={scene};
 vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue({fillStyle:'',font:'',textBaseline:'',clearRect:vi.fn(),fillRect:vi.fn(),fillText:vi.fn(),beginPath:vi.fn(),moveTo:vi.fn(),lineTo:vi.fn(),stroke:vi.fn(),measureText:t=>({width:t.length*12})});
});
it('opens the original rigged hardcover and leaves the paper block in place',async()=>{
 const renderer=await create(<Notebook/>);
 const cover=shared.model.scene.getObjectByName('Cover spine pivot');expect(cover.rotation.z).toBe(0);
 const block=shared.model.scene.getObjectByName('Thick Cream Paper Block'),before=block.position.clone();
 shared.state={...shared.state,book:{...shared.state.book,open:true}};await renderer.update(<Notebook/>);await act(async()=>renderer.advanceFrames(60,1/60));
 expect(cover.rotation.z).toBeGreaterThan(2.8);expect(block.position.equals(before)).toBe(true);
 await renderer.unmount();
});
it('bends a segmented real mesh on forward turn and reverses when navigating back',async()=>{
 shared.state.book.open=true;const renderer=await create(<Notebook/>);
 shared.state={...shared.state,book:{open:true,page:1,turn:1}};await renderer.update(<Notebook/>);await act(async()=>renderer.advanceFrames(10,1/60));
 const page=renderer.scene.findByProps({name:'notebook-turning-page'}).instance;
 expect(page.visible).toBe(true);expect(page.geometry.attributes.position.count).toBeGreaterThan(100);
 const z=()=>Math.max(...Array.from({length:page.geometry.attributes.position.count},(_,i)=>page.geometry.attributes.position.getZ(i)));
 expect(z()).toBeGreaterThan(.3);
 await act(async()=>renderer.advanceFrames(80,1/60));expect(page.visible).toBe(false);
 shared.state={...shared.state,book:{open:true,page:0,turn:2}};await renderer.update(<Notebook/>);await act(async()=>renderer.advanceFrames(10,1/60));
 expect(page.visible).toBe(true);expect(z()).toBeGreaterThan(.3);
 await act(async()=>renderer.advanceFrames(80,1/60));expect(page.visible).toBe(false);
 await renderer.unmount();
});
it('uses canvas text textures and disposes owned page geometry and textures on unmount',async()=>{
 shared.state.book.open=true;const renderer=await create(<Notebook/>);
 const page=renderer.scene.findByProps({name:'notebook-current-page'}).instance;
 expect(page.material.map.isCanvasTexture).toBe(true);expect(page.rotation.x).toBeCloseTo(-Math.PI/2);
 const geometryDispose=vi.spyOn(page.geometry,'dispose'),textureDispose=vi.spyOn(page.material.map,'dispose');
 await renderer.unmount();expect(geometryDispose).toHaveBeenCalled();expect(textureDispose).toHaveBeenCalled();
});
it('reveals updated handwriting only while the book is open',async()=>{
 const renderer=await create(<Notebook/>);const ctx=document.createElement('canvas').getContext('2d');ctx.fillText.mockClear();
 shared.state={...shared.state,mainTask:'New goal'};await renderer.update(<Notebook/>);await act(async()=>renderer.advanceFrames(60,1/60));
 expect(ctx.fillText.mock.calls.some(([text])=>text==='New goal')).toBe(false);
 shared.state={...shared.state,book:{...shared.state.book,open:true}};await renderer.update(<Notebook/>);await act(async()=>renderer.advanceFrames(60,1/60));
 expect(ctx.fillText.mock.calls.some(([text])=>text==='New goal')).toBe(true);await renderer.unmount();
});
it('queues rapid forward and backward turns and preserves each queued text snapshot',async()=>{
 shared.state.book.open=true;shared.state.tasks=[{id:'a',text:'First draft',completed:false},{id:'b',text:'Second draft',completed:false}];
 const renderer=await create(<Notebook/>),ctx=document.createElement('canvas').getContext('2d');
 const page=renderer.scene.findByProps({name:'notebook-turning-page'}).instance;
 shared.state={...shared.state,book:{open:true,page:1,turn:1}};await renderer.update(<Notebook/>);await act(async()=>renderer.advanceFrames(10,1/60));
 shared.state={...shared.state,book:{open:true,page:2,turn:2},tasks:[{...shared.state.tasks[0],text:'Revised first'},shared.state.tasks[1]]};await renderer.update(<Notebook/>);await act(async()=>renderer.advanceFrames(10,1/60));
 shared.state={...shared.state,book:{open:true,page:0,turn:3}};await renderer.update(<Notebook/>);
 ctx.fillText.mockClear();
 await act(async()=>renderer.advanceFrames(40,1/60));
 expect(page.visible).toBe(true);
 expect(ctx.fillText.mock.calls.some(([text])=>text==='First draft')).toBe(true);
 expect(ctx.fillText.mock.calls.some(([text])=>text==='Revised first')).toBe(false);
 await act(async()=>renderer.advanceFrames(50,1/60));
 expect(page.visible).toBe(true);
 // The final queued navigation is backwards, so its sheet starts on the left.
 expect(page.geometry.attributes.position.getX(48)).toBeLessThan(0);
 await act(async()=>renderer.advanceFrames(60,1/60));expect(page.visible).toBe(false);
 await renderer.unmount();
});
it('turns each new task even when React receives multiple additions in one state update',async()=>{
 shared.state.book.open=true;shared.state.tasks=[];const renderer=await create(<Notebook/>);
 shared.state={...shared.state,book:{open:true,page:2,turn:2},tasks:[{id:'one',text:'First addition',completed:false},{id:'two',text:'Second addition',completed:false}]};
 await renderer.update(<Notebook/>);const page=renderer.scene.findByProps({name:'notebook-turning-page'}).instance;
 await act(async()=>renderer.advanceFrames(60,1/60));expect(page.visible).toBe(true);
 await act(async()=>renderer.advanceFrames(60,1/60));expect(page.visible).toBe(false);await renderer.unmount();
});
