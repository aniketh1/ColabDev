import { buildCode, initEsbuild, isInitialized } from './esbuild';

/**
 * Language types supported by the runner
 */
export type Language = 'react' | 'vue' | 'node' | 'javascript' | 'html' | 'css';

/**
 * Output types for different execution modes
 */
export type RunCodeOutput =
  | { type: 'iframe'; output: string }
  | { type: 'console'; output: string }
  | { type: 'error'; output: string };

/**
 * Piston API configuration
 */
const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

/**
 * Execute Node.js code using Piston API
 */
const runNodeCode = async (code: string): Promise<RunCodeOutput> => {
  try {
    const response = await fetch(PISTON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: 'javascript',
        version: '18.15.0',
        files: [
          {
            name: 'main.js',
            content: code,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Combine stdout and stderr
    const output = [
      data.run?.stdout || '',
      data.run?.stderr || '',
      data.compile?.stderr || '',
    ]
      .filter(Boolean)
      .join('\n');

    return {
      type: 'console',
      output: output || 'No output',
    };
  } catch (error: any) {
    return {
      type: 'error',
      output: `Node execution failed: ${error.message}`,
    };
  }
};



/**
 * Generate HTML wrapper for frontend code
 */
const generateHTML = (bundledCode: string, language: Language): string => {
  // React setup
  if (language === 'react') {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #root { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    (function() {
      try {
        // Make React and its hooks available globally
        window.React = React;
        window.useState = React.useState;
        window.useEffect = React.useEffect;
        window.useContext = React.useContext;
        window.useReducer = React.useReducer;
        window.useCallback = React.useCallback;
        window.useMemo = React.useMemo;
        window.useRef = React.useRef;
        window.useImperativeHandle = React.useImperativeHandle;
        window.useLayoutEffect = React.useLayoutEffect;
        window.useDeferredValue = React.useDeferredValue;
        window.useTransition = React.useTransition;
        window.startTransition = React.startTransition;
        window.useId = React.useId;
        window.useSyncExternalStore = React.useSyncExternalStore;

        ${bundledCode.replace(/<\/script>/gi, '<\\/script>')}

        // Auto-render if component is exported as default
        if (typeof App !== 'undefined') {
          const container = document.getElementById('root');
          const root = ReactDOM.createRoot(container);
          root.render(React.createElement(App));
        } else {
          console.warn('No App component found. Make sure to define a component named "App".');
        }
      } catch (error) {
        console.error('Execution error:', error);
        document.body.innerHTML = '<div style="color: red; padding: 20px; font-family: monospace;"><h2>⚠️ Error</h2><pre style="background: #ffebee; padding: 15px; border-radius: 5px; overflow: auto;">' + error.message + '\\n\\n' + error.stack + '</pre><p style="margin-top: 20px; color: #666;">Tip: Make sure your component is named "App" and doesn\\'t use import statements.</p></div>';
      }
    })();
  </script>
</body>
</html>
    `.trim();
  }

  // Vue setup
  if (language === 'vue') {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vue Preview</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #app { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    (function() {
      try {
        ${bundledCode.replace(/<\/script>/gi, '<\\/script>')}

        // Auto-mount if component is exported
        if (typeof App !== 'undefined') {
          const { createApp } = Vue;
          createApp(App).mount('#app');
        } else {
          console.warn('No App component found. Make sure to define a component named "App".');
        }
      } catch (error) {
        console.error('Execution error:', error);
        document.body.innerHTML = '<div style="color: red; padding: 20px; font-family: monospace;"><h2>⚠️ Error</h2><pre style="background: #ffebee; padding: 15px; border-radius: 5px; overflow: auto;">' + error.message + '\\n\\n' + error.stack + '</pre><p style="margin-top: 20px; color: #666;">Tip: Make sure your component is named "App" and doesn\\'t use import statements.</p></div>';
      }
    })();
  </script>
</body>
</html>
    `.trim();
  }

  // Plain JavaScript/HTML/CSS
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  </style>
</head>
<body>
  <script>
    (function() {
      try {
        ${bundledCode.replace(/<\/script>/gi, '<\\/script>')}
      } catch (error) {
        console.error('Execution error:', error);
        document.body.innerHTML = '<div style="color: red; padding: 20px; font-family: monospace;"><h2>⚠️ Error</h2><pre style="background: #ffebee; padding: 15px; border-radius: 5px; overflow: auto;">' + error.message + '\\n\\n' + error.stack + '</pre></div>';
      }
    })();
  </script>
</body>
</html>
  `.trim();
};

/**
 * Build frontend code using Babel (via esbuild.ts utility)
 */
const runFrontendCode = async (
  code: string,
  language: Language
): Promise<RunCodeOutput> => {
  try {
    // Determine loader based on language
    const loader: 'js' | 'jsx' | 'ts' | 'tsx' =
      language === 'react' ? 'jsx' : 'js';

    // Build the code (Babel will be loaded automatically)
    const bundledCode = await buildCode(code, { loader });

    // Validate the bundled code
    if (!bundledCode || bundledCode.trim().length === 0) {
      return {
        type: 'error',
        output: 'Code transformation failed: empty result',
      };
    }

    // Generate HTML wrapper
    const html = generateHTML(bundledCode, language);

    return {
      type: 'iframe',
      output: html,
    };
  } catch (error: any) {
    console.error('Frontend code execution error:', error);
    return {
      type: 'error',
      output: `Build failed: ${error.message}`,
    };
  }
};

/**
 * Universal code runner
 * Routes to appropriate execution method based on language
 */
export const runCode = async (
  code: string,
  language: Language
): Promise<RunCodeOutput> => {
  // Validate inputs
  if (!code || !code.trim()) {
    return {
      type: 'error',
      output: 'No code to execute',
    };
  }

  try {
    // Route to appropriate runner
    if (language === 'node') {
      return await runNodeCode(code);
    } else {
      return await runFrontendCode(code, language);
    }
  } catch (error: any) {
    return {
      type: 'error',
      output: `Execution failed: ${error.message}`,
    };
  }
};

/**
 * Get supported languages
 */
export const getSupportedLanguages = (): Language[] => {
  return ['react', 'vue', 'node', 'javascript', 'html', 'css'];
};
