import React from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,act,cleanup} from '@testing-library/react';
import {StudyProvider} from '../src/core/StudyProvider.jsx';
import {TVScreen,MusicControls} from '../src/Controls.jsx';
afterEach(cleanup);
it('does not show recommendations for a task edited while AI request was pending',async()=>{let resolve;const ai=()=>new Promise(r=>resolve=r);render(<StudyProvider storage={null}><TVScreen aiRecommend={ai}/></StudyProvider>);fireEvent.change(screen.getByLabelText('Study task'),{target:{value:'Math'}});fireEvent.click(screen.getByRole('button',{name:'Find my setup'}));fireEvent.change(screen.getByLabelText('Study task'),{target:{value:'Drawing'}});await act(async()=>resolve({environment:'library',sound:1,lighting:.7}));expect(screen.queryByRole('button',{name:'Apply recommendation'})).toBeNull();});
it('loads saved track when resuming after reload without an audio element',()=>{const audio={audio:null,play:vi.fn(),resume:vi.fn()};render(<StudyProvider storage={null} initial={{audio:{track:3,status:'paused'}}}><MusicControls audioController={audio}/></StudyProvider>);fireEvent.click(screen.getByRole('button',{name:'Resume audio'}));expect(audio.play).toHaveBeenCalledWith(3);});
