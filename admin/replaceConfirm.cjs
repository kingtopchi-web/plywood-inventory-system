const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages');

const walkSync = (d) => {
  let files = [];
  fs.readdirSync(d).forEach(file => {
    const fullPath = path.join(d, file);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(walkSync(fullPath));
    } else {
      if (fullPath.endsWith('.jsx')) {
        files.push(fullPath);
      }
    }
  });
  return files;
};

const allFiles = walkSync(dir);

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let updated = false;

  // Add import if window.confirm is in file
  if (content.includes('window.confirm(')) {
    if (!content.includes('import { confirmDelete }')) {
      content = "import { confirmDelete } from '../../utils/confirmDelete';\n" + content;
      
      // Let's fix relative path just in case
      // from 'src/pages/abc/AbcPage.jsx' to 'src/utils/confirmDelete'
      // it should be '../../utils/confirmDelete'
    }

    // specific regex to replace window.confirm
    // e.g. if (!window.confirm(`Delete unit "${row.name}"?`)) return;
    // replaced with:
    // const isConfirmed = await confirmDelete(row.name || 'this item');
    // if (!isConfirmed) return;
    
    content = content.replace(/if\s*\(\s*!window\.confirm\([^)]+\)\s*\)\s*return;/g, 
      "const isConfirmed = await confirmDelete(row.name || row.productId?.name || 'this item');\n    if (!isConfirmed) return;"
    );

    updated = true;
  }

  if (updated) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
