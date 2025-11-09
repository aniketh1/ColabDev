# 🚀 Quick Start Guide - Universal Code Runner

## What Was Built?

A complete **browser-based code execution system** that allows users to run:
- ✅ React (JSX)
- ✅ Vue 3
- ✅ Node.js
- ✅ Vanilla JavaScript
- ✅ HTML/CSS

All code runs **directly in the browser** (using esbuild-wasm) or via **free Piston API** (for Node.js).

---

## How to Use

### 1. Open the Editor
Navigate to any project in your One Editor workspace.

### 2. Open Code Preview
Click the **browser/preview button** in the editor toolbar to open the code runner.

### 3. Select Language
Click the language dropdown (defaults to "React") and choose:
- `react` - For React components with JSX
- `vue` - For Vue 3 components  
- `node` - For Node.js console programs
- `javascript` - For vanilla JS with DOM manipulation
- `html` - For static HTML pages

### 4. Write Code
Type or paste your code in the CodeMirror editor.

### 5. Run Code
Click the green **"Run Code"** button.

### 6. View Output
- **Frontend code** (React/Vue/JS/HTML): Displays in interactive iframe
- **Node.js code**: Displays in console-style text output
- **Errors**: Shows in red with detailed error messages

---

## Example Code Snippets

### React Counter
```jsx
function App() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### Vue Counter
```javascript
const App = {
  data() {
    return { count: 0 }
  },
  template: `
    <div style="padding: 20px; text-align: center;">
      <h1>Count: {{ count }}</h1>
      <button @click="count++">Increment</button>
    </div>
  `
}
```

### Node.js Console
```javascript
console.log('Hello from Node.js!');

const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);

console.log('Sum:', sum);
console.log('Average:', sum / numbers.length);
```

### Vanilla JavaScript
```javascript
document.body.innerHTML = `
  <div style="padding: 40px; text-align: center;">
    <h1 id="title">Click the button!</h1>
    <button id="btn" style="padding: 10px 20px; font-size: 16px;">
      Click Me
    </button>
  </div>
`;

document.getElementById('btn').addEventListener('click', () => {
  document.getElementById('title').textContent = 'You clicked!';
});
```

### HTML Page
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #667eea, #764ba2);
    }
    .card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Beautiful HTML</h1>
    <p>This is a styled HTML page!</p>
  </div>
</body>
</html>
```

---

## Features

### 🎨 Beautiful UI
- Gradient header (blue → purple)
- Draggable & resizable preview window
- Modern glassmorphism design
- Dark mode support

### ⚡ Real-time Execution
- Instant code transformation
- No page refresh needed
- Live error feedback

### 🔒 Secure Sandbox
- iframe sandbox for frontend code
- Isolated Docker containers for Node.js (Piston API)
- No access to file system

### 🌐 100% Free
- No API keys required
- No usage limits
- No third-party paid services

---

## Architecture

```
User Types Code
    ↓
EditorProvider Stores Code
    ↓
User Clicks "Run Code"
    ↓
runCode() Routes Based on Language
    ↓
    ├─→ Node.js → Piston API → Console Output
    └─→ React/Vue/JS → esbuild-wasm → iframe Output
```

---

## Troubleshooting

### Preview window won't open
**Solution**: Make sure you clicked the browser/preview button in the editor toolbar.

### Code doesn't run
**Solution**: 
1. Check that you selected the correct language
2. Verify your code has no syntax errors
3. Look for error messages in the preview window

### React/Vue doesn't render
**Solution**: Make sure your component is exported as `App`:
```jsx
function App() {
  return <div>Hello</div>;
}
// Component must be named "App"
```

### Node.js timeout
**Solution**: Piston API has a 3-second timeout. Avoid infinite loops or long-running operations.

### esbuild initialization failed
**Solution**: Check your internet connection. The WASM file loads from CDN on first use.

---

## Technical Details

### Dependencies Installed
- `esbuild-wasm@latest` - Browser-based JavaScript bundler

### Files Modified
1. **BrowerRunCode.tsx** - Complete rewrite with new UI
2. **EditorProvider.tsx** - Added `code` state management
3. **[projectId]/page.tsx** - Added code syncing to provider

### Files Created
1. **src/utils/esbuild.ts** - esbuild-wasm initialization
2. **src/utils/runCode.ts** - Universal code runner
3. **src/lib/sampleCodeForRunner.ts** - Sample code snippets
4. **CODE_RUNNER_DOCS.md** - Full documentation
5. **QUICK_START.md** - This file

---

## Next Steps

1. **Test the runner**: Try all example code snippets above
2. **Explore languages**: Switch between React, Vue, Node, etc.
3. **Build projects**: Create multi-file React apps
4. **Share**: Collaborate with teammates in real-time

---

## Support

For issues or questions:
1. Check `CODE_RUNNER_DOCS.md` for detailed documentation
2. Review sample code in `src/lib/sampleCodeForRunner.ts`
3. Inspect browser console for error messages

---

**Happy Coding! 🎉**
