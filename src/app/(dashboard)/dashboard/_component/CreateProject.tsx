"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Axios from "@/lib/Axios";
import { useRouter } from "next/navigation";
import { Code2, Layers } from "lucide-react";

type TechStack = 'html' | 'react' | 'vue' | 'node' | 'nextjs';

type TCreateProject = {
  buttonVarient?: "outline" | "default";
};

const techStacks = [
  {
    id: 'html' as TechStack,
    name: 'HTML/CSS/JS',
    description: 'Static website with HTML, CSS, and JavaScript',
    icon: '🌐',
    color: 'bg-orange-50 border-orange-200 hover:border-orange-400',
    files: {
      'index.html': '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My Project</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <script src="script.js"></script>\n</body>\n</html>',
      'style.css': 'body {\n  font-family: system-ui, -apple-system, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n}\n\nh1 {\n  text-align: center;\n}',
      'script.js': 'console.log("Welcome to your project!");',
    },
  },
  {
    id: 'react' as TechStack,
    name: 'React',
    description: 'React 18 app with Vite',
    icon: '⚛️',
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    files: {
      'package.json': JSON.stringify({
        name: 'react-app',
        version: '1.0.0',
        type: 'module',
        scripts: { dev: 'vite', build: 'vite build' },
        dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0' },
        devDependencies: { '@vitejs/plugin-react': '^4.0.0', vite: '^4.3.9' },
      }, null, 2),
      'index.html': '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>React App</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>',
      'vite.config.js': 'import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\n\nexport default defineConfig({\n  plugins: [react()],\n  server: { port: 3000 }\n});',
      'src/main.jsx': 'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\n\nReactDOM.createRoot(document.getElementById("root")).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);',
      'src/App.jsx': 'import React, { useState } from "react";\n\nfunction App() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div style={{ padding: "40px", fontFamily: "system-ui" }}>\n      <h1>Hello React! 🚀</h1>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}\n\nexport default App;',
    },
  },
  {
    id: 'vue' as TechStack,
    name: 'Vue',
    description: 'Vue 3 app with Vite',
    icon: '💚',
    color: 'bg-green-50 border-green-200 hover:border-green-400',
    files: {
      'package.json': JSON.stringify({
        name: 'vue-app',
        version: '1.0.0',
        scripts: { dev: 'vite' },
        dependencies: { vue: '^3.3.4' },
        devDependencies: { '@vitejs/plugin-vue': '^4.2.3', vite: '^4.3.9' },
      }, null, 2),
      'index.html': '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <title>Vue App</title>\n  </head>\n  <body>\n    <div id="app"></div>\n    <script type="module" src="/src/main.js"></script>\n  </body>\n</html>',
      'vite.config.js': 'import { defineConfig } from "vite";\nimport vue from "@vitejs/plugin-vue";\n\nexport default defineConfig({\n  plugins: [vue()],\n  server: { port: 3000 }\n});',
      'src/main.js': 'import { createApp } from "vue";\nimport App from "./App.vue";\n\ncreateApp(App).mount("#app");',
      'src/App.vue': '<template>\n  <div style="padding: 40px; font-family: system-ui;">\n    <h1>Hello Vue! 💚</h1>\n    <p>Count: {{ count }}</p>\n    <button @click="count++">Click me</button>\n  </div>\n</template>\n\n<script setup>\nimport { ref } from "vue";\nconst count = ref(0);\n</script>',
    },
  },
  {
    id: 'node' as TechStack,
    name: 'Node.js',
    description: 'Node.js server with Express',
    icon: '🟢',
    color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
    files: {
      'package.json': JSON.stringify({
        name: 'node-server',
        version: '1.0.0',
        type: 'module',
        main: 'server.js',
      }, null, 2),
      'server.js': 'import http from "http";\n\nconst PORT = 3000;\n\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { "Content-Type": "text/html" });\n  res.end(`\n    <!DOCTYPE html>\n    <html>\n      <head><title>Node.js Server</title></head>\n      <body style="font-family: system-ui; padding: 40px;">\n        <h1>🟢 Node.js Server Running!</h1>\n        <p>Path: ${req.url}</p>\n        <p>Method: ${req.method}</p>\n      </body>\n    </html>\n  `);\n});\n\nserver.listen(PORT, () => {\n  console.log(`Server running on port ${PORT}`);\n});',
    },
  },
];

const CreateProject = ({ buttonVarient }: TCreateProject) => {
  const [projectName, setProjectName] = useState<string>();
  const [selectedStack, setSelectedStack] = useState<TechStack>('html');
  const [step, setStep] = useState<1 | 2>(1);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (!projectName) {
      toast.error("Project name is required");
      return;
    }
    setStep(2);
  };

  const handleCreateProject = async () => {
    if (!projectName || !selectedStack) {
      toast.error("Please complete all steps");
      return;
    }

    try {
      setIsLoading(true);
      
      // Create project
      const response = await Axios.post("/api/project", {
        name: projectName,
        techStack: selectedStack,
      });

      if (response.status === 201) {
        const projectId = response?.data?.data?._id;
        
        // Create initial files based on tech stack
        const selectedTech = techStacks.find(t => t.id === selectedStack);
        if (selectedTech) {
          const filePromises = Object.entries(selectedTech.files).map(([fileName, content]) => 
            Axios.post("/api/project-file", {
              projectId,
              fileName,
              content,
            }).catch(err => console.error(`Failed to create ${fileName}:`, err))
          );
          
          await Promise.all(filePromises);
        }
        
        toast.success(`${selectedStack.toUpperCase()} project created successfully!`);
        
        // Navigate to editor with appropriate first file based on tech stack
        let firstFile = 'index.html';
        if (selectedStack === 'react') {
          firstFile = 'src/App.jsx';
        } else if (selectedStack === 'vue') {
          firstFile = 'src/App.vue';
        } else if (selectedStack === 'node') {
          firstFile = 'server.js';
        }
        
        // URL encode the file name to handle paths like 'src/App.jsx'
        router.push(`/editor/${projectId}?file=${encodeURIComponent(firstFile)}`);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to create project");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog onOpenChange={() => { setStep(1); setProjectName(''); setSelectedStack('html'); }}>
      <DialogTrigger asChild>
        <Button
          variant={buttonVarient ?? "outline"}
          className="cursor-pointer my-4 mx-2"
        >
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-blue-600" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            {step === 1 ? 'Step 1: Enter project name' : 'Step 2: Choose your tech stack'}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          {step === 1 ? (
            /* Step 1: Project Name */
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Project Name</label>
                <Input
                  disabled={isLoading}
                  placeholder="my-awesome-project"
                  value={projectName ?? ""}
                  onChange={(e) => setProjectName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  disabled={isLoading || !projectName}
                  onClick={handleNext}
                  className="gap-2"
                >
                  Next
                  <span>→</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Step 2: Tech Stack Selection */
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Select Tech Stack
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {techStacks.map((stack) => (
                    <button
                      key={stack.id}
                      type="button"
                      onClick={() => setSelectedStack(stack.id)}
                      className={`
                        p-4 border-2 rounded-lg text-left transition-all
                        ${selectedStack === stack.id 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : stack.color
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{stack.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{stack.name}</h3>
                          <p className="text-xs text-gray-600">{stack.description}</p>
                        </div>
                        {selectedStack === stack.id && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Files */}
              {selectedStack && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-medium mb-2">Files that will be created:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(techStacks.find(t => t.id === selectedStack)?.files || {}).map(fileName => (
                      <span key={fileName} className="text-xs px-2 py-1 bg-white border rounded">
                        📄 {fileName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  ← Back
                </Button>
                <Button
                  disabled={isLoading}
                  onClick={handleCreateProject}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin">⚙️</span>
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Project
                      <span>🚀</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProject;
