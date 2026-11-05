import {it,expect} from 'vitest';
import {HOTSPOTS} from '../src/core/hotspots.js';
import {ROOMS} from '../src/core/rooms.js';
it('keeps per-room hotspot positions inside the shared image plane',()=>{for(const room of ROOMS){const points=HOTSPOTS[room.id];expect(points).toBeTruthy();expect(new Set(points.map(p=>p.id)).size).toBe(points.length);for(const p of points){expect(p.x).toBeGreaterThan(0);expect(p.x).toBeLessThan(1);expect(p.y).toBeGreaterThan(0);expect(p.y).toBeLessThan(1);}}expect(HOTSPOTS.library).not.toEqual(HOTSPOTS.living);});
