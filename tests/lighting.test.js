import React from 'react';
import { describe,it,expect,vi } from 'vitest';
import { render,screen,cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { ROOMS,assetUrl } from '../src/core/rooms.js';
import { RoomBackdrop } from '../src/controllers/LightingController.jsx';
import { existsSync } from 'node:fs';
afterEach(cleanup);
describe('room lighting',()=>{
 it('encodes filenames and supports asset base paths',()=>{expect(assetUrl('a b/x#.png','/custom/')).toBe('/custom/a%20b/x%23.png');});
 it('uses actual shipped assets and records dimensions',()=>{expect(ROOMS.map(r=>r.id)).toEqual(['library','cafe','garden','beach','classroom','living','colourful','rooftop','park']);for(const room of ROOMS){expect(existsSync(`public/assets/${room.bright}`)).toBe(true);expect(existsSync(`public/assets/${room.sunset}`)).toBe(true);expect(room.width/room.height).toBeGreaterThan(1);}});
 it('layers both sources with identical crop coordinates and retains children',()=>{const room=ROOMS.find(r=>r.verified);const {container,rerender}=render(React.createElement(RoomBackdrop,{roomId:room.id,lighting:0.7},React.createElement('button',null,'hotspot')));const imgs=container.querySelectorAll('img');expect(imgs).toHaveLength(2);expect(Number(imgs[1].style.opacity)).toBeCloseTo(0.3);expect(imgs[0].style.objectFit).toBe('contain');expect(imgs[1].style.objectFit).toBe('contain');expect(screen.getByRole('button').parentElement.style.aspectRatio).toBe(`${room.width} / ${room.height}`);rerender(React.createElement(RoomBackdrop,{roomId:room.id,lighting:0}));expect(container.querySelectorAll('img')[1].style.opacity).toBe('1');});
 it('reports and blocks unverified pairs, with accessible notes',()=>{const room=ROOMS[0];const original={verified:room.verified,notes:room.notes};room.verified=false;room.notes='Pair requires alignment review.';const warning=vi.fn();const {container}=render(React.createElement(RoomBackdrop,{roomId:room.id,lighting:1,onAlignmentWarning:warning}));expect(container.querySelectorAll('img')).toHaveLength(1);expect(screen.getByRole('note').textContent).toBe(room.notes);expect(warning).toHaveBeenCalledWith(room.notes);Object.assign(room,original);});
});
