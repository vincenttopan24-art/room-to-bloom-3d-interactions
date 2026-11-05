const ROOMS = ['library','cafe','garden','beach','classroom','living','colourful','rooftop','park'];
export const defaultLimits = {maxHours:12,maxMinutes:59,minStudyMs:60000,maxStudyMs:46740000};
export const initialState = {
 active:null,room:'library',lighting:0.5,mainTask:'',tasks:[],papers:[],
 timer:{phase:'study',status:'idle',studyMs:1500000,breakMs:300000,remainingMs:1500000,endsAt:null},
 audio:{track:0,status:'stopped'},book:{open:false,page:0,turn:0}
};
const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
const finite = (n,fallback) => Number.isFinite(n) ? n : fallback;
export function normalizeLimits(input={}) {
 const maxHours=clamp(Math.floor(finite(input.maxHours,12)),0,999);
 const maxMinutes=clamp(Math.floor(finite(input.maxMinutes,59)),0,59);
 const dialMax=Math.max(60000,(maxHours*60+maxMinutes)*60000);
 const maxStudyMs=clamp(finite(input.maxStudyMs,dialMax),60000,dialMax);
 return {maxHours,maxMinutes,maxStudyMs,minStudyMs:clamp(finite(input.minStudyMs,60000),1000,maxStudyMs)};
}
export const remainingMs = (timer,now=Date.now()) => Math.max(0,timer.status==='running' ? finite(timer.endsAt,now)-now : timer.remainingMs);
export function formatDuration(ms) {
 const seconds=Math.ceil(Math.max(0,finite(ms,0))/1000), h=Math.floor(seconds/3600),m=Math.floor(seconds/60)%60,s=seconds%60;
 return [h,m,s].map(n=>String(n).padStart(2,'0')).join(':');
}
export const angleFromPoint = (x,y) => (Math.atan2(x,-y)+Math.PI*2)%(Math.PI*2);
export const angleToValue = (angle,steps) => steps>0 ? Math.round(((angle%(Math.PI*2)+Math.PI*2)%(Math.PI*2))/(Math.PI*2)*steps)%steps : 0;
export function calendarMonth(date=new Date()) {
 const year=date.getFullYear(),month=date.getMonth(),count=new Date(year,month+1,0).getDate(),offset=(new Date(year,month,1).getDay()+6)%7;
 const today=new Date(); const days=Array(offset).fill(null);
 for(let day=1;day<=count;day++) days.push({date:new Date(year,month,day),day,key:`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`,isToday:year===today.getFullYear()&&month===today.getMonth()&&day===today.getDate()});
 while(days.length%7) days.push(null);
 return {year,month,label:date.toLocaleDateString('en-US',{month:'long',year:'numeric'}),days,daysInMonth:count};
}
export function recommend(task) {
 const text=String(task??'').toLowerCase();
 if(/draw|design|creativ|sketch|art|paint/.test(text)) return {environment:'colourful',sound:4,lighting:0.8,reason:'A bright creative space with gentle instrumental sound.'};
 if(/relax|rest|meditat|breathe/.test(text)) return {environment:'beach',sound:2,lighting:0.65,reason:'Ocean sound and soft daylight for a calm pause.'};
 if(/writ|journal|read|study|math|exam|learn|code|program/.test(text)) return {environment:'library',sound:1,lighting:0.7,reason:'A quiet library and rain support sustained focus.'};
 if(/plan|brainstorm|meet/.test(text)) return {environment:'cafe',sound:3,lighting:0.75,reason:'A café atmosphere for planning and fresh ideas.'};
 return {environment:'garden',sound:0,lighting:0.65,reason:'A balanced garden setting with forest ambience.'};
}
function expired(timer) {
 const phase=timer.phase==='study'?'break':'study';
 return {...timer,phase,status:'idle',remainingMs:phase==='study'?timer.studyMs:timer.breakMs,endsAt:null,finishedPhase:timer.phase};
}
export function reducer(state,action,limits=defaultLimits) {
 const timer=state.timer;
 switch(action.type) {
  case 'FOCUS': return {...state,active:typeof action.id==='string'?action.id:null};
  case 'CLOSE': return {...state,active:null};
  case 'ROOM': return ROOMS.includes(action.id)?{...state,room:action.id}:state;
  case 'LIGHT': return Number.isFinite(action.value)?{...state,lighting:clamp(action.value,0,1)}:state;
  case 'MAIN_TASK': return typeof action.text==='string'?{...state,mainTask:action.text}:state;
  case 'ADD_TASK': {
   const text=typeof action.text==='string'?action.text.trim():'';
   if(!text||typeof action.id!=='string'||!action.id||state.tasks.some(t=>t.id===action.id)) return state;
   return {...state,tasks:[...state.tasks,{id:action.id,text,completed:false}],book:{...state.book,page:state.tasks.length+1,turn:state.book.turn+1}};
  }
  case 'EDIT_TASK': return typeof action.text==='string'&&action.text.trim()?{...state,tasks:state.tasks.map(t=>t.id===action.id?{...t,text:action.text.trim()}:t)}:state;
  case 'DELETE_TASK': {
   const tasks=state.tasks.filter(t=>t.id!==action.id);
   return {...state,tasks,book:{...state.book,page:Math.min(state.book.page,tasks.length)}};
  }
  case 'COMPLETE_TASK': {
   const task=state.tasks.find(t=>t.id===action.id); if(!task) return state;
   const papers=task.completed?state.papers.filter(p=>p.taskId!==task.id||p.status==='binned'):state.papers.some(p=>p.taskId===task.id)?state.papers:[...state.papers,{taskId:task.id,status:'ready',completedAt:finite(action.now,Date.now())}];
   return {...state,tasks:state.tasks.map(t=>t===task?{...t,completed:!t.completed}:t),papers};
  }
  case 'CRUMPLE': case 'THROW_PAPER': case 'MISS_PAPER': case 'BIN_PAPER': {
   const status={CRUMPLE:'crumpled',THROW_PAPER:'throwing',MISS_PAPER:'crumpled',BIN_PAPER:'binned'}[action.type];
   return {...state,papers:state.papers.map(p=>p.taskId===action.id&&p.status!=='binned'?{...p,status}:p)};
  }
  case 'BOOK_OPEN': return {...state,book:{...state.book,open:!!action.open}};
  case 'BOOK_PAGE': return Number.isInteger(action.page)?{...state,book:{...state.book,page:clamp(action.page,0,state.tasks.length),turn:state.book.turn+1}}:state;
  case 'TIMER_SET': {
   const bounds=normalizeLimits(limits),studyMs=clamp(finite(action.studyMs,timer.studyMs),bounds.minStudyMs,bounds.maxStudyMs),breakMs=clamp(finite(action.breakMs,timer.breakMs),1000,bounds.maxStudyMs);
   return {...state,timer:{...timer,studyMs,breakMs,status:'idle',endsAt:null,remainingMs:timer.phase==='study'?studyMs:breakMs,finishedPhase:null}};
  }
  case 'TIMER_START': if(timer.status==='running') return state; return {...state,timer:{...timer,status:'running',endsAt:finite(action.now,Date.now())+timer.remainingMs,finishedPhase:null}};
  case 'TIMER_BREAK': return {...state,timer:{...timer,phase:'break',status:'running',remainingMs:timer.breakMs,endsAt:finite(action.now,Date.now())+timer.breakMs,finishedPhase:null}};
  case 'TIMER_PAUSE': if(timer.status!=='running') return state; return {...state,timer:remainingMs(timer,finite(action.now,Date.now()))<=0?expired(timer):{...timer,status:'paused',remainingMs:remainingMs(timer,finite(action.now,Date.now())),endsAt:null}};
  case 'TIMER_RESET': return {...state,timer:{...timer,phase:'study',status:'idle',remainingMs:timer.studyMs,endsAt:null,finishedPhase:null}};
  case 'TICK': {
   if(timer.status!=='running') return state;
   const left=remainingMs(timer,finite(action.now,Date.now()));
   return {...state,timer:left<=0?expired(timer):{...timer,remainingMs:left}};
  }
  case 'AUDIO': return {...state,audio:{track:Number.isInteger(action.track)&&action.track>=0&&action.track<7?action.track:state.audio.track,status:['playing','paused','stopped','loading','error'].includes(action.status)?action.status:state.audio.status,error:action.status==='error'?(typeof action.error==='string'?action.error:'Audio playback failed'):null}};
  case 'APPLY_RECOMMENDATION': {
   const r=action.recommendation; if(!r||!ROOMS.includes(r.environment)) return state;
   return {...state,room:r.environment,lighting:clamp(finite(r.lighting,state.lighting),0,1),audio:{...state.audio,track:Number.isInteger(r.sound)&&r.sound>=0&&r.sound<7?r.sound:state.audio.track}};
  }
  default:return state;
 }
}
