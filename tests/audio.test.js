import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { AudioController, AUDIO_LABELS, DEFAULT_TRACKS } from '../src/controllers/AudioController.js';
class FakeAudio extends EventTarget {
 static instances=[];
 constructor(src){super();this.src=src;this.pause=vi.fn();this.load=vi.fn();this.removeAttribute=vi.fn();this.play=vi.fn(()=>FakeAudio.nextPlay ? FakeAudio.nextPlay() : Promise.resolve());FakeAudio.instances.push(this);}
}
beforeEach(()=>{FakeAudio.instances=[];FakeAudio.nextPlay=null;});
function setup(){ const updates=[];return {updates,controller:new AudioController({AudioClass:FakeAudio,onStateChange:s=>updates.push(s)})}; }
describe('AudioController',()=>{
 it('provides seven original licensed tracks',()=>{expect(AUDIO_LABELS).toHaveLength(7);expect(DEFAULT_TRACKS.map(t=>t.label)).toEqual(AUDIO_LABELS);expect(DEFAULT_TRACKS.every(t=>t.src&&t.license==='CC0-1.0'&&t.attribution)).toBe(true);});
 it('reports loading until playback resolves, loops and adjusts volume',async()=>{const {controller,updates}=setup();const promise=controller.play(0);expect(updates.at(-1)).toEqual({track:0,status:'loading'});await promise;expect(updates.at(-1)).toEqual({track:0,status:'playing'});expect(FakeAudio.instances[0].loop).toBe(true);controller.setVolume(0.4);expect(FakeAudio.instances[0].volume).toBe(0.4);controller.pause();expect(updates.at(-1).status).toBe('paused');await controller.resume();expect(updates.at(-1).status).toBe('playing');controller.stop();expect(updates.at(-1).status).toBe('stopped');});
 it('handles autoplay rejection without claiming playback',async()=>{const {controller,updates}=setup();FakeAudio.nextPlay=()=>Promise.reject(new Error('gesture required'));await controller.play(0);expect(updates.at(-1)).toMatchObject({status:'error',error:'gesture required'});});
 it('ignores stale async play resolutions and removes old listeners',async()=>{const {controller,updates}=setup();
 const first=controller.play(0); // resolution queued, second replaces first synchronously
 const old=FakeAudio.instances[0];const second=controller.play(1);await Promise.all([first,second]);old.dispatchEvent(new Event('playing'));old.dispatchEvent(new Event('error'));expect(updates.at(-1)).toEqual({track:1,status:'playing'});expect(old.pause).toHaveBeenCalled();expect(old.removeAttribute).toHaveBeenCalledWith('src');});
 it('does not resurrect a paused or disposed pending play',async()=>{const {controller,updates}=setup();const promise=controller.play(2);controller.pause();await promise;expect(updates.at(-1).status).toBe('paused');const second=controller.resume();controller.dispose();await second;expect(updates.at(-1).status).toBe('stopped');expect(FakeAudio.instances[0].pause).toHaveBeenCalled();});
 it('handles missing tracks and media errors',async()=>{const {controller,updates}=setup();await controller.play(999);expect(updates.at(-1).status).toBe('error');await controller.play(0);FakeAudio.instances[0].dispatchEvent(new Event('error'));expect(updates.at(-1).status).toBe('error');});
 it('ships playable twelve-second WAV files',()=>{for(const track of DEFAULT_TRACKS){const wav=readFileSync(`public${track.src}`);expect(wav.toString('ascii',0,4)).toBe('RIFF');expect(wav.toString('ascii',8,12)).toBe('WAVE');expect(wav.readUInt32LE(24)).toBe(22050);expect(wav.readUInt32LE(40)).toBe(12*22050*2);}});
 it('cancels old playback when a delayed old play promise resolves',async()=>{const {controller,updates}=setup();let release;FakeAudio.nextPlay=()=>new Promise(resolve=>{release=resolve;});const first=controller.play(0);const old=FakeAudio.instances[0];FakeAudio.nextPlay=null;await controller.play(1);const pauses=old.pause.mock.calls.length;release();await first;expect(old.pause.mock.calls.length).toBeGreaterThan(pauses);expect(updates.at(-1)).toEqual({track:1,status:'playing'});});
 it('rejects invalid volume without changing audio',()=>{const {controller}=setup();expect(()=>controller.setVolume(NaN)).toThrow();expect(()=>controller.setVolume(2)).toThrow();});
});
