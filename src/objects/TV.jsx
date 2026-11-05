import React,{useRef} from 'react';
import {Html} from '@react-three/drei';
import {useFrame} from '@react-three/fiber';
import {InteractiveGLB,usePreparedModel} from './InteractiveGLB.jsx';
import {TVScreenView} from '../Controls.jsx';
import {useStudy} from '../core/StudyProvider.jsx';
import {approach} from '../controllers/AnimationController.jsx';
export function TV({assetBase,onApplyAudio,aiRecommend}){
 const model=usePreparedModel('TV.glb',assetBase),glow=useRef(),study=useStudy();
 useFrame((_,dt)=>{if(glow.current)glow.current.intensity=approach(glow.current.intensity,.6,3,dt);});
 return <InteractiveGLB model={model}>
  <pointLight ref={glow} position={[0,2.65,1.3]} color="#b6dbb7" intensity={0} distance={4}/>
  <Html transform distanceFactor={4} position={[0,2.64,1.063]} zIndexRange={[30,20]}><TVScreenView study={study} onApplyAudio={onApplyAudio} aiRecommend={aiRecommend}/></Html>
 </InteractiveGLB>;
}
