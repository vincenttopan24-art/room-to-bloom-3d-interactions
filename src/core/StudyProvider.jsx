import React,{createContext,useContext,useReducer,useEffect,useMemo,useRef,useState} from 'react';
import {initialState,reducer,normalizeLimits} from './study.js';
const StateContext=createContext(null),ActionsContext=createContext(null),MetaContext=createContext(null);
const object=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};
const finite=(value,fallback)=>Number.isFinite(value)?value:fallback;
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
const rooms=['library','cafe','garden','beach','classroom','living','colourful','rooftop','park'];
function validate(raw,limits,now) {
 const value=object(raw),timer=object(value.timer),audio=object(value.audio),book=object(value.book);
 const studyMs=clamp(finite(timer.studyMs,initialState.timer.studyMs),limits.minStudyMs,limits.maxStudyMs);
 const breakMs=clamp(finite(timer.breakMs,initialState.timer.breakMs),1000,limits.maxStudyMs);
 const phase=timer.phase==='break'?'break':'study',duration=phase==='break'?breakMs:studyMs;
 const ids=new Set();
 const tasks=(Array.isArray(value.tasks)?value.tasks:[]).filter(t=>{
  if(!t||typeof t.id!=='string'||!t.id||typeof t.text!=='string'||!t.text.trim()||ids.has(t.id))return false;
  ids.add(t.id);return true;
 }).map(t=>({id:t.id,text:t.text.trim(),completed:t.completed===true}));
 const paperIds=new Set();
 const papers=(Array.isArray(value.papers)?value.papers:[]).filter(p=>{
  if(!p||typeof p.taskId!=='string'||!p.taskId||!['ready','crumpled','throwing','binned'].includes(p.status)||paperIds.has(p.taskId))return false;
  paperIds.add(p.taskId);return true;
 }).map(p=>({taskId:p.taskId,status:p.status==='throwing'?'crumpled':p.status,completedAt:finite(p.completedAt,now)}));
 const status=['idle','paused','running'].includes(timer.status)?timer.status:'idle';
 let state={
  active:null,room:rooms.includes(value.room)?value.room:'library',lighting:clamp(finite(value.lighting,0.5),0,1),mainTask:typeof value.mainTask==='string'?value.mainTask:'',tasks,papers,
  timer:{phase,status:status==='running'&&!Number.isFinite(timer.endsAt)?'paused':status,studyMs,breakMs,remainingMs:clamp(finite(timer.remainingMs,duration),0,duration),endsAt:status==='running'&&Number.isFinite(timer.endsAt)?timer.endsAt:null},
  audio:{track:Number.isInteger(audio.track)&&audio.track>=0&&audio.track<7?audio.track:0,status:['playing','paused'].includes(audio.status)?'paused':'stopped'},
  book:{open:book.open===true,page:clamp(Number.isInteger(book.page)?book.page:0,0,tasks.length),turn:0}
 };
 if(state.timer.status==='running')state=reducer(state,{type:'TICK',now},limits);
 return state;
}
function load(storage,key,initial,limits) {
 let saved={},error=null;
 try {const parsed=JSON.parse(storage?.getItem(key)??'null');if(parsed?.version===1)saved=object(parsed.state);}catch(e){error=e.message||'Unable to read saved study state';}
 const override=object(initial),merged={...saved,...override,timer:{...object(saved.timer),...object(override.timer)},audio:{...object(saved.audio),...object(override.audio)},book:{...object(saved.book),...object(override.book)}};
 return {state:validate(merged,limits,Date.now()),error};
}
export function StudyProvider({children,storageKey='room-to-bloom-v1',storage,initial,limits:customLimits,onStateChange,onPaperCrumpled}) {
 const limits=useMemo(()=>normalizeLimits(customLimits),[customLimits?.maxHours,customLimits?.maxMinutes,customLimits?.minStudyMs,customLimits?.maxStudyMs]);
 const backend=useMemo(()=>{if(storage!==undefined)return {storage,error:null};try{return {storage:globalThis.localStorage,error:null};}catch(e){return {storage:null,error:e.message};}},[storage]);
 const bootstrap=useRef(null);
 if(!bootstrap.current)bootstrap.current=load(backend.storage,storageKey,initial,limits);
 const [state,dispatch]=useReducer((s,a)=>reducer(s,a,limits),bootstrap.current.state);
 const [storageError,setStorageError]=useState(bootstrap.current.error||backend.error);
 const stateCallback=useRef(onStateChange),paperCallback=useRef(onPaperCrumpled),previousPapers=useRef(state.papers);
 stateCallback.current=onStateChange;paperCallback.current=onPaperCrumpled;
 useEffect(()=>{
  if(state.timer.status!=='running')return;
  const interval=setInterval(()=>dispatch({type:'TICK',now:Date.now()}),250);
  return ()=>clearInterval(interval);
 },[state.timer.status]);
 useEffect(()=>{
  try {backend.storage?.setItem(storageKey,JSON.stringify({version:1,state:{...state,active:null}}));}catch(e){setStorageError(e.message||'Unable to save study state');}
  stateCallback.current?.(state);
  for(const paper of state.papers)if(paper.status==='crumpled'&&previousPapers.current.find(p=>p.taskId===paper.taskId)?.status!== 'crumpled')paperCallback.current?.(paper,state);
  previousPapers.current=state.papers;
 },[state,storageKey,backend.storage]);
 const meta=useMemo(()=>({limits,storageError}),[limits,storageError]);
 return <ActionsContext.Provider value={dispatch}><StateContext.Provider value={state}><MetaContext.Provider value={meta}>{children}</MetaContext.Provider></StateContext.Provider></ActionsContext.Provider>;
}
export function useStudyState(){const value=useContext(StateContext);if(!value)throw Error('useStudyState requires StudyProvider');return value;}
export function useStudyActions(){const value=useContext(ActionsContext);if(!value)throw Error('useStudyActions requires StudyProvider');return value;}
export function useStudy(){return {state:useStudyState(),dispatch:useStudyActions(),...useContext(MetaContext)};}
