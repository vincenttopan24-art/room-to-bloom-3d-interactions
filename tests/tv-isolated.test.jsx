import React from 'react';
import {it,expect,vi} from 'vitest';
import {render,screen,fireEvent} from '@testing-library/react';
import {TVScreenView} from '../src/Controls.jsx';
import {initialState} from '../src/core/study.js';
it('renders TV controls in the separate Html DOM root using an explicit study bridge',()=>{const dispatch=vi.fn();render(<TVScreenView study={{state:initialState,dispatch}}/>);fireEvent.change(screen.getByLabelText('Study task'),{target:{value:'math exam'}});fireEvent.click(screen.getByRole('button',{name:'Find my setup'}));expect(screen.getByText('University Library')).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Apply recommendation'}));expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({type:'APPLY_RECOMMENDATION',recommendation:expect.objectContaining({environment:'library'})}));});
