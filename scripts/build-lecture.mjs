import {mkdir,copyFile,readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const files=['index.html','ot-vibe-coding.html','live-demo-guide.html','templates/CLAUDE.md','archive.html','hackathon.html','claude-code-beginner.html','archive/before-live-rework-index.html','archive/before-live-rework-sesac-ot-vibe-coding.html','archive/before-live-rework-live-demo-guide.html'];
for(const file of files){const target=path.join(root,'lecture-public',file);await mkdir(path.dirname(target),{recursive:true});await copyFile(path.join(root,file),target);}
// Include only explicitly referenced local image assets, never application code or env files.
const assets=new Set();for(const file of files){const html=await readFile(path.join(root,file),'utf8');for(const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)){const url=match[1];if(/^(data:|https?:|#|\/)/.test(url)||! /\.(png|jpg|jpeg|webp|svg)(?:[?#].*)?$/i.test(url))continue;const relative=path.normalize(path.join(path.dirname(file),decodeURIComponent(url.split(/[?#]/)[0])));if(relative.startsWith('..'))throw Error('Unexpected asset path');assets.add(relative);}}
for(const file of assets){const target=path.join(root,'lecture-public',file);await mkdir(path.dirname(target),{recursive:true});await copyFile(path.join(root,file),target);}
console.log(`LECTURE_BUILD_OK: ${files.length} content files, ${assets.size} local assets; demo project excluded`);
