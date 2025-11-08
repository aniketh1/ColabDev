'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Rocket } from 'lucide-react';
import { AdvancedRunner } from './AdvancedRunner';

const projectTemplates = {
  react: {
    name: 'React App',
    description: 'React 18 + Vite',
    icon: '⚛️',
    files: {
      'App.jsx': `
import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
      <h1>🚀 React App in WebContainer</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)} style={{
        padding: '10px 20px',
        background: '#61dafb',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px'
      }}>
        Click me!
      </button>
    </div>
  );
}
      `.trim(),
    },
  },
  vue: {
    name: 'Vue App',
    description: 'Vue 3 + Vite',
    icon: '💚',
    files: {
      'App.vue': `
<template>
  <div style="padding: 40px; font-family: system-ui;">
    <h1>💚 Vue App in WebContainer</h1>
    <p>Count: {{ count }}</p>
    <button @click="count++" :style="buttonStyle">
      Click me!
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const count = ref(0);
const buttonStyle = computed(() => ({
  padding: '10px 20px',
  background: '#42b883',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
  color: 'white'
}));
</script>
      `.trim(),
    },
  },
  node: {
    name: 'Node.js Server',
    description: 'Express.js server',
    icon: '🟢',
    files: {
      'server.js': `
import http from 'http';

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  
  const html = \`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Node.js Server</title>
        <style>
          body {
            font-family: system-ui;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🟢 Node.js Server Running!</h1>
          <p>Path: \${req.url}</p>
          <p>Method: \${req.method}</p>
          <p>Time: \${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  \`;
  
  res.end(html);
});

server.listen(PORT, () => {
  console.log(\`✅ Server running on port \${PORT}\`);
});
      `.trim(),
    },
  },
};

export function ProjectTemplateSelector() {
  const [selectedTemplate, setSelectedTemplate] = useState<'react' | 'vue' | 'node' | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold">Create New Project</h2>
          </div>
          <p className="text-sm text-gray-500">
            Choose a template to start building with WebContainers
          </p>

          {/* Template Grid */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {Object.entries(projectTemplates).map(([key, template]) => (
              <button
                key={key}
                onClick={() => setSelectedTemplate(key as any)}
                className={`
                  p-6 border-2 rounded-lg text-center transition-all hover:border-purple-500 hover:shadow-lg
                  ${selectedTemplate === key ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}
                `}
              >
                <div className="text-4xl mb-3">{template.icon}</div>
                <h3 className="font-semibold mb-1">{template.name}</h3>
                <p className="text-xs text-gray-500">{template.description}</p>
              </button>
            ))}
          </div>

          {/* Run Button */}
          {selectedTemplate && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <AdvancedRunner
                files={projectTemplates[selectedTemplate].files}
                projectType={selectedTemplate}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
