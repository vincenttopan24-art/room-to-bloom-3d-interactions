import React,{useMemo} from 'react';
import {useFrame} from '@react-three/fiber';
import {discRig} from '../core/rigs.js';
import {useStudyState} from '../core/StudyProvider.jsx';
import {InteractiveGLB,usePreparedModel} from './InteractiveGLB.jsx';
export function CDPlayer({assetBase}){
 const model=usePreparedModel('CD.glb',assetBase),disc=useMemo(()=>discRig(model.scene),[model]);const {audio}=useStudyState();
 useFrame((_,dt)=>{if(audio.status==='playing')disc.rotation.z=(disc.rotation.z-dt*1.8)%(Math.PI*2);});
 return <InteractiveGLB model={model}/>;
}
