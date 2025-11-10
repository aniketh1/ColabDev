'use client'
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { TypeAnimation } from "react-type-animation";
import { Code2, Users, Zap, Cloud, MessageSquare, Shield, Rocket, BookOpen, Github, Linkedin, Twitter } from "lucide-react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function Home() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

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
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-border">
        <div className="container px-4 mx-auto flex items-center justify-between h-20">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#use-cases" className="text-sm font-medium hover:text-primary transition-colors">Use Cases</a>
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
  );
}
