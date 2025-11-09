// Quick test for code execution
const { runCode } = require('./src/utils/runCode.ts');

async function test() {
  const testCode = `
function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: "40px", fontFamily: "system-ui" }}>
      <h1>Hello React! 🚀</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
`;

  try {
    const result = await runCode(testCode, 'react');
    console.log('Test result:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();