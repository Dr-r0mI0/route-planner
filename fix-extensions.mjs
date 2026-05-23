import fs from 'fs';
import path from 'path';

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const oldContent = content;
      content = content.replace(/from\s+['"]([^'"]*(i18n|ThemeContext|AppContext|AuthContext|AdminContext))['"]/g, "from '$1.jsx'");
      if (content !== oldContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walk('/root/rout-planner/src');
