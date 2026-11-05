import React,{useMemo,useRef,useEffect} from 'react';
import {Matrix4,Plane,Vector3} from 'three';
import {useStudy} from '../core/StudyProvider.jsx';
import {clockRig} from '../core/rigs.js';
import {angleFromPoint,angleToValue} from '../core/study.js';
import {usePreparedModel,InteractiveGLB} from './InteractiveGLB.jsx';
export function Clock({assetBase}){
 const model=usePreparedModel('alarm_clock.glb',assetBase),rig=useMemo(()=>clockRig(model.scene),[model]);
 const {state,dispatch,limits}=useStudy(),root=useRef(),drag=useRef(null);
 useEffect(()=>{const h=Math.floor(state.timer.studyMs/3600000),m=Math.floor(state.timer.studyMs/60000)%60;rig.set(h,m,limits.maxHours+1);},[state.timer.studyMs,limits.maxHours,rig]);
 const update=e=>{
  if(!drag.current||!root.current)return;e.stopPropagation();
  root.current.updateWorldMatrix(true,false);
  const ray=e.ray.clone().applyMatrix4(new Matrix4().copy(root.current.matrixWorld).invert());
  const p=ray.intersectPlane(new Plane(new Vector3(0,0,1),-.6),new Vector3());if(!p)return;
  const a=angleFromPoint(p.x-rig.origin.x,-(p.y-rig.origin.y));
  let h=Math.floor(state.timer.studyMs/3600000),m=Math.floor(state.timer.studyMs/60000)%60;
  if(drag.current==='hours')h=angleToValue(a,limits.maxHours+1);else m=Math.min(limits.maxMinutes,angleToValue(a,60));
  dispatch({type:'TIMER_SET',studyMs:(h*60+m)*60000});
 };
 return <InteractiveGLB model={model} groupRef={root} onPointerDown={e=>{
  if(state.timer.status==='running')return;
  const hand=e.object===rig.hours.hand?'hours':e.object===rig.minutes.hand?'minutes':null;if(!hand)return;
  e.stopPropagation();drag.current=hand;e.target.setPointerCapture(e.pointerId);update(e);
 }} onPointerMove={update} onPointerUp={e=>{drag.current=null;e.target.releasePointerCapture?.(e.pointerId);}} onLostPointerCapture={()=>{drag.current=null;}}/>;
}
