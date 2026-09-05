import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { resample, prune, dedup } from '@gltf-transform/functions';

async function downloadFile(url, destPath) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.statusText}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

async function testDownload(id) {
  console.log(`Fetching files metadata for ${id}...`);
  const metaRes = await fetch(`https://api.polyhaven.com/files/${id}`);
  const meta = await metaRes.json();
  const gltfInfo = meta.gltf?.['1k']?.gltf;
  if (!gltfInfo) throw new Error(`No 1k gltf for ${id}`);

  const rawDir = path.resolve(`public/models/raw/${id}`);
  fs.mkdirSync(rawDir, { recursive: true });

  const gltfFilename = path.basename(new URL(gltfInfo.url).pathname);
  const mainGltfPath = path.join(rawDir, gltfFilename);
  console.log(`Downloading main gltf: ${gltfInfo.url}`);
  await downloadFile(gltfInfo.url, mainGltfPath);

  for (const [relPath, fileData] of Object.entries(gltfInfo.include || {})) {
    const dest = path.join(rawDir, relPath);
    console.log(`Downloading ${relPath} from ${fileData.url}...`);
    await downloadFile(fileData.url, dest);
  }

  console.log(`Packaging ${id} to standalone GLB...`);
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const doc = await io.read(mainGltfPath);
  await doc.transform(prune(), dedup(), resample());

  const outGlb = path.resolve(`public/models/${id}.glb`);
  await io.write(outGlb, doc);
  console.log(`SUCCESS: Created ${outGlb} (size: ${(fs.statSync(outGlb).size / 1024 / 1024).toFixed(2)} MB)`);
}

testDownload('sofa_02').catch(err => {
  console.error(err);
  process.exit(1);
});
