import React,{useMemo,useEffect} from 'react';
import {useGLTF} from '@react-three/drei';
import {prepareModel} from '../core/rigs.js';
import {assetUrl} from '../core/rooms.js';
export function usePreparedModel(filename,assetBase){
 const gltf=useGLTF(assetUrl(filename,assetBase));
 const model=useMemo(()=>prepareModel(gltf.scene),[gltf.scene]);
 useEffect(()=>()=>model.dispose(),[model]);return model;
}
export function InteractiveGLB({model,children,rotation=[0,0,0],scale:customScale,center:customCenter,groupRef,...props}){
 const factor=customScale||3.6/Math.max(model.size.x,model.size.y,model.size.z);
 const center=customCenter||model.center.toArray();
 return <group rotation={rotation}><group ref={groupRef} scale={factor} position={center.map(v=>-v*factor)} {...props}><primitive object={model.scene}/>{children}</group></group>;
}
