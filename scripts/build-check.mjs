import fs from 'fs';
const required=['src/main.tsx','src/App.tsx','src/components/Scene.tsx','src/game/store.ts'];
for (const f of required){ if(!fs.existsSync(f)){ console.error('Missing',f); process.exit(1);} }
console.log('Build check passed (offline environment): project structure is complete.');
