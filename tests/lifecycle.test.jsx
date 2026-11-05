import React from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {StudyProvider} from '../src/core/StudyProvider.jsx';
import {ObjectInteractionManager} from '../src/RoomInteractions.jsx';
vi.mock('@react-three/fiber',()=>({Canvas:()=> <div data-testid="canvas-placeholder"/>,useFrame:vi.fn(),useThree:vi.fn()}));
class AudioFake extends EventTarget {volume=1;pause(){} load(){} removeAttribute(){} play(){return Promise.resolve();}}
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('audio still plays after React StrictMode effect replay',async()=>{vi.stubGlobal('Audio',AudioFake);render(<React.StrictMode><StudyProvider storage={null}><ObjectInteractionManager/></StudyProvider></React.StrictMode>);fireEvent.click(screen.getByRole('button',{name:/CD player A sound/}));fireEvent.click(await screen.findByRole('button',{name:'Play audio'}));await waitFor(()=>expect(screen.getByRole('button',{name:'Pause audio'})).toBeTruthy());});
it('opens an independent object deep link and Escape closes even without WebGL',async()=>{render(<StudyProvider storage={null}><ObjectInteractionManager initialObject="calendar"/></StudyProvider>);expect(await screen.findByRole('dialog',{name:'Live calendar'})).toBeTruthy();fireEvent.keyDown(window,{key:'Escape'});await waitFor(()=>expect(screen.queryByRole('dialog')).toBeNull(),{timeout:1400});});
it('makes the room controls inert while one object is active',async()=>{render(<StudyProvider storage={null}><ObjectInteractionManager initialObject="clock"/></StudyProvider>);await screen.findByRole('dialog',{name:'Study clock'});expect(document.querySelector('.demo-content').hasAttribute('inert')).toBe(true);});
it('shows model loading feedback in the dialog DOM without an Html suspense root',async()=>{render(<StudyProvider storage={null}><ObjectInteractionManager initialObject="clock"/></StudyProvider>);await screen.findByRole('dialog',{name:'Study clock'});expect(screen.getByText('Making room…')).toBeTruthy();});
