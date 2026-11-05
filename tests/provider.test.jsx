import React from 'react';
import {render,act,cleanup} from '@testing-library/react';
import {it,expect,afterEach,vi} from 'vitest';
import {StudyProvider,useStudy,useStudyActions,useStudyState} from '../src/core/StudyProvider.jsx';
let api;
function Probe(){api=useStudy();expect(useStudyState()).toBe(api.state);expect(useStudyActions()).toBe(api.dispatch);return <span>{api.state.mainTask}</span>;}
const mount=(props={})=>render(<StudyProvider {...props}><Probe/></StudyProvider>);
afterEach(()=>{cleanup();vi.useRealTimers();localStorage.clear();});
it('persists a versioned snapshot and restores tasks without active focus',()=>{
 const first=mount();act(()=>{api.dispatch({type:'MAIN_TASK',text:'Finish chapter'});api.dispatch({type:'FOCUS',id:'clock'});api.dispatch({type:'ADD_TASK',id:'t',text:'Read'});});
 expect(JSON.parse(localStorage.getItem('room-to-bloom-v1')).version).toBe(1);
 first.unmount();mount();expect(api.state.mainTask).toBe('Finish chapter');expect(api.state.tasks[0].text).toBe('Read');expect(api.state.active).toBe(null);
});
it('resolves an expired persisted running timer once, leaving break manual',()=>{
 vi.useFakeTimers();vi.setSystemTime(100000);
 localStorage.setItem('room-to-bloom-v1',JSON.stringify({version:1,state:{timer:{phase:'study',status:'running',studyMs:60000,breakMs:5000,remainingMs:1000,endsAt:90000}}}));
 mount();expect(api.state.timer).toMatchObject({phase:'break',status:'idle',remainingMs:5000});
 act(()=>vi.advanceTimersByTime(2000));expect(api.state.timer.phase).toBe('break');
});
it('restores remaining wall-clock time then pauses without drift',()=>{
 vi.useFakeTimers();vi.setSystemTime(100000);
 localStorage.setItem('room-to-bloom-v1',JSON.stringify({version:1,state:{timer:{phase:'study',status:'running',studyMs:60000,breakMs:5000,remainingMs:60000,endsAt:150000}}}));
 mount();expect(api.state.timer.remainingMs).toBe(50000);
 act(()=>vi.advanceTimersByTime(250));expect(api.state.timer.remainingMs).toBe(49750);
 act(()=>api.dispatch({type:'TIMER_PAUSE',now:Date.now()}));act(()=>vi.advanceTimersByTime(5000));expect(api.state.timer.remainingMs).toBe(49750);
});
it('rejects malformed storage safely and enforces custom limits',()=>{
 for(const data of ['null','{bad','[]',JSON.stringify({version:1,state:{tasks:[null,4,{id:'a',text:'Ok'},{id:'a',text:'Duplicate'}],timer:null,audio:[],papers:[null],lighting:9}})]){
  const storage={getItem:()=>data,setItem:vi.fn()};const view=mount({storage,limits:{maxHours:1,maxMinutes:0,minStudyMs:120000,maxStudyMs:3600000}});
  expect(Array.isArray(api.state.tasks)).toBe(true);expect(api.state.tasks.length).toBeLessThanOrEqual(1);
  act(()=>api.dispatch({type:'TIMER_SET',studyMs:1,breakMs:5000000}));expect(api.state.timer.studyMs).toBe(120000);expect(api.state.timer.breakMs).toBe(3600000);view.unmount();
 }
});
it('survives blocked storage and notifies the host on changes',()=>{
 const onStateChange=vi.fn();mount({storage:{getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}},onStateChange});
 expect(api.storageError).toBeTruthy();act(()=>api.dispatch({type:'MAIN_TASK',text:'Safe'}));expect(api.state.mainTask).toBe('Safe');expect(onStateChange.mock.lastCall[0].mainTask).toBe('Safe');
});
it('does not update idle state every interval',()=>{
 vi.useFakeTimers();const onStateChange=vi.fn();mount({storage:null,onStateChange});const before=onStateChange.mock.calls.length;act(()=>vi.advanceTimersByTime(5000));expect(onStateChange).toHaveBeenCalledTimes(before);
});
it('notifies paper crumple once per transition',()=>{
 const onPaperCrumpled=vi.fn();mount({storage:null,onPaperCrumpled});act(()=>{api.dispatch({type:'ADD_TASK',id:'t',text:'Read'});api.dispatch({type:'COMPLETE_TASK',id:'t'});});
 act(()=>api.dispatch({type:'CRUMPLE',id:'t'}));expect(onPaperCrumpled).toHaveBeenCalledTimes(1);expect(onPaperCrumpled.mock.calls[0][0].taskId).toBe('t');
 act(()=>api.dispatch({type:'CRUMPLE',id:'t'}));expect(onPaperCrumpled).toHaveBeenCalledTimes(1);
});
