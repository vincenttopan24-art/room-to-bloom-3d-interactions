import React,{forwardRef,useRef,useImperativeHandle,useMemo,useEffect} from 'react';
import {useFrame} from '@react-three/fiber';
import {Vector3,Plane,Matrix4,IcosahedronGeometry} from 'three';
import {useStudy} from '../core/StudyProvider.jsx';
import {paperPosition,binCrossing,paperSlot} from '../core/rigs.js';
import {InteractiveGLB,usePreparedModel} from './InteractiveGLB.jsx';
const START=[-1.15,1.8,.6],BIN={center:[0,1.35,0],radius:.63},RADIUS=.1;
export const Bin=forwardRef(function Bin({assetBase},ref){
 const model=usePreparedModel('rubbish can.glb',assetBase),{state,dispatch}=useStudy();
 const root=useRef(),ball=useRef(),body=useRef(),flight=useRef(null),drag=useRef(null),bounce=useRef(0);
 const pending=state.papers.find(p=>p.status!=='binned');
 const stateRef=useRef(state);stateRef.current=state;
 const paperGeometry=useMemo(()=>{
  const g=new IcosahedronGeometry(RADIUS,2),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),rough=1+.14*Math.sin(x*97+y*61+z*83);p.setXYZ(i,x*rough,y*rough,z*rough);}g.computeVertexNormals();return g;
 },[]);
 useEffect(()=>()=>paperGeometry.dispose(),[paperGeometry]);
 const launch=(id,velocity,start=START)=>{
  if(flight.current||!stateRef.current.papers.some(p=>p.taskId===id&&p.status==='crumpled'))return false;
  const duration=.7,v=velocity||[(0-start[0])/duration,(.45-start[1]+4.905*duration*duration)/duration,(0-start[2])/duration];
  flight.current={id,start:[...start],velocity:v,t:0,previous:[...start],caught:false};dispatch({type:'THROW_PAPER',id});return true;
 };
 useImperativeHandle(ref,()=>({throwPaper:launch}),[]);
 useEffect(()=>{if(ball.current&&!flight.current&&!drag.current)ball.current.position.set(...START);},[pending?.taskId,pending?.status]);
 useEffect(()=>()=>{if(flight.current)dispatch({type:'MISS_PAPER',id:flight.current.id});},[dispatch]);
 const localPointer=e=>{
  const ray=e.ray.clone().applyMatrix4(new Matrix4().copy(root.current.matrixWorld).invert());
  return ray.intersectPlane(new Plane(new Vector3(0,0,1),-START[2]),new Vector3());
 };
 useFrame((_,dt)=>{
  const f=flight.current;
  if(f&&ball.current){
   f.t+=dt;let current=paperPosition(f.start,f.velocity,f.t);
   if(!f.caught&&binCrossing(f.previous,current,BIN,RADIUS))f.caught=true;
   if(f.caught){current[0]*=Math.exp(-4*dt);current[2]*=Math.exp(-4*dt);}
   ball.current.position.set(...current);ball.current.rotation.x+=dt*4;ball.current.rotation.z+=dt*3;
   const slot=paperSlot(stateRef.current.papers.filter(p=>p.status==='binned').length);
   if(f.caught&&current[1]<=slot[1]){dispatch({type:'BIN_PAPER',id:f.id});flight.current=null;bounce.current=.16;}
   else if(!f.caught&&(current[1]<=.12||f.t>3)){dispatch({type:'MISS_PAPER',id:f.id});flight.current=null;ball.current.position.set(...START);}
   else f.previous=current;
  }
  if(body.current){bounce.current*=Math.exp(-8*dt);const offset=Math.sin(bounce.current*55)*bounce.current;body.current.position.y=offset;model.scene.position.y=offset;}
 });
 return <InteractiveGLB model={model} groupRef={root}>
  <group ref={body}>
   {state.papers.filter(p=>p.status==='binned').map((p,i)=><mesh key={p.taskId} name={`paper-${p.taskId}`} position={paperSlot(i)} geometry={paperGeometry} rotation={[i*.7,i*1.3,i*.4]}><meshStandardMaterial color="#f4edcf" roughness={1}/></mesh>)}
  </group>
  {pending&&<mesh ref={ball} name={`pending-${pending.taskId}`} position={START} geometry={paperGeometry} scale={pending.status==='ready'?[1.6,.15,2]:1} onPointerDown={e=>{
   if(pending.status!=='crumpled'||flight.current)return;e.stopPropagation();e.target.setPointerCapture(e.pointerId);const p=localPointer(e);if(p)drag.current={id:pending.taskId,start:p.clone(),last:p.clone(),time:performance.now()};
  }} onPointerMove={e=>{if(!drag.current||!ball.current)return;e.stopPropagation();const p=localPointer(e);if(p){ball.current.position.copy(p);drag.current.last=p;}}} onPointerUp={e=>{
   if(!drag.current)return;const d=drag.current;drag.current=null;e.target.releasePointerCapture?.(e.pointerId);const end=ball.current.position.toArray();
   const elapsed=Math.max(.12,(performance.now()-d.time)/1000),v=d.last.clone().sub(d.start).divideScalar(elapsed);
   launch(d.id,[v.x,Math.max(1.1,v.y),-1.8],end);
  }} onLostPointerCapture={()=>{drag.current=null;}}><meshStandardMaterial color="#f4edcf" roughness={1}/></mesh>}
 </InteractiveGLB>;
});
