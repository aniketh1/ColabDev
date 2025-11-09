'use client'
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Code2, Users, Lightbulb, TrendingUp, Github, Linkedin, Mail } from "lucide-react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AboutPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const stats = [
    { value: "50K+", label: "Lines of Code" },
    { value: "2+", label: "Developers" },
    { value: "∞", label: "Possibilities" }
  ]

  const teamMembers = [
    {
      name: "Aniket V Korwar",
      role: "Full Stack Developer & Project Lead",
      college: "USN: 1BM23IS403",
      avatar: "AK",
      color: "bg-blue-500",
      description: "Leading the development of ColabDev with expertise in Next.js, React.js, Node.js, and real-time systems.",
      linkedin: "#",
      github: "#",
      email: "#"
    },
    {
      name: "Rohan Raju Navalyal",
      role: "Data Analyst & System Architect",
      college: "USN: 1BM22IS162",
      avatar: "RN",
      color: "bg-green-500",
      description: "Specializing in scalable backend systems, database design, and cloud infrastructure.",
      linkedin: "#",
      github: "#",
      email: "#"
    },
    {
      name: "Suprit Sanadi",
      role: "Cloud Engineer",
      college: "USN: 1BM23IS416",
      avatar: "SS",
      color: "bg-emerald-500",
      description: "Dedicated to optimizing cloud deployments and ensuring robust, scalable infrastructure.",
      linkedin: "#",
      github: "#",
      email: "#"
    }
  ]

  const mission = {
    title: "Our Mission",
    content: "To revolutionize the way developers collaborate by providing a cloud-based platform that eliminates geographical barriers and makes real-time collaboration accessible for everyone.",
    vision: "We envision a world where developers can seamlessly work together on projects, share knowledge, and build innovative solutions regardless of their physical location."
  }

  const coreValues = [
    {
      title: "Collaboration First",
      description: "We believe that the best code is written together. Our platform is designed to make remote collaboration as seamless as working side by side.",
      icon: <Users className="w-6 h-6 text-primary" />
    },
    {
      title: "Developer Experience",
      description: "Every feature is crafted with developers in mind. From syntax highlighting to real-time debugging, we prioritize what makes coding enjoyable.",
      icon: <Code2 className="w-6 h-6 text-primary" />
    },
    {
      title: "Open Innovation",
      description: "We're committed to open-source principles and making collaborative coding accessible to developers worldwide regardless of their background.",
      icon: <Lightbulb className="w-6 h-6 text-primary" />
    },
    {
      title: "Continuous Learning",
      description: "Our platform evolves with the developer community, incorporating feedback and staying ahead of the latest technologies and practices.",
      icon: <TrendingUp className="w-6 h-6 text-primary" />
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-border">
        <div className="container px-4 mx-auto flex items-center justify-between h-20">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</a>
            <a href="/#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="/about" className="text-sm font-medium text-primary">About</a>
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
            <Button onClick={() => router.push("/login")} variant="outline" className="cursor-pointer">Login</Button>
            <Button onClick={() => router.push("/register")} className="cursor-pointer hidden sm:inline-flex">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container px-4 mx-auto py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              About ColabDev
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Empowering developers worldwide with seamless real-time collaboration tools that make coding together as natural as coding alone.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5">
                <CardHeader>
                  <CardTitle className="text-2xl lg:text-3xl text-primary">{mission.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{mission.content}</p>
                </CardContent>
              </Card>

              <div className="flex items-center">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {mission.vision}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 lg:py-32">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Meet Our Team
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              The passionate developers behind ColabDev
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-xl group text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <Avatar className={`w-24 h-24 ${member.color} text-white text-3xl font-bold border-4 border-background shadow-lg`}>
                      <AvatarFallback className={`${member.color} text-white text-3xl`}>
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-primary font-semibold">{member.role}</CardDescription>
                  <div className="text-sm text-muted-foreground mt-1">{member.college}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{member.description}</p>
                  <div className="flex items-center justify-center gap-3">
                    <a href={member.github} className="w-9 h-9 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                    <a href={member.linkedin} className="w-9 h-9 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href={member.email} className="w-9 h-9 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Our Core Values
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {coreValues.map((value, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {value.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-primary mb-2">{value.title}</CardTitle>
                      <CardDescription className="text-base">{value.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-blue-500/10 to-primary/10">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Join Us in Building the Future <br />
            <span className="text-primary">of Collaborative Development</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be part of a community that's reshaping how developers work together.
          </p>
          <Button onClick={() => router.push("/register")} size="lg" className="cursor-pointer px-8">
            Get Started Today
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
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="/" className="text-sm text-slate-400 hover:text-primary transition-colors">Home</a></li>
                <li><a href="/#features" className="text-sm text-slate-400 hover:text-primary transition-colors">Features</a></li>
                <li><a href="/dashboard" className="text-sm text-slate-400 hover:text-primary transition-colors">Dashboard</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="/about" className="text-sm text-slate-400 hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-slate-400 hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-primary transition-colors">Community</a></li>
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
