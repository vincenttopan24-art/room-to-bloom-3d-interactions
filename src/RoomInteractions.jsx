import React,{Suspense,useEffect,useMemo,useRef,useState,Component} from 'react';
import {Canvas} from '@react-three/fiber';
import {Html,Environment,Lightformer} from '@react-three/drei';
import {StudyProvider,useStudy} from './core/StudyProvider.jsx';
import {formatDuration,remainingMs} from './core/study.js';
import {ROOMS} from './core/rooms.js';
import {HOTSPOTS} from './core/hotspots.js';
import {AudioController} from './controllers/AudioController.js';
import {RoomBackdrop} from './controllers/LightingController.jsx';
import {CameraFocusController} from './controllers/AnimationController.jsx';
import {TimerControls,NotebookControls,MusicControls,LampControls,BinControls} from './Controls.jsx';
import {Clock} from './objects/Clock.jsx';
import {Tea} from './objects/Tea.jsx';
import {TV} from './objects/TV.jsx';
import {Notebook} from './objects/Notebook.jsx';
import {CDPlayer} from './objects/CDPlayer.jsx';
import {Calendar} from './objects/Calendar.jsx';
import {Lamp} from './objects/Lamp.jsx';
import {Bin} from './objects/Bin.jsx';
import './styles.css';
export const OBJECTS=[
 {id:'clock',name:'Study clock',tag:'Find your rhythm',icon:'◷',hint:'Drag a hand, set a little time, and begin.'},
 {id:'notebook',name:'Planning notebook',tag:'One small step',icon:'▤',hint:'Open your notebook. Give each small step a page.'},
 {id:'cd',name:'CD player',tag:'A sound for your space',icon:'◎',hint:'Choose a sound. The disc moves with your music.'},
 {id:'tea',name:'Tea break',tag:'A moment to breathe',icon:'♨',hint:'Your tea comes to life during a timed break.'},
 {id:'tv',name:'Study recommendations',tag:'Make yourself at home',icon:'▣',hint:'Tell the TV what you’re working on.'},
 {id:'calendar',name:'Live calendar',tag:'Here, today',icon:'▦',hint:'Your local date, with a little circle around today.'},
 {id:'lamp',name:'Desk lamp',tag:'Let the light in',icon:'☼',hint:'From warm sunset to bright daylight, in the same room.'},
 {id:'bin',name:'Small wins',tag:'Room for what’s next',icon:'♧',hint:'Complete a step, crumple its paper, and give it a throw.'},
];
class ModelError extends Component{
 state={error:null};static getDerivedStateFromError(error){return {error};}
 render(){return this.state.error?<Html center><div role="alert" className="model-error"><p>This model could not be loaded.</p><small>{this.state.error.message}</small><button onClick={()=>{this.props.onRetry();this.setState({error:null});}}>Retry model</button></div></Html>:this.props.children;}
}
function ModelReady({onReady}){useEffect(()=>{onReady();},[onReady]);return null;}
function Model({id,binRef,assetBase,audioController,aiRecommend}){
 const props={assetBase};
 switch(id){case 'clock':return <Clock {...props}/>;case 'tea':return <Tea {...props}/>;case 'tv':return <TV {...props} aiRecommend={aiRecommend} onApplyAudio={i=>audioController?.play(i)}/>;case 'notebook':return <Notebook {...props}/>;case 'cd':return <CDPlayer {...props}/>;case 'calendar':return <Calendar {...props}/>;case 'lamp':return <Lamp {...props}/>;case 'bin':return <Bin {...props} ref={binRef}/>;default:return null;}
}
function ObjectInteractionManager({assetBase='/assets/',audioTracks,onCrumple,aiRecommend,initialObject}){
 const {state,dispatch,storageError}=useStudy(),[selected,setSelected]=useState(null),[audioError,setAudioError]=useState(''),[revision,setRevision]=useState(0),[modelLoading,setModelLoading]=useState(true);
 useEffect(()=>{if(OBJECTS.some(o=>o.id===initialObject))dispatch({type:'FOCUS',id:initialObject});},[initialObject,dispatch]);
 const bin=useRef(),dialog=useRef(),returnFocus=useRef(),lastActive=useRef();
 const [audioController,setAudioController]=useState(null);
 useEffect(()=>{const controller=new AudioController({tracks:audioTracks,onStateChange:s=>{dispatch({type:'AUDIO',...s});setAudioError(s.error||'');}});controller.setVolume(.4);setAudioController(controller);return ()=>controller.dispose();},[audioTracks,dispatch]);
 useEffect(()=>{if(state.active){setSelected(state.active);setModelLoading(true);if(!lastActive.current)returnFocus.current=document.activeElement;}lastActive.current=state.active;},[state.active]);
 useEffect(()=>{
  if(!selected)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  dialog.current?.querySelector('button')?.focus();
  const key=e=>{if(e.key==='Escape'){e.preventDefault();dispatch({type:'CLOSE'});}if(e.key==='Tab'){
   const items=[...dialog.current.querySelectorAll('button:not([disabled]),input:not([disabled]),select,textarea,[tabindex="0"]')].filter(n=>n.getClientRects().length);
   const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){last?.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===last){first?.focus();e.preventDefault();}
  }};
  window.addEventListener('keydown',key);return ()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',key);};
 },[selected,dispatch]);
 const close=()=>setSelected(null);
 useEffect(()=>{if(!selected)returnFocus.current?.focus?.();},[selected]);
 useEffect(()=>{if(!selected||state.active)return;const timeout=setTimeout(close,950);return ()=>clearTimeout(timeout);},[selected,state.active]);
 const modelReady=React.useCallback(()=>setModelLoading(false),[]);
 const object=OBJECTS.find(o=>o.id===selected),room=ROOMS.find(r=>r.id===state.room);
 return <main className="bloom-demo"><div className="demo-content" inert={selected?true:undefined}>
  <header className="site-header"><a className="wordmark" href="#">ROOM TO <strong>BLOOM<span>✳</span></strong></a><div className="header-note">A little space. A fresh start.</div><span className="studio-label">INTERACTION STUDIO</span></header>
  <section className="intro"><div><p className="eyebrow">YOUR SPACE. YOUR PACE. YOUR BLOOM.</p><h1>Make a little<br/>room to <em>grow.</em></h1></div><div className="intro-note"><p>Settle into your corner.<br/>Every object has a little purpose.</p><span>Choose something on your desk ↙</span></div></section>
  <div className="workspace-grid"><section className="room-section"><div className="room-heading"><span><span className="live-dot"/> {room?.label}</span><span className="room-time">{formatDuration(remainingMs(state.timer))} · {state.timer.phase==='break'?'a little breather':'your next focus'}</span></div><RoomBackdrop roomId={state.room} lighting={state.lighting} assetBase={assetBase} className="room-art">{(HOTSPOTS[state.room]||[]).map(p=><button key={p.id} className="art-hotspot" style={{left:`${p.x*100}%`,top:`${p.y*100}%`}} aria-label={`Open ${OBJECTS.find(o=>o.id===p.id)?.name}`} title={OBJECTS.find(o=>o.id===p.id)?.name} onClick={()=>dispatch({type:'FOCUS',id:p.id})}><span>+</span></button>)}<div className="room-caption"><span>YOUR LITTLE CORNER</span><strong>{room?.label}</strong></div></RoomBackdrop><div className="room-selector" aria-label="Study rooms">{ROOMS.map(r=><button key={r.id} aria-pressed={state.room===r.id} onClick={()=>dispatch({type:'ROOM',id:r.id})}>{r.label}</button>)}</div></section>
  <aside className="desk-dock"><div className="dock-heading"><p className="eyebrow">ON YOUR DESK</p><h2>Small things.<br/>Good company.</h2></div><nav aria-label="Interactive desk objects">{OBJECTS.map(o=><button key={o.id} className="object-launcher" onClick={()=>dispatch({type:'FOCUS',id:o.id})}><span className="object-icon">{o.icon}</span><span><strong>{o.name}</strong><small>{o.tag}</small></span><span className="object-arrow">↗</span></button>)}</nav></aside></div>
  <footer><span>Made for the moments that add up.</span><span>{state.tasks.filter(t=>t.completed).length} steps completed · {state.papers.filter(p=>p.status==='binned').length} papers collected</span><span>ROOM TO BLOOM ✳</span></footer>
  {storageError&&<p role="alert" className="storage-error">This browser cannot save your progress: {storageError}</p>}
  </div>{selected&&<div className="dialog-backdrop"><section className={`interaction-dialog interaction-${selected}`} ref={dialog} role="dialog" aria-modal="true" aria-labelledby="interaction-title"><header><div><p className="eyebrow">{object?.tag}</p><h2 id="interaction-title">{object?.name}</h2></div><button className="close-button" aria-label="Close interaction" onClick={()=>dispatch({type:'CLOSE'})}>×</button></header><div className="interaction-body"><div className="model-stage">
   {selected==='lamp'&&<RoomBackdrop roomId={state.room} lighting={state.lighting} assetBase={assetBase} className="lamp-backdrop"/>}
   <Canvas shadows dpr={[1,1.75]} camera={{position:[8,6,14],fov:38}} gl={{alpha:true,antialias:true}} fallback={<p role="alert">3D requires WebGL. The controls remain available.</p>}>
    <Environment frames={1} resolution={128}><Lightformer intensity={2} position={[0,5,5]} rotation={[0,0,0]} scale={[10,10,1]}/><Lightformer intensity={1.5} position={[-5,2,3]} rotation={[0,Math.PI/3,0]} scale={[5,7,1]}/></Environment><ambientLight intensity={.9}/><hemisphereLight args={['#fff8e4','#c8c2ac',1]}/><directionalLight position={[4,7,6]} intensity={1.8} castShadow shadow-mapSize={[1024,1024]}/><directionalLight position={[-4,3,-2]} intensity={1}/>
    <CameraFocusController focused={!!state.active} target={selected==='notebook'?[0,4.5,4.2]:selected==='tea'?[0,2.8,7]:selected==='bin'?[0,6,3.2]:[0,.7,6.6]} onReturned={close}/>
    <ModelError key={`${selected}-${revision}`} onRetry={()=>setRevision(r=>r+1)}><Suspense fallback={null}><Model id={selected} assetBase={assetBase} binRef={bin} audioController={audioController} aiRecommend={aiRecommend}/><ModelReady onReady={modelReady}/></Suspense></ModelError>
   </Canvas>{modelLoading&&<div className="model-loading" role="status">Making room…</div>}<p className="model-hint">{object?.hint}</p>
  </div><aside className="interaction-controls">
   {selected==='clock'&&<TimerControls/>}{selected==='tea'&&<><div className="control-stack"><p className="eyebrow">Breathe in. Breathe out.</p><h3>A warm little pause.</h3><p className="muted">Steam rises while your break timer runs, and gently fades when you pause or finish.</p></div><TimerControls/></>}{selected==='notebook'&&<NotebookControls/>}{selected==='cd'&&<MusicControls audioController={audioController} error={audioError}/>}{selected==='lamp'&&<LampControls/>}{selected==='bin'&&<BinControls onCrumple={onCrumple} onThrow={id=>bin.current?.throwPaper(id)}/>}{selected==='tv'&&<div className="control-stack"><p className="eyebrow">Your own study channel</p><h3>A setting for what’s ahead.</h3><p className="muted">Enter your task directly on the TV. Applying a setup changes your room, sound, and lighting together.</p>{audioError&&<p role="alert">{audioError}</p>}</div>}{selected==='calendar'&&<div className="control-stack"><p className="eyebrow">A fresh page, every day</p><h3>{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</h3><p className="muted">The calendar follows the local date on your device and updates after midnight.</p></div>}
  </aside></div><div className="dialog-foot"><span>Everything here moves at your pace.</span><span>ESC TO RETURN</span></div></section></div>}
 </main>;
}
export {ObjectInteractionManager};
export function RoomToBloomDemo({providerProps,...props}){return <StudyProvider {...providerProps}><ObjectInteractionManager {...props}/></StudyProvider>;}
