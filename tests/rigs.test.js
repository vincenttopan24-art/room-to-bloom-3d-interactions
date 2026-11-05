// @vitest-environment node
import {readFile} from 'node:fs/promises';
import {describe,it,expect} from 'vitest';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Vector3,PlaneGeometry} from 'three';
import {prepareModel,findNode,clockRig,discRig,bookRig,deformPage,paperPosition,binCrossing,screenToPlane} from '../src/core/rigs.js';
const load=async name=>{const b=await readFile(new URL('../public/assets/'+name,import.meta.url));return new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');};
describe('actual latest GLB rigs',()=>{
 it('removes studio floor only from clone and preserves original mesh material',async()=>{const {scene}=await load('tea cup.glb');const model=prepareModel(scene);expect(model.bounds.max.x-model.bounds.min.x).toBeLessThan(10);expect(findNode(scene,'White Studio Floor')).toBeTruthy();expect(model.scene.children.length).toBe(scene.children.length-1);});
 it('long hand controls hours around pin without changing body',async()=>{const {scene}=await load('alarm_clock.glb');const {scene:s}=prepareModel(scene);const rig=clockRig(s);const body=s.children.find(n=>n.isMesh&&n.name.includes('Bell'));const matrix=body.matrixWorld.clone();rig.set(3,30,12);s.updateMatrixWorld(true);expect(body.matrixWorld.equals(matrix)).toBe(true);expect(rig.hours.hand).toBe(findNode(s,'Minute Hand'));const p=rig.hours.hand.getWorldPosition(new Vector3());expect(p.x).toBeGreaterThan(.6);expect(Math.abs(p.y-2.25)).toBeLessThan(.01);});
 it('spins only disc and its printed artwork on the real Z axis',async()=>{const {scene}=await load('CD.glb');const {scene:s}=prepareModel(scene);const r=discRig(s);const body=findNode(s,'Main silver rounded CD player body');const matrix=body.matrixWorld.clone();r.rotation.z=.7;s.updateMatrixWorld(true);expect(body.matrixWorld.equals(matrix)).toBe(true);expect(findNode(s,'CD green meadow illustration').parent).toBe(r);expect(findNode(s,'Soft white cloud').parent).toBe(r);expect(findNode(s,'Red fuzzy flower cluster').parent.name).toBe(r.name);expect(findNode(s,'Outer CD bay ring').parent).not.toBe(r);});
 it('opens cover together with original title and illustration without moving paper block',async()=>{const {scene}=await load('planning_book_3d.glb');const {scene:s}=prepareModel(scene);const r=bookRig(s);const p=findNode(s,'Thick Cream Paper Block');const pos=p.getWorldPosition(new Vector3());r.cover.rotation.z=Math.PI*.85;s.updateMatrixWorld(true);expect(findNode(s,'Planning White Cover Title').parent).toBe(r.cover);expect(findNode(s,'White Rocket Illustration').parent).toBe(r.cover);expect(p.getWorldPosition(new Vector3()).distanceTo(pos)).toBeLessThan(.0001);});
});
describe('3D math',()=>{
 it('turning page bends in 3D and reaches opposite side',()=>{const g=new PlaneGeometry(3.4,4.5,24,2);deformPage(g,.5,3.4);const p=g.attributes.position;expect(Math.max(...Array.from({length:p.count},(_,i)=>p.getZ(i)))).toBeGreaterThan(.3);deformPage(g,1,3.4);expect(p.getX(p.count-1)).toBeLessThanOrEqual(0);g.dispose();});
 it('swept collision catches fast descending paper but rejects edges and upward paths',()=>{const bin={center:[0,1,0],radius:.6};expect(binCrossing([0,2,0],[0,0,0],bin,.1)).toBe(true);expect(binCrossing([.55,2,0],[.55,0,0],bin,.1)).toBe(false);expect(binCrossing([0,0,0],[0,2,0],bin,.1)).toBe(false);});
 it('paper parabola reaches floor rather than floating',()=>{const p=paperPosition([0,2,0],[1,1,0],2,9.81);expect(p[1]).toBeLessThan(0);expect(p[0]).toBe(2);});
 it('converts pointer coordinates using actual canvas bounding rect',()=>{const p=screenToPlane(200,150,{left:100,top:50,width:200,height:200});expect(p).toEqual([0,0]);});
});
