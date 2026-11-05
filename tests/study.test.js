import { describe, it, expect } from 'vitest';
import { initialState, reducer, remainingMs, formatDuration, angleFromPoint, angleToValue, calendarMonth, recommend } from '../src/core/study.js';
const run = (state, type, data={}) => reducer(state,{type,...data});
describe('timestamp timer',()=>{
 it('pauses, resumes without drift, then readies a manual break',()=>{
  let s=run(initialState,'TIMER_START',{now:1000});
  expect(remainingMs(s.timer,11000)).toBe(1490000);
  s=run(s,'TIMER_PAUSE',{now:11000}); expect(s.timer.remainingMs).toBe(1490000);
  s=run(s,'TIMER_START',{now:30000});
  s=run(s,'TICK',{now:1520000});
  expect(s.timer).toMatchObject({phase:'break',status:'idle',remainingMs:300000,endsAt:null});
  s=run(s,'TIMER_BREAK',{now:1600000});
  expect(s.timer).toMatchObject({phase:'break',status:'running',endsAt:1900000});
  s=run(s,'TICK',{now:2000000});
  expect(s.timer).toMatchObject({phase:'study',status:'idle',remainingMs:1500000});
 });
 it('keeps idle ticks unchanged and clamps invalid durations',()=>{
  expect(run(initialState,'TICK',{now:50})).toBe(initialState);
  const s=run(initialState,'TIMER_SET',{studyMs:-2,breakMs:Infinity});
  expect(s.timer.studyMs).toBe(60000); expect(s.timer.breakMs).toBe(300000);
 });
 it('formats hours and clamps negative time',()=>{expect(formatDuration(3661000)).toBe('01:01:01');expect(formatDuration(-1)).toBe('00:00:00');});
});
describe('task paper history',()=>{
 it('creates one completion paper and preserves binned history after undo and delete',()=>{
  let s=run(initialState,'ADD_TASK',{id:'a',text:'  Finish report  '});
  expect(s.tasks[0].text).toBe('Finish report');
  s=run(s,'COMPLETE_TASK',{id:'a',now:10}); s=run(s,'CRUMPLE',{id:'a'});
  expect(s.papers).toHaveLength(1); expect(s.papers[0].status).toBe('crumpled');
  s=run(s,'THROW_PAPER',{id:'a'}); s=run(s,'MISS_PAPER',{id:'a'});expect(s.papers[0].status).toBe('crumpled');
  s=run(s,'BIN_PAPER',{id:'a'}); s=run(s,'COMPLETE_TASK',{id:'a'});
  expect(s.tasks[0].completed).toBe(false);expect(s.papers).toHaveLength(1);
  s=run(s,'DELETE_TASK',{id:'a'});expect(s.tasks).toHaveLength(0);expect(s.papers[0].status).toBe('binned');
 });
 it('rejects blanks and duplicates, removes unfinished completion on undo',()=>{
  expect(run(initialState,'ADD_TASK',{id:'a',text:' '})).toBe(initialState);
  let s=run(initialState,'ADD_TASK',{id:'a',text:'Read'});s=run(s,'ADD_TASK',{id:'a',text:'Duplicate'});expect(s.tasks).toHaveLength(1);
  s=run(s,'COMPLETE_TASK',{id:'a'});s=run(s,'COMPLETE_TASK',{id:'a'});expect(s.papers).toHaveLength(0);
 });
});
describe('control helpers',()=>{
 it('maps clockwise dial with zero at the top and wraps steps',()=>{expect(angleFromPoint(0,-1)).toBe(0);expect(angleFromPoint(1,0)).toBeCloseTo(Math.PI/2);expect(angleToValue(2*Math.PI,60)).toBe(0);expect(angleToValue(Math.PI,60)).toBe(30);});
 it('lays out leap-year February starting Monday',()=>{const c=calendarMonth(new Date(2024,1,15));expect(c.days.filter(Boolean)).toHaveLength(29);expect(c.days[3].day).toBe(1);expect(c.days.length%7).toBe(0);});
 it('recommends deterministic task-sensitive environments',()=>{expect(recommend('study maths')).toEqual(recommend('study maths'));expect(recommend('study maths').environment).toBe('library');expect(recommend('creative sketch').environment).toBe('colourful');expect(recommend('').sound).toBeGreaterThanOrEqual(0);});
 it('applies valid settings and book changes',()=>{let s=run(initialState,'APPLY_RECOMMENDATION',{recommendation:recommend('creative sketch')});expect(s.room).toBe('colourful');s=run(s,'LIGHT',{value:5});expect(s.lighting).toBe(1);s=run(s,'BOOK_PAGE',{page:3});expect(s.book).toMatchObject({page:0,turn:1});});
});
it('always shows HH:MM:SS even for zero or fractional seconds',()=>{expect(formatDuration(0)).toBe('00:00:00');expect(formatDuration(1250)).toBe('00:00:02');});
it('clamps book pages to existing notebook pages',()=>{expect(run(initialState,'BOOK_PAGE',{page:99}).book.page).toBe(0);});
it('reflects audio loading and playback errors explicitly',()=>{let s=run(initialState,'AUDIO',{status:'loading',track:2});expect(s.audio.status).toBe('loading');s=run(s,'AUDIO',{status:'error',error:'No audio output'});expect(s.audio).toMatchObject({status:'error',error:'No audio output',track:2});s=run(s,'AUDIO',{status:'playing'});expect(s.audio.error).toBe(null);});
