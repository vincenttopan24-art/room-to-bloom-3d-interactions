import {readFile,writeFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const dir=resolve('public/assets'),report={};
for(const filename of (await readdir(dir)).filter(n=>n.endsWith('.glb')).sort()){
 const bytes=await readFile(resolve(dir,filename));
 if(bytes.toString('utf8',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2)throw Error(`${filename}: invalid GLB v2`);
 const length=bytes.readUInt32LE(12);const gltf=JSON.parse(bytes.toString('utf8',20,20+length));
 report[filename]={asset:gltf.asset,scenes:gltf.scenes,nodes:gltf.nodes,materials:gltf.materials,animations:gltf.animations||[],images:(gltf.images||[]).map(({name,mimeType})=>({name,mimeType})),extensionsUsed:gltf.extensionsUsed||[],meshes:gltf.meshes.map(mesh=>({name:mesh.name,primitives:mesh.primitives.map(p=>({material:p.material,positionBounds:Object.fromEntries(['min','max','count'].map(k=>[k,gltf.accessors[p.attributes.POSITION][k]]))}))}))};
 console.log(`${filename}: ${gltf.nodes.length} nodes, ${gltf.meshes.length} meshes, ${(gltf.animations||[]).length} animation clips`);
}
await writeFile(resolve('docs/model-report.json'),JSON.stringify(report,null,2)+'\n');
console.log('Saved docs/model-report.json');
