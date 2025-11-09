// Sample code snippets for testing the universal code runner

export const sampleCodes = {
  react: `// React Component Example
function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ 
        color: '#5DADE2',
        marginBottom: '20px'
      }}>
        React Counter
      </h1>
      <div style={{ 
        fontSize: '48px', 
        fontWeight: 'bold',
        margin: '30px 0',
        color: '#333'
      }}>
        {count}
      </div>
      <button
        onClick={() => setCount(count + 1)}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        Click Me!
      </button>
    </div>
  );
}`,

  vue: `// Vue Component Example
const App = {
  data() {
    return {
      count: 0,
      message: 'Hello Vue!'
    }
  },
  template: \`
    <div style="padding: 40px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
      <h1 style="color: #42b883; margin-bottom: 20px;">{{ message }}</h1>
      <div style="font-size: 48px; font-weight: bold; margin: 30px 0; color: #333;">
        {{ count }}
      </div>
      <button 
        @click="count++"
        style="padding: 12px 24px; font-size: 16px; background: linear-gradient(135deg, #42b883 0%, #35495e 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 15px rgba(66, 184, 131, 0.3);"
      >
        Increment
      </button>
    </div>
  \`
}`,

  node: `// Node.js Console Example
console.log('🚀 Node.js Code Execution Test');
console.log('================================');

// Basic calculations
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
console.log('Sum of numbers:', sum);
console.log('Average:', sum / numbers.length);

// String operations
const message = 'Hello from Node.js!';
console.log('\\nMessage:', message);
console.log('Uppercase:', message.toUpperCase());
console.log('Length:', message.length);

// Array operations
const fruits = ['Apple', 'Banana', 'Orange'];
console.log('\\nFruits:', fruits.join(', '));

// Object example
const user = {
  name: 'John Doe',
  age: 25,
  role: 'Developer'
};
console.log('\\nUser Info:', JSON.stringify(user, null, 2));

// Date operations
const now = new Date();
console.log('\\nCurrent Time:', now.toLocaleString());

console.log('\\n✅ Execution completed successfully!');`,

  javascript: `// Vanilla JavaScript Example
document.body.innerHTML = \`
  <div style="padding: 40px; font-family: system-ui, -apple-system, sans-serif;">
    <h1 style="color: #f7df1e; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
      JavaScript Animation
    </h1>
    <div id="box" style="
      width: 100px; 
      height: 100px; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      margin: 30px 0;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      transition: transform 0.5s;
    "></div>
    <button id="animateBtn" style="
      padding: 12px 24px;
      font-size: 16px;
      background: #f7df1e;
      color: #000;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(247, 223, 30, 0.3);
    ">
      Animate Box
    </button>
    <p id="output" style="margin-top: 20px; color: #666;"></p>
  </div>
\`;

const box = document.getElementById('box');
const btn = document.getElementById('animateBtn');
const output = document.getElementById('output');

let rotations = 0;

btn.addEventListener('click', () => {
  rotations++;
  box.style.transform = \`rotate(\${rotations * 90}deg) scale(\${1 + rotations * 0.1})\`;
  output.textContent = \`Rotated \${rotations} times!\`;
});`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Preview</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      text-align: center;
    }
    h1 {
      color: #667eea;
      margin-bottom: 20px;
      font-size: 2.5rem;
    }
    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 25px;
      font-weight: 600;
      transition: transform 0.3s;
    }
    .button:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Welcome!</h1>
    <p>This is a beautiful HTML page running in your browser-based code editor.</p>
    <a href="#" class="button">Get Started</a>
  </div>
</body>
</html>`,
};
