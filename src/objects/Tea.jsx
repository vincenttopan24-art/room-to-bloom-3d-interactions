import React,{useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {BufferGeometry,BufferAttribute,ShaderMaterial} from 'three';
import {useStudyState} from '../core/StudyProvider.jsx';
import {approach,steamParticle} from '../controllers/AnimationController.jsx';
import {InteractiveGLB,usePreparedModel} from './InteractiveGLB.jsx';
import {useEffect} from 'react';
export function Steam({active}){
 const strength=useRef(0),time=useRef(0);
 const {geometry,material}=useMemo(()=>{
  const geometry=new BufferGeometry();geometry.setAttribute('position',new BufferAttribute(new Float32Array(40*3),3));geometry.setAttribute('alpha',new BufferAttribute(new Float32Array(40),1));
  const material=new ShaderMaterial({transparent:true,depthWrite:false,uniforms:{strength:{value:0}},vertexShader:`attribute float alpha; varying float a; void main(){a=alpha;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(105./max(1.,-p.z),8.,100.);}`,fragmentShader:`uniform float strength; varying float a; void main(){float d=length(gl_PointCoord-vec2(.5))*2.;float soft=pow(max(0.,1.-d),2.);gl_FragColor=vec4(.96,.95,.9,soft*a*strength);}`});return {geometry,material};
 },[]);
 useEffect(()=>()=>{geometry.dispose();material.dispose();},[geometry,material]);
 useFrame((_,dt)=>{
  strength.current=approach(strength.current,active?1:0,1.8,dt);material.uniforms.strength.value=strength.current;time.current+=dt;
  for(let i=0;i<40;i++){const age=(time.current*.17+i/40)%1,[x,y,z,a]=steamParticle(age,i);geometry.attributes.position.setXYZ(i,x*2.2,y*1.7,z*2);geometry.attributes.alpha.setX(i,a);}
  geometry.attributes.position.needsUpdate=true;geometry.attributes.alpha.needsUpdate=true;
 });
 return <points position={[0,2.36,0]} geometry={geometry} material={material} frustumCulled={false}/>;
}
export function Tea({assetBase}){const model=usePreparedModel('tea cup.glb',assetBase),state=useStudyState();return <InteractiveGLB model={model}><Steam active={state.timer.phase==='break'&&state.timer.status==='running'}/></InteractiveGLB>;}
