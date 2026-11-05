import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Vector3} from 'three';
export const approach=(current,target,speed,delta)=>target+(current-target)*Math.exp(-speed*delta);
export function steamParticle(age,seed){
 const t=Math.min(1,Math.max(0,age));return [Math.sin(t*8+seed*3)*(.04+t*.11),t*1.25,Math.cos(t*6+seed)*.08,(t===0||t===1?0:Math.sin(Math.PI*t)*.22)];
}
export function CameraFocusController({focused,target=[0,1,6],lookAt=[0,0,0],onReturned}){
 const {camera}=useThree();
 const home=useRef(camera.position.clone()),homeQuaternion=useRef(camera.quaternion.clone());
 const callback=useRef(onReturned);callback.current=onReturned;
 const settled=useRef(false),destination=useRef(new Vector3()),look=useRef(new Vector3());
 useEffect(()=>{settled.current=false;},[focused]);
 useFrame((_,delta)=>{
  if(focused)destination.current.set(...target);else destination.current.copy(home.current);
  const alpha=1-Math.exp(-5*delta);camera.position.lerp(destination.current,alpha);
  if(focused){look.current.set(...lookAt);camera.lookAt(look.current);}else camera.quaternion.slerp(homeQuaternion.current,alpha);
  if(!focused&&!settled.current&&camera.position.distanceTo(home.current)<.025){settled.current=true;callback.current?.();}
 });
 return null;
}
