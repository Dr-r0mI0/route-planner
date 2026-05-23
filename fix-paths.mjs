import fs from 'fs';
import path from 'path';

const pagesDir = '/root/rout-planner/src/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));
for (const file of files) {
  const fullPath = path.join(pagesDir, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  content = content.replace(/\.\.\/\.\.\/utils/g, '../utils');
  content = content.replace(/\.\.\/\.\.\/context/g, '../context');
  fs.writeFileSync(fullPath, content);
  console.log('Fixed', fullPath);
}
