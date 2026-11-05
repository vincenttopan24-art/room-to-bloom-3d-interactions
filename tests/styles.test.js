import {readFileSync} from 'node:fs';
const css=readFileSync('src/styles.css','utf8');
import {it,expect} from 'vitest';
it('does not change host buttons when interaction styles are imported',()=>{document.body.innerHTML='<button id="host">Host button</button><div class="rtb"><button id="inside">Interaction</button></div>';const host=document.getElementById('host');const before=getComputedStyle(host).borderRadius;const style=document.createElement('style');style.textContent=css.replace(/^@import.*\n/,'');document.head.append(style);expect(getComputedStyle(host).borderRadius).toBe(before);expect(getComputedStyle(document.getElementById('inside')).borderRadius).toBe('9px');style.remove();document.body.innerHTML='';});
