/**
 * Browser-based JSX/TypeScript transformer using Babel standalone
 * More reliable than esbuild-wasm across different browsers
 */

// Babel will be loaded from CDN at runtime
declare const Babel: any;

let babelLoaded = false;
let loadingPromise: Promise<void> | null = null;

/**
 * Load Babel standalone from CDN
 */
const loadBabel = async (): Promise<void> => {
  if (babelLoaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    // Check if Babel is already available
    if (typeof window !== 'undefined' && (window as any).Babel) {
      babelLoaded = true;
      resolve();
      return;
    }

    // Load Babel from CDN
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@babel/standalone@7.23.5/babel.min.js';
    script.async = true;
    script.onload = () => {
      babelLoaded = true;
      console.log('✅ Babel loaded successfully');
      resolve();
    };
    script.onerror = () => {
      loadingPromise = null;
      reject(new Error('Failed to load Babel'));
    };
    document.head.appendChild(script);
  });

  return loadingPromise;
};

/**
 * Initialize the code transformer (loads Babel if needed)
 */
export const initEsbuild = async (): Promise<void> => {
  try {
    await loadBabel();
  } catch (error) {
    console.error('❌ Failed to load Babel:', error);
    // Don't throw - we'll handle this gracefully in buildCode
  }
};

/**
 * Remove import/export statements and convert to inline code
 */
const removeImportsExports = (code: string): string => {
  let cleaned = code;
  
  // Remove all import statements - handle multiline imports
  // Remove: import ... from '...'
  cleaned = cleaned.replace(/import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"][^'"]+['"]\s*;?/g, '');
  
  // Remove: import '...'
  cleaned = cleaned.replace(/import\s+['"][^'"]+['"]\s*;?/g, '');
  
  // Convert: export default function/class Name
  cleaned = cleaned.replace(/export\s+default\s+(function|class)\s+(\w+)/g, '$1 $2');
  
  // Convert: export default
  cleaned = cleaned.replace(/export\s+default\s+/g, '');
  
  // Convert: export const/let/var/function/class
  cleaned = cleaned.replace(/export\s+(const|let|var|function|class)\s+/g, '$1 ');
  
  // Remove: export { ... }
  cleaned = cleaned.replace(/export\s+\{[^}]*\}\s*;?/g, '');
  
  // Remove: export * from '...'
  cleaned = cleaned.replace(/export\s+\*\s+from\s+['"][^'"]+['"]\s*;?/g, '');
  
  // Clean up multiple empty lines
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return cleaned.trim();
};



/**
 * Simple JSX transformer for basic React components
 * Handles simple JSX patterns and converts them to React.createElement calls
 */
const transformSimpleJSX = (code: string): string => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 Using simple JSX transformer');
  }

  // Replace basic JSX patterns manually
  let result = code;

  // Replace <div>content</div> with React.createElement("div", null, "content")
  result = result.replace(/<div>(.*?)<\/div>/gs, 'React.createElement("div", null, "$1")');

  // Replace <h1>content</h1> with React.createElement("h1", null, "content")
  result = result.replace(/<h1>(.*?)<\/h1>/gs, 'React.createElement("h1", null, "$1")');

  // Replace <p>content</p> with React.createElement("p", null, "content")
  result = result.replace(/<p>(.*?)<\/p>/gs, 'React.createElement("p", null, "$1")');

  // Replace <button onClick={...}>content</button>
  result = result.replace(/<button([^>]*)>(.*?)<\/button>/gs, (match, attrs, content) => {
    const onClickMatch = attrs.match(/onClick=\{([^}]+)\}/);
    const onClick = onClickMatch ? onClickMatch[1] : 'null';
    return `React.createElement("button", { onClick: ${onClick} }, "${content}")`;
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log('Simple JSX transformation completed');
  }

  return result;
};



/**
 * Transform JSX/TypeScript code to JavaScript using Babel
 * Falls back to untransformed code if Babel fails to load
 */
export const buildCode = async (
  code: string,
  options: {
    loader?: 'js' | 'jsx' | 'ts' | 'tsx';
    jsxFactory?: string;
    jsxFragment?: string;
  } = {}
): Promise<string> => {
  const { loader = 'jsx' } = options;

  try {
    // Remove imports/exports before transformation
    const cleanedCode = removeImportsExports(code);

    // For JSX, try Babel with classic runtime
    if (loader === 'jsx' || loader === 'tsx') {
      try {
        // Ensure Babel is loaded
        await loadBabel();

        if (typeof window !== 'undefined' && (window as any).Babel) {
          const Babel = (window as any).Babel;

          // Use classic runtime with explicit pragma
          const presets: any[] = [
            ['react', {
              runtime: 'classic',
              pragma: 'React.createElement',
              pragmaFrag: 'React.Fragment'
            }]
          ];

          if (loader === 'tsx') {
            presets.push('typescript');
          }

          // Transform the code
          if (process.env.NODE_ENV !== 'production') {
            console.log('🔄 Starting Babel transformation for:', loader);
            console.log('Input code:', cleanedCode.substring(0, 200));
          }

          const result = Babel.transform(cleanedCode, {
            presets,
            filename: `code.${loader}`,
            compact: false,
            comments: false,
            retainLines: false,
            plugins: [],
          });

          console.log('Babel result:', result);

          if (result.code) {
            let transformedCode = result.code;

            // Clean up the transformed code
            transformedCode = transformedCode
              .replace(/["']use strict["'];\s*/g, '')
              .replace(/\/\*#__PURE__\*\//g, '')
              .trim();

            // Validate the transformed code is complete
            if (transformedCode.length < cleanedCode.length * 0.5) {
              console.warn('⚠️ Transformed code seems too short, might be incomplete');
              console.log('Original:', cleanedCode);
              console.log('Transformed:', transformedCode);
            }

            if (process.env.NODE_ENV !== 'production') {
              console.log('📝 Original code length:', code.length);
              console.log('🧹 Cleaned code length:', cleanedCode.length);
              console.log('✨ Transformed code length:', transformedCode.length);
              console.log('✨ Final code preview:', transformedCode);
            }

            return transformedCode;
          } else {
            console.warn('⚠️ Babel returned no code');
          }
        }
      } catch (babelError) {
        console.warn('⚠️ Babel JSX transformation failed:', babelError);
      }

      // Fallback to simple JSX transformer
      console.log('🔄 Babel failed, using simple JSX transformer');
      try {
        const simpleResult = transformSimpleJSX(cleanedCode);
        console.log('Simple transformation result:', simpleResult.substring(0, 300));
        return simpleResult;
      } catch (simpleError) {
        console.warn('⚠️ Simple JSX transformation also failed:', simpleError);
      }

      // Final fallback to cleaned code
      console.log('🔄 Using cleaned JSX code as final fallback');
      return cleanedCode;
    }

    // For plain JS/TS, use Babel if available
    if (loader === 'js' || loader === 'ts') {
      try {
        await loadBabel();

        if (typeof window !== 'undefined' && (window as any).Babel) {
          const Babel = (window as any).Babel;

          const presets: any[] = [];
          if (loader === 'ts') {
            presets.push('typescript');
          }
          presets.push(['env', {
            targets: { browsers: ['> 1%', 'not ie 11'] },
            modules: false,
            loose: true,
          }]);

          const result = Babel.transform(cleanedCode, {
            presets,
            filename: `code.${loader}`,
            compact: false,
            comments: false,
            retainLines: false,
          });

          if (result.code) {
            let transformedCode = result.code;
            transformedCode = transformedCode
              .replace(/["']use strict["'];\s*/g, '')
              .replace(/\/\*#__PURE__\*\//g, '')
              .replace(/\s*void\s+0/g, ' undefined')
              .trim();

            return transformedCode;
          }
        }
      } catch (babelError) {
        console.warn('⚠️ Babel JS transformation failed:', babelError);
      }
    }

    // Final fallback
    console.warn('⚠️ All transformations failed, returning cleaned code');
    return cleanedCode;

  } catch (error: any) {
    console.error('❌ Code transformation error:', error);
    return removeImportsExports(code);
  }
};

/**
 * Check if transformer is ready
 */
export const isInitialized = (): boolean => babelLoaded;
