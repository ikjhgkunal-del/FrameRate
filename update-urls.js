const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'projectWork', 'src');

const filesToUpdate = [
  'context/AuthContext.jsx',
  'pages/Reels.jsx',
  'pages/MyList.jsx',
  'pages/Login.jsx',
  'pages/Home.jsx',
  'pages/Details.jsx',
  'pages/Signup.jsx'
];

// Create config.js
const configContent = `
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_BASE_URL = isLocalhost ? 'http://localhost:5000' : \`http://\${window.location.hostname}:5000\`;
`;
fs.writeFileSync(path.join(srcDir, 'config.js'), configContent.trim());

filesToUpdate.forEach(file => {
  const filePath = path.join(srcDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Add import statement if it doesn't exist
    const importDepth = file.startsWith('pages/') ? '../' : '../'; 
    // AuthContext is in context/ (so ../config)
    // pages/* is in pages/ (so ../config)
    const importStatement = "import { API_BASE_URL } from '" + importDepth + "config';\n";
    
    if (!content.includes('import { API_BASE_URL }')) {
      // Insert after the last import statement or at the top
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfLine = content.indexOf('\\n', lastImportIndex);
        content = content.slice(0, endOfLine + 1) + importStatement + content.slice(endOfLine + 1);
      } else {
        content = importStatement + content;
      }
    }

    // Replace "http://localhost:5000/..." with `${API_BASE_URL}/...`
    // Match "http://localhost:5000/path" -> `${API_BASE_URL}/path`
    content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, '`${API_BASE_URL}$1`');
    
    // Match `http://localhost:5000/path${var}` -> `${API_BASE_URL}/path${var}`
    content = content.replace(/`http:\/\/localhost:5000([^`]*)`/g, '`${API_BASE_URL}$1`');

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
