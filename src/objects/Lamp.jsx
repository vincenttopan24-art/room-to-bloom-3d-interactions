import React,{useMemo} from 'react';
import {useFrame} from '@react-three/fiber';
import {findNode} from '../core/rigs.js';
import {useStudyState} from '../core/StudyProvider.jsx';
import {InteractiveGLB,usePreparedModel} from './InteractiveGLB.jsx';
export function Lamp({assetBase}){const model=usePreparedModel('red table lamp.glb',assetBase),bulb=useMemo(()=>findNode(model.scene,'Visible white bulb'),[model]);const {lighting}=useStudyState();useFrame(()=>{if(bulb?.material?.emissive){bulb.material.emissive.set('#ffce79');bulb.material.emissiveIntensity=.1+(1-lighting)*.8;}});return <InteractiveGLB model={model}/>;}
