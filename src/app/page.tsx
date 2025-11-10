'use client'
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { TypeAnimation } from "react-type-animation";
import { Code2, Users, Zap, Cloud, MessageSquare, Shield, Rocket, BookOpen, Github, Linkedin, Twitter } from "lucide-react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import LiquidEther from "@/components/LiquidEther";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Logo colors for light and dark mode
  const lightModeColors = ['#5DADE2', '#3498DB', '#2980B9'] // Blue shades from logo
  const darkModeColors = ['#5DADE2', '#3498DB', '#1ABC9C'] // Blue + teal for dark mode

  const features = [
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Real-time Collaboration",
      description: "Work simultaneously with team members in a shared coding environment. See changes in real-time."
    },
    {
      icon: <Code2 className="w-8 h-8 text-primary" />,
      title: "Multi-language Support",
      description: "Develop in over 30+ programming languages with syntax highlighting and code completion."
    },
    {
      icon: <Cloud className="w-8 h-8 text-primary" />,
      title: "Cloud Auto-save & Version History",
      description: "Never lose your work with automatic cloud saving. Track and restore previous versions of your code anytime."
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-primary" />,
      title: "Chat & Commenting System",
      description: "Discuss code and share feedback directly within the IDE. Build a collaborative environment."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Role-based Access Control",
      description: "Manage permissions and access levels for different team members and collaborators."
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Instant Preview",
      description: "See your code come to life instantly with our integrated live preview feature."
    }
  ]

  const useCases = [
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Developers",
      description: "Work faster with real-time collaboration, cloud-based IDE, and smart code tools."
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Students",
      description: "Code, debug, and learn programming languages and best practices easily."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Interviewers",
      description: "Run live coding sessions, interviews, and tests in a shared space."
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Bootcamps",
      description: "Collaborate on team projects and learn together in a digital workspace."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Remote Teams",
      description: "Stay synced with your distributed team through our collaborative platform."
    }
  ]

  const quickLinks = {
    product: [
      { name: "Home", href: "/" },
      { name: "Features", href: "#features" },
      { name: "Dashboard", href: "/dashboard" },
      { name: "Roadmap", href: "#" }
    ],
    company: [
      { name: "About Us", href: "#" },
      { name: "Contact", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Blog", href: "#" }
    ],
    support: [
      { name: "Help Center", href: "#" },
      { name: "Documentation", href: "#" },
      { name: "Community", href: "#" },
      { name: "Status Page", href: "#" }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden transition-colors duration-300 relative">
      {/* Liquid Ether Background Animation */}
      {mounted && (
        <div className="fixed inset-0 z-0 opacity-30 dark:opacity-40 pointer-events-none">
          <LiquidEther
            colors={theme === 'dark' ? darkModeColors : lightModeColors}
            mouseForce={15}
            cursorSize={120}
            isViscous={false}
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.4}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.3}
            autoIntensity={1.8}
            takeoverDuration={0.25}
            autoResumeDelay={2000}
            autoRampDuration={0.6}
          />
        </div>
      )}
      
      {/* Content Wrapper */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-border">
        <div className="container px-4 mx-auto flex items-center justify-between h-20">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#use-cases" className="text-sm font-medium hover:text-primary transition-colors">Use Cases</a>
            <a href="#learn" className="text-sm font-medium hover:text-primary transition-colors">Learn</a>
            <a href="/explore" className="text-sm font-medium hover:text-primary transition-colors">🔍 Explore</a>
            <a href="/about" className="text-sm font-medium hover:text-primary transition-colors">About</a>
            <a href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button onClick={() => router.push("/sign-in")} variant="outline" className="cursor-pointer">Login</Button>
            <Button onClick={() => router.push("/sign-up")} className="cursor-pointer hidden sm:inline-flex">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container px-4 mx-auto py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Code with CodeV</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
              Code. Connect.
            </span>
            <br />
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Create. Live.
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A collaborative coding platform where developers, students, and teams build together and examine. Watch it unfold. Share your vision live.
          </p>

          <div className="h-12 mb-8">
            <TypeAnimation
              sequence={[
                '> npm run dev',
                2000,
                '> Create amazing projects',
                2000,
                '> Collaborate in real-time',
                2000,
                '> Build the future together',
                2000,
              ]}
              wrapper="div"
              speed={50}
              repeat={Infinity}
              className="text-primary font-mono text-lg"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button onClick={() => router.push("/sign-up")} size="lg" className="cursor-pointer px-8">
              <Rocket className="w-5 h-5 mr-2" />
              Get Started
            </Button>
            <Button onClick={() => router.push("/sign-in")} variant="outline" size="lg" className="cursor-pointer px-8">
              <Code2 className="w-5 h-5 mr-2" />
              Explore
            </Button>
          </div>
        </div>

        {/* Banner Video */}
        <div className="max-w-5xl mx-auto mt-16 rounded-xl overflow-hidden shadow-2xl border border-border bg-black/5 dark:bg-white/5">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto"
          >
            <source src="/video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      {/* Gen-Z Learning Section */}
      <section id="learn" className="py-20 lg:py-32 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container px-4 mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-4 py-2 text-sm font-semibold">
                <span className="animate-pulse">✨</span>
                <span>NO CAP FR FR</span>
              </div>
              
              <h2 className="text-4xl lg:text-6xl font-black leading-tight">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Learn By Doing,
                </span>
                <br />
                <span className="text-foreground">
                  Not Just Watching
                </span>
                <span className="ml-2 inline-block animate-bounce">👀</span>
              </h2>

              <div className="space-y-4 text-lg text-muted-foreground">
                <p className="flex items-start gap-3">
                  <span className="text-2xl">🔥</span>
                  <span><strong className="text-foreground">Vibe Check:</strong> Peep real projects from devs crushing it right now. No cap, these are actual working codes!</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-2xl">💯</span>
                  <span><strong className="text-foreground">No Gatekeeping:</strong> Read-only access means you can explore everything without breaking stuff. It&apos;s giving safe space energy!</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-2xl">🚀</span>
                  <span><strong className="text-foreground">Main Character Energy:</strong> See how projects evolve, learn patterns, and level up your coding game. That&apos;s the tea sis!</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-2xl">✨</span>
                  <span><strong className="text-foreground">Built Different:</strong> From HTML basics to React wizardry - find projects that match your vibe and skill level.</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  onClick={() => router.push("/explore")} 
                  size="lg" 
                  className="cursor-pointer px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg group"
                >
                  <span className="mr-2 group-hover:scale-110 transition-transform inline-block">🔍</span>
                  Start Exploring Projects
                  <Rocket className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  onClick={() => router.push("/sign-up")} 
                  variant="outline" 
                  size="lg" 
                  className="cursor-pointer px-8 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 font-semibold"
                >
                  Join the Squad
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">1000+</div>
                  <div className="text-sm text-muted-foreground">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">500+</div>
                  <div className="text-sm text-muted-foreground">Devs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">24/7</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="relative">
              <div className="relative z-10 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-border p-8 transform hover:scale-105 transition-transform duration-300">
                {/* Code Window */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-4 border-b border-border">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="ml-4 text-sm text-muted-foreground font-mono">explore-projects.tsx</span>
                  </div>
                  
                  <div className="space-y-2 font-mono text-sm">
                    <div className="text-purple-600 dark:text-purple-400">
                      <span className="text-blue-600 dark:text-blue-400">const</span> learningMode = <span className="text-green-600 dark:text-green-400">&apos;activated&apos;</span>;
                    </div>
                    <div className="text-purple-600 dark:text-purple-400">
                      <span className="text-blue-600 dark:text-blue-400">const</span> vibeCheck = <span className="text-green-600 dark:text-green-400">&apos;immaculate&apos;</span>;
                    </div>
                    <div className="h-2"></div>
                    <div className="text-pink-600 dark:text-pink-400">
                      <span className="text-blue-600 dark:text-blue-400">function</span> <span className="text-yellow-600 dark:text-yellow-400">levelUp</span>() {"{"}
                    </div>
                    <div className="pl-4 text-muted-foreground">
                      <span className="text-purple-600 dark:text-purple-400">explore</span>(<span className="text-green-600 dark:text-green-400">&apos;community-projects&apos;</span>);
                    </div>
                    <div className="pl-4 text-muted-foreground">
                      <span className="text-purple-600 dark:text-purple-400">learn</span>(<span className="text-green-600 dark:text-green-400">&apos;real-code&apos;</span>);
                    </div>
                    <div className="pl-4 text-muted-foreground">
                      <span className="text-purple-600 dark:text-purple-400">build</span>(<span className="text-green-600 dark:text-green-400">&apos;amazing-stuff&apos;</span>);
                    </div>
                    <div className="text-pink-600 dark:text-pink-400">{"}"}</div>
                  </div>

                  {/* Animated Elements */}
                  <div className="pt-6 space-y-3">
                    <div className="flex items-center gap-3 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs text-green-600 dark:text-green-400 font-semibold">Real-time projects loading...</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></div>
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">50+ devs coding right now!</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                      <span className="text-xs text-pink-600 dark:text-pink-400 font-semibold">New project just dropped! 🔥</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl p-4 shadow-lg transform rotate-12 hover:rotate-0 transition-transform">
                <div className="text-2xl font-black">100%</div>
                <div className="text-xs font-semibold">FREE</div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-green-400 to-cyan-500 text-white rounded-2xl p-4 shadow-lg transform -rotate-12 hover:rotate-0 transition-transform">
                <div className="text-2xl">🎯</div>
                <div className="text-xs font-semibold">BASED</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Collab Dev IDE Features
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A modern development environment designed for team collaboration and productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
                <CardHeader>
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 lg:py-32">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              Your Coding Companion, <br />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                No Matter Who You Are
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {useCases.map((useCase, index) => (
              <Card key={index} className="bg-card hover:bg-primary/5 transition-all border-2 hover:border-primary/50 hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    {useCase.icon}
                  </div>
                  <CardTitle className="text-lg">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-sm">{useCase.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button onClick={() => router.push("/sign-up")} size="lg" className="cursor-pointer px-8">
              Start Coding Now
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-blue-500/10 to-primary/10">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your <br />
            <span className="text-primary">Development Workflow?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already building amazing projects together.
          </p>
          <Button onClick={() => router.push("/sign-up")} size="lg" className="cursor-pointer px-8">
            <Rocket className="w-5 h-5 mr-2" />
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-black text-slate-200 py-12 border-t border-slate-800">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <Logo />
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Real-time collaborative coding platform that makes team collaboration effortless. Build, share, and deploy together.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                {quickLinks.product.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-sm text-slate-400 hover:text-primary transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="/about" className="text-sm text-slate-400 hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2">
                {quickLinks.support.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-sm text-slate-400 hover:text-primary transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              © 2025 ColabDev. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-400 hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-slate-400 hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-slate-400 hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
