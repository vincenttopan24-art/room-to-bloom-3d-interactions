import React from 'react';
import {it,expect} from 'vitest';
import {render,screen,fireEvent} from '@testing-library/react';
import {StudyProvider,useStudy} from '../src/core/StudyProvider.jsx';
import {MusicControls} from '../src/Controls.jsx';
it('retains keyboard focus and pointer target when selection changes',()=>{function Harness(){const {dispatch}=useStudy();return <MusicControls audioController={{play:track=>dispatch({type:'AUDIO',track,status:'playing'})}}/>;}render(<StudyProvider storage={null}><Harness/></StudyProvider>);const wheel=screen.getByRole('listbox');wheel.focus();fireEvent.keyDown(wheel,{key:'ArrowDown'});expect(document.activeElement).toBe(wheel);fireEvent.keyDown(wheel,{key:'ArrowDown'});expect(screen.getByRole('option',{name:'Ocean Waves'}).getAttribute('aria-selected')).toBe('true');});
