import React,{useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {CanvasTexture,PlaneGeometry,MeshStandardMaterial,MeshBasicMaterial,FrontSide,BackSide,SRGBColorSpace} from 'three';
import {useStudyState} from '../core/StudyProvider.jsx';
import {bookRig,deformPage} from '../core/rigs.js';
import {usePreparedModel,InteractiveGLB} from './InteractiveGLB.jsx';

function pageText(state,page){
 if(page===0)return {heading:'My main task',text:state.mainTask||'A little focus, a little progress.',label:'01'};
 const task=state.tasks[page-1];
 return {heading:`Step ${page}${task?.completed?' · Complete':''}`,text:task?.text||'',label:String(page+1).padStart(2,'0')};
}
function wrap(context,text,width){
 const lines=[];let line='';
 for(const paragraph of text.split('\n')){
  for(const word of paragraph.split(/\s+/)){
   if(!word)continue;
   if(context.measureText(`${line} ${word}`.trim()).width<=width){line=`${line} ${word}`.trim();continue;}
   if(line){lines.push(line);line='';}
   for(const letter of word){if(context.measureText(line+letter).width>width){lines.push(line);line='';}line+=letter;}
  }
  lines.push(line);line='';
 }
 return lines;
}
function createPageTexture(){
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=1024;
 const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;texture.anisotropy=4;
 return {canvas,texture};
}
function drawPage(surface,content,characters){
 const ctx=surface.canvas.getContext('2d');if(!ctx)return;
 ctx.fillStyle='#fff7df';ctx.fillRect(0,0,768,1024);
 ctx.strokeStyle='#e1d4ac';ctx.lineWidth=2;
 for(let y=240;y<920;y+=48){ctx.beginPath();ctx.moveTo(66,y);ctx.lineTo(702,y);ctx.stroke();}
 ctx.fillStyle='#968266';ctx.font='20px sans-serif';ctx.fillText('ROOM TO BLOOM',66,72);ctx.fillText(content.label,665,962);
 ctx.fillStyle='#263f6b';ctx.font='bold 48px "Segoe Print", "Bradley Hand", cursive';ctx.fillText(content.heading,66,150);
 let size=56,lines;
 do{ctx.font=`${size}px "Segoe Print", "Bradley Hand", cursive`;lines=wrap(ctx,content.text,636);size-=2;}while(lines.length*(size+12)>710&&size>=16);
 const visible=content.text.slice(0,characters),drawn=wrap(ctx,visible,636);ctx.fillStyle='#314a70';
 const lineHeight=Math.max(32,size+12);
 drawn.forEach((line,index)=>{if(225+index*lineHeight<930)ctx.fillText(line,66,225+index*lineHeight);});
 surface.texture.needsUpdate=true;
}
export function Notebook({assetBase}){
 const model=usePreparedModel('planning_book_3d.glb',assetBase),rig=useMemo(()=>bookRig(model.scene),[model]);
 const state=useStudyState(),turnMesh=useRef(),backMesh=useRef(),staticMesh=useRef();
 const resources=useMemo(()=>{
  const flat=new PlaneGeometry(rig.pageWidth,rig.pageHeight,32,12),turning=new PlaneGeometry(rig.pageWidth,rig.pageHeight,48,12);
  deformPage(flat,0,rig.pageWidth);deformPage(turning,0,rig.pageWidth);
  const current=createPageTexture(),front=createPageTexture();
  const paper=surface=>new MeshBasicMaterial({map:surface.texture,toneMapped:false,side:FrontSide});
  return {flat,turning,current,front,currentMaterial:paper(current),frontMaterial:paper(front),backMaterial:new MeshStandardMaterial({color:'#fff7df',roughness:.94,side:BackSide})};
 },[rig]);
 const selected=useRef({page:state.book.page,turn:state.book.turn,content:pageText(state,state.book.page)});
 const displayed=useRef(selected.current),queue=useRef([]),knownTasks=useRef(new Set(state.tasks.map(t=>t.id)));
 const animation=useRef({running:false,progress:0,direction:1,to:null});
 const reveal=useRef({elapsed:0,last:-1,content:pageText(state,state.book.page)});
 useEffect(()=>()=>{
  queue.current=[];animation.current.running=false;
  resources.flat.dispose();resources.turning.dispose();resources.current.texture.dispose();resources.front.texture.dispose();
  resources.currentMaterial.dispose();resources.frontMaterial.dispose();resources.backMaterial.dispose();
 },[resources]);
 const task=state.tasks[state.book.page-1];
 useEffect(()=>{
  const previous=selected.current,snapshot={page:state.book.page,turn:state.book.turn,content:pageText(state,state.book.page)};
  // Queue immutable strings so a later task edit cannot rewrite an earlier sheet.
  if(previous.page!==snapshot.page||previous.turn!==snapshot.turn){
   const additions=state.tasks.flatMap((task,index)=>knownTasks.current.has(task.id)?[]:[{page:index+1,turn:snapshot.turn,content:pageText(state,index+1)}]);
   queue.current.push(...additions);
   if(!additions.length||additions.at(-1).page!==snapshot.page)queue.current.push(snapshot);
  }
  else if(!animation.current.running&&!queue.current.length){
   displayed.current=snapshot;
   reveal.current={elapsed:0,last:-1,content:snapshot.content};
   drawPage(resources.current,snapshot.content,0);
  }
  selected.current=snapshot;knownTasks.current=new Set(state.tasks.map(t=>t.id));
 },[state.book.page,state.book.turn,state.mainTask,state.tasks,task?.text,task?.completed,resources,rig]);
 useFrame((_,delta)=>{
  const step=Math.min(delta,.1),target=state.book.open?Math.PI*.93:0;
  rig.cover.rotation.z+=(target-rig.cover.rotation.z)*(1-Math.exp(-9*step));
  if(Math.abs(target-rig.cover.rotation.z)<.0001)rig.cover.rotation.z=target;
  let anim=animation.current;
  if(!anim.running&&queue.current.length){
   const to=queue.current.shift(),from=displayed.current,direction=to.page>=from.page?1:-1;
   anim=animation.current={running:true,progress:direction===1?0:1,direction,to};
   drawPage(resources.front,direction===1?from.content:to.content,Infinity);
   drawPage(resources.current,direction===1?to.content:from.content,Infinity);
  }
  if(anim.running){
   anim.progress=Math.max(0,Math.min(1,anim.progress+anim.direction*step/0.85));
   deformPage(resources.turning,anim.progress,rig.pageWidth);
   if(anim.progress===0&&anim.direction===-1||anim.progress===1&&anim.direction===1){
    anim.running=false;displayed.current=anim.to;
    const content=queue.current.length?anim.to.content:selected.current.content;
    reveal.current={elapsed:0,last:-1,content};
    drawPage(resources.current,content,queue.current.length?Infinity:0);
   }
  }
  const visible=rig.cover.rotation.z>.45;
  if(staticMesh.current)staticMesh.current.visible=visible;
  if(turnMesh.current)turnMesh.current.visible=visible&&anim.running;
  if(backMesh.current)backMesh.current.visible=visible&&anim.running;
  if(!anim.running&&!queue.current.length&&visible&&state.book.open){
   const writing=reveal.current;writing.elapsed+=step;
   const chars=Math.min(writing.content.text.length,Math.floor(writing.elapsed*55));
   if(chars!==writing.last){drawPage(resources.current,writing.content,chars);writing.last=chars;}
  }
 });
 return <InteractiveGLB model={model} scale={.48} center={[-1.825,.4,0]}>
  <mesh name="notebook-current-page" ref={staticMesh} geometry={resources.flat} material={resources.currentMaterial} position={rig.spine} rotation={[-Math.PI/2,0,0]} visible={false} receiveShadow dispose={null}/>
  <mesh name="notebook-turning-page" ref={turnMesh} geometry={resources.turning} material={resources.frontMaterial} position={[rig.spine[0],rig.spine[1]+.012,rig.spine[2]]} rotation={[-Math.PI/2,0,0]} visible={false} castShadow receiveShadow dispose={null}/>
  <mesh name="notebook-turning-page-back" ref={backMesh} geometry={resources.turning} material={resources.backMaterial} position={[rig.spine[0],rig.spine[1]+.012,rig.spine[2]]} rotation={[-Math.PI/2,0,0]} visible={false} castShadow receiveShadow dispose={null}/>
 </InteractiveGLB>;
}
