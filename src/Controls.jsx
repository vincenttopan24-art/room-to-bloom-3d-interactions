import React,{useState,useRef,useEffect} from 'react';
import {useStudy} from './core/StudyProvider.jsx';
import {formatDuration,remainingMs,recommend} from './core/study.js';
import {ROOMS} from './core/rooms.js';
import {AUDIO_LABELS} from './controllers/AudioController.js';
import OptionWheel from './vendor/OptionWheel.jsx';
const uid=()=>globalThis.crypto?.randomUUID?.()||`task-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function TimerControls(){
 const {state,dispatch,limits}=useStudy(),t=state.timer;
 const hours=Math.floor(t.studyMs/3600000),minutes=Math.floor(t.studyMs/60000)%60;
 const set=(h,m)=>dispatch({type:'TIMER_SET',studyMs:(Number(h)*60+Number(m))*60000});
 return <div className="control-stack">
  <p className="eyebrow">{t.phase==='break'?'Break time':'Time to focus'}</p>
  <output className="timer-digits" data-testid="countdown" aria-live="off">{formatDuration(remainingMs(t))}</output>
  <p className="muted">Long hand = hours · Short hand = minutes</p>
  <div className="field-row"><label>Hours · long hand<input type="number" min="0" max={limits.maxHours} value={hours} onChange={e=>set(e.target.value,minutes)} disabled={t.status==='running'}/></label><label>Minutes · short hand<input type="number" min="0" max={limits.maxMinutes} value={minutes} onChange={e=>set(hours,e.target.value)} disabled={t.status==='running'}/></label></div>
  <div className="button-row"><button onClick={()=>dispatch({type:'TIMER_SET',studyMs:25*60000,breakMs:5*60000})}>25 / 5</button><button onClick={()=>dispatch({type:'TIMER_SET',studyMs:50*60000,breakMs:10*60000})}>50 / 10</button></div>
  <div className="button-row"><button className="primary" onClick={()=>dispatch({type:t.status==='running'?'TIMER_PAUSE':'TIMER_START',now:Date.now()})}>{t.status==='running'?'Pause':t.status==='paused'?'Resume':t.phase==='study'?'Start study':'Start break timer'}</button><button onClick={()=>dispatch({type:'TIMER_RESET'})}>Reset</button></div>
  <button onClick={()=>{dispatch({type:'TIMER_BREAK',now:Date.now()});dispatch({type:'FOCUS',id:'tea'});}}>Start break</button>
  <label>Break duration (minutes)<input type="number" min="1" max="120" value={t.breakMs/60000} onChange={e=>dispatch({type:'TIMER_SET',breakMs:Number(e.target.value)*60000})}/></label>
  {t.finishedPhase&&<p role="status">{t.finishedPhase==='study'?'Study finished. Your break is ready.':'Break finished. Ready for another session.'}</p>}
 </div>;
}
export function NotebookControls(){
 const {state,dispatch}=useStudy(),[draft,setDraft]=useState('');
 return <div className="control-stack">
  <div className="button-row"><button onClick={()=>dispatch({type:'BOOK_OPEN',open:!state.book.open})}>{state.book.open?'Close notebook':'Open notebook'}</button><span className="muted">Page {state.book.page+1} of {state.tasks.length+1}</span></div>
  <label>Main task<input value={state.mainTask} placeholder="What will you make room for?" maxLength={300} onChange={e=>dispatch({type:'MAIN_TASK',text:e.target.value})}/></label>
  <form onSubmit={e=>{e.preventDefault();if(!draft.trim())return;dispatch({type:'BOOK_OPEN',open:true});dispatch({type:'ADD_TASK',id:uid(),text:draft});setDraft('');}}><label>New subtask<input value={draft} maxLength={300} onChange={e=>setDraft(e.target.value)} placeholder="One small step…"/></label><button className="primary" disabled={!draft.trim()}>Add page</button></form>
  <div className="button-row"><button disabled={state.book.page<=0} onClick={()=>dispatch({type:'BOOK_PAGE',page:state.book.page-1})}>← Previous page</button><button disabled={state.book.page>=state.tasks.length} onClick={()=>dispatch({type:'BOOK_PAGE',page:state.book.page+1})}>Next page →</button></div>
  <div className="task-list">{state.tasks.map((task,i)=><div className="task-row" key={task.id}><input type="checkbox" aria-label={`Complete subtask ${i+1}`} checked={task.completed} onChange={()=>dispatch({type:'COMPLETE_TASK',id:task.id})}/><input aria-label={`Edit subtask ${i+1}`} value={task.text} maxLength={300} onChange={e=>dispatch({type:'EDIT_TASK',id:task.id,text:e.target.value})}/><button aria-label={`Go to subtask ${i+1} page`} onClick={()=>dispatch({type:'BOOK_PAGE',page:i+1})}>↗</button><button aria-label={`Delete subtask ${i+1}`} onClick={()=>dispatch({type:'DELETE_TASK',id:task.id})}>×</button></div>)}</div>
 </div>;
}
export function TVScreen(props){const study=useStudy();return <TVScreenView {...props} study={study}/>;}
// Drei Html mounts a separate DOM root: pass the provider snapshot explicitly.
export function TVScreenView({onApplyAudio,aiRecommend,study}){
 const {state,dispatch}=study,[task,setTask]=useState(state.mainTask),[result,setResult]=useState(null),[busy,setBusy]=useState(false),[fallback,setFallback]=useState(false);
 const request=useRef(0),cancelPending=useRef(null);
 useEffect(()=>()=>{request.current++;cancelPending.current?.();},[]);
 const submit=async e=>{
  e.preventDefault();if(!task.trim())return;cancelPending.current?.();const ticket=++request.current;let timeout;setBusy(true);setFallback(false);
  try{let value;if(aiRecommend){value=await Promise.race([aiRecommend(task),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('timeout')),5000);cancelPending.current=()=>reject(new Error('cancelled'));})]);if(!value||!ROOMS.some(r=>r.id===value.environment)||!Number.isInteger(value.sound)||value.sound<0||value.sound>6||!Number.isFinite(value.lighting))throw new Error('Invalid recommendation');}else value=recommend(task);if(ticket===request.current)setResult(value);}catch{if(ticket===request.current){setResult(recommend(task));setFallback(true);}}finally{clearTimeout(timeout);if(ticket===request.current){setBusy(false);cancelPending.current=null;}}
 };
 return <div className="tv-interface" onPointerDown={e=>e.stopPropagation()}>
  <div className="tv-brand">ROOM TO BLOOM <span>● ON AIR</span></div>
  <h3>Your study setup</h3>
  <form onSubmit={submit}><label>Study task<input value={task} maxLength={300} onChange={e=>{request.current++;cancelPending.current?.();cancelPending.current=null;setBusy(false);setTask(e.target.value);setResult(null);}} placeholder="What are you working on?"/></label><button disabled={busy||!task.trim()}>{busy?'Finding your space…':'Find my setup'}</button></form>
  {result&&<div className="tv-result"><p><small>Environment</small><strong>{ROOMS.find(r=>r.id===result.environment)?.label}</strong></p><div><p><small>Sound</small>{AUDIO_LABELS[result.sound]}</p><p><small>Lighting</small>{result.lighting<.5?'Warm':'Soft daylight'}</p></div><button onClick={()=>{dispatch({type:'MAIN_TASK',text:task});dispatch({type:'APPLY_RECOMMENDATION',recommendation:result});onApplyAudio?.(result.sound);}}>Apply recommendation</button>{fallback&&<small>Using local recommendations</small>}</div>}
 </div>;
}
export function MusicControls({audioController,error}){
 const {state}=useStudy();const select=index=>audioController?.play(index);
 return <div className="control-stack music-controls"><p className="eyebrow">Set the mood</p><div className="music-wheel"><OptionWheel items={AUDIO_LABELS} defaultSelected={state.audio.track} onChange={select} textColor="#716f63" activeColor="#304d3e" fontSize={1.25} spacing={1.8} inset={24} curve={.7} blur={1} fade={.4} loop={false} draggable/></div>
  <div className="button-row"><button className="primary" onClick={()=>state.audio.status==='playing'?audioController?.pause():state.audio.status==='paused'&&audioController?.audio?audioController.resume():select(state.audio.track)}>{state.audio.status==='playing'?'Pause audio':state.audio.status==='paused'?'Resume audio':'Play audio'}</button><button onClick={()=>audioController?.stop()}>Stop</button></div><label>Volume<input type="range" min="0" max="1" step=".01" defaultValue=".4" onChange={e=>audioController?.setVolume(Number(e.target.value))}/></label><p className="muted">Scroll, drag, or use arrow keys to choose a sound.</p>{error&&<p role="alert">{error} Press Play to retry.</p>}
 </div>;
}
export function LampControls(){const {state,dispatch}=useStudy();return <div className="control-stack"><p className="eyebrow">A light for every mood</p><h3>{Math.round(state.lighting*100)}% daylight</h3><label>Room lighting<input type="range" min="0" max="1" step=".01" value={state.lighting} onChange={e=>dispatch({type:'LIGHT',value:Number(e.target.value)})}/></label><div className="range-labels"><span>Warm sunset</span><span>Afternoon</span><span>Daylight</span></div></div>;}
export function BinControls({onCrumple,onThrow}){
 const {state,dispatch}=useStudy(),paper=state.papers.find(p=>p.status!=='binned'),binned=state.papers.filter(p=>p.status==='binned');
 return <div className="control-stack"><p className="eyebrow">Make room for the next thing</p><h3>{binned.length} small win{binned.length===1?'':'s'}, collected.</h3>{!paper?<p className="muted">Complete a notebook subtask to create its paper.</p>:<><p>{state.tasks.find(t=>t.id===paper.taskId)?.text||'Completed task'}</p>{paper.status==='ready'?<button onClick={()=>{dispatch({type:'CRUMPLE',id:paper.taskId});onCrumple?.(paper.taskId);}}>Crumple paper</button>:<><p className="muted">Drag the paper toward the bin. Missed? Try again.</p><button className="primary" disabled={paper.status==='throwing'} onClick={()=>onThrow?.(paper.taskId)}>{paper.status==='throwing'?'Paper in flight…':'Throw into bin'}</button></>}</>}<p className="muted">Every paper belongs to a completed subtask.</p></div>;
}
