import {Box3,Group,Vector3,PropertyBinding} from 'three';

export function findNode(scene,name) {
  return scene.getObjectByName(name) || scene.getObjectByName(PropertyBinding.sanitizeNodeName(name));
}
export function prepareModel(original) {
  const scene=original.clone(true),materials=[];
  const floors=[];
  scene.traverse(n=>{
    if (/studio.?floor/i.test(n.name)) floors.push(n);
    if(n.isMesh){
      n.castShadow=true; n.receiveShadow=true;
      n.material=Array.isArray(n.material)?n.material.map(m=>{const c=m.clone();materials.push(c);return c;}):n.material.clone();
      if(!Array.isArray(n.material))materials.push(n.material);
    }
  });
  floors.forEach(n=>n.removeFromParent());
  scene.updateMatrixWorld(true);
  const bounds=new Box3().setFromObject(scene);
  return {scene,bounds,center:bounds.getCenter(new Vector3()),size:bounds.getSize(new Vector3()),dispose:()=>materials.forEach(m=>m.dispose())};
}
function pivot(scene,position,nodes,name){
  const group=new Group();group.name=name;group.position.copy(position);scene.add(group);scene.updateMatrixWorld(true);
  nodes.filter(Boolean).forEach(n=>group.attach(n));return group;
}
export function clockRig(scene){
  const pin=findNode(scene,'Clock Center Pin');
  if(!pin)throw new Error('Clock Center Pin missing in this GLB');
  const origin=pin.getWorldPosition(new Vector3());origin.z=.6;
  const hand=(name)=>{
    const mesh=findNode(scene,name);if(!mesh)throw new Error(`${name} missing`);
    const center=mesh.getWorldPosition(new Vector3());
    const base=Math.atan2(center.x-origin.x,center.y-origin.y);
    return {hand:mesh,pivot:pivot(scene,origin,[mesh],`${name} pivot`),base};
  };
  const hours=hand('Minute Hand'), minutes=hand('Hour Hand');
  const second=findNode(scene,'Second Hand');if(second)second.visible=false;
  return {hours,minutes,origin,set(h,m,hourSteps=12){hours.pivot.rotation.z=hours.base-h/hourSteps*Math.PI*2;minutes.pivot.rotation.z=minutes.base-m/60*Math.PI*2;}};
}
export function discRig(scene){
  const root=findNode(scene,'CD_ROTATION_ROOT - animate this');if(!root)throw new Error('Latest CD rotation root missing');
  const selected=[];
  scene.traverse(n=>{
    if(n.isMesh&&/^(CD_(green_meadow|printed_sky|reflective_perimeter)|Colorful_flower_petal|Flower_(leaf|stem|yellow_center)|Soft_white_cloud|Red_fuzzy_flower_cluster)/i.test(n.name))selected.push(n);
  });
  scene.updateMatrixWorld(true);selected.forEach(n=>root.attach(n));return root;
}
export function bookRig(scene){
  const names=['Top Royal Blue Hardcover','Planning White Cover Title','Boat Flag Pole','Boat Roof','Boat White Cabin','Red Boat Flag','Red Boat Hull','Rocket Flame','White Rocket Illustration','White Sea Wave 0','White Sea Wave 1','White Sea Wave 2'];
  const cover=pivot(scene,new Vector3(-1.825,.68,0),names.map(n=>findNode(scene,n)),'Cover spine pivot');
  return {cover,spine:[-1.685,.615,0],pageWidth:3.42,pageHeight:4.5};
}
// Geometry lives in XY; the page group rotates -PI/2 around X onto the book.
export function deformPage(geometry,progress,width){
  const p=geometry.attributes.position;
  if(!geometry.userData.rest)geometry.userData.rest=p.array.slice();
  const rest=geometry.userData.rest,t=Math.max(0,Math.min(1,progress));
  for(let i=0;i<p.count;i++){
    const u=rest[i*3]+width/2, y=rest[i*3+1];
    const theta=Math.PI*t+.22*Math.sin(Math.PI*t)*Math.sin(u/width*Math.PI);
    p.setXYZ(i,u*Math.cos(theta),y,u*Math.sin(theta));
  }
  p.needsUpdate=true;geometry.computeVertexNormals();
}
export function paperPosition(start,velocity,seconds,gravity=9.81){return [start[0]+velocity[0]*seconds,start[1]+velocity[1]*seconds-gravity*seconds*seconds/2,start[2]+velocity[2]*seconds];}
export function binCrossing(previous,current,bin,paperRadius=.08){
  const y=bin.center[1];if(previous[1]<=y||current[1]>y||current[1]>=previous[1])return false;
  const t=(previous[1]-y)/(previous[1]-current[1]);
  const x=previous[0]+(current[0]-previous[0])*t-bin.center[0], z=previous[2]+(current[2]-previous[2])*t-bin.center[2];
  return Math.hypot(x,z)<=bin.radius-paperRadius;
}
export function screenToPlane(clientX,clientY,rect){return [(clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1];}
export function paperSlot(index){
  const ring=index%7,layer=Math.floor(index/7),r=ring===0?0:.28;
  return [Math.cos(ring*2.4)*r,.19+layer*.135,Math.sin(ring*2.4)*r];
}
