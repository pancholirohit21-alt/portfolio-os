const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const outputFile = path.join(rootDir, 'src', 'lib', 'codebase.json');

// Folders to ignore
const IGNORE_DIRS = ['node_modules', '.next', '.git', '.vscode', 'public', '.gemini'];

// File extensions to include
const ALLOWED_EXTS = ['.ts', '.tsx', '.css', '.json', '.js', '.mjs', '.md'];

const getFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        getFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file);
      // Include allowed extensions OR dotfiles (like .eslintrc)
      if (ALLOWED_EXTS.includes(ext) || file.startsWith('.')) {
        // Exclude lock files, binary files, and logs
        if (file !== 'package-lock.json' && file !== '.DS_Store' && !file.endsWith('.log')) {
          fileList.push(filePath);
        }
      }
    }
  }
  return fileList;
};

// Get all files from root
const files = getFiles(rootDir);

const codebase = {};

files.forEach(filePath => {
  try {
    const relativePath = path.relative(rootDir, filePath);
    // Prevent recursion
    if (relativePath === 'src/lib/codebase.json') return;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(filePath);
    
    let language = 'typescript';
    if (ext === '.tsx') language = 'tsx';
    else if (ext === '.ts') language = 'typescript';
    else if (ext === '.js' || ext === '.mjs') language = 'javascript';
    else if (ext === '.css') language = 'css';
    else if (ext === '.json' || file.startsWith('.')) language = 'json';
    else if (ext === '.md') language = 'markdown';
    else language = 'text';

    codebase[relativePath] = {
      content,
      language
    };
  } catch (e) {
    // ignore
  }
});

// Ensure lib exists
if (!fs.existsSync(path.dirname(outputFile))) {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify(codebase, null, 2));
console.log(`Generated codebase.json with ${Object.keys(codebase).length} files!`);
