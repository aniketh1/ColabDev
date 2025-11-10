"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Axios from "@/lib/Axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Code2, Clock, User as UserIcon, Eye, Sparkles } from "lucide-react";
import Link from "next/link";

type Project = {
  _id: string;
  name: string;
  techStack: string;
  lastActiveAt: string;
  updatedAt: string;
  createdAt: string;
  owner: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    clerkId: string;
  };
};

export default function ExplorePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"recent" | "all">("recent");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn) {
      fetchProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, filter]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await Axios.get(`/api/explore?filter=${filter}&limit=20`);
      if (response.status === 200) {
        setProjects(response.data.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch projects:", error);
      setError(error.response?.data?.message || "Failed to load projects. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 432000) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getTechStackIcon = (techStack: string) => {
    const icons: Record<string, string> = {
      html: "🌐",
      react: "⚛️",
      node: "🟢",
      nextjs: "▲",
    };
    return icons[techStack] || "📄";
  };

  const getTechStackColor = (techStack: string) => {
    const colors: Record<string, string> = {
      html: "bg-orange-100 text-orange-700 border-orange-300",
      react: "bg-blue-100 text-blue-700 border-blue-300",
      node: "bg-green-100 text-green-700 border-green-300",
      nextjs: "bg-gray-100 text-gray-700 border-gray-300",
    };
    return colors[techStack] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Explore Projects</h1>
                <p className="text-sm text-gray-600">Discover and learn from community projects</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setFilter("recent")}
            variant={filter === "recent" ? "default" : "outline"}
            className="gap-2"
          >
            <Clock className="w-4 h-4" />
            Recent (5 days)
          </Button>
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
            className="gap-2"
          >
            <Code2 className="w-4 h-4" />
            All Projects
          </Button>
        </div>

        {/* Projects Grid */}
        {error ? (
          <div className="text-center py-16">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Projects</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchProjects}>Try Again</Button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-48">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <Code2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-6">
              {filter === "recent" 
                ? "No projects have been active in the last 5 days."
                : "No public projects available yet."}
            </p>
            <Link href="/dashboard">
              <Button>Create Your First Project</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project._id}
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {project.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full border font-medium ${getTechStackColor(
                            project.techStack
                          )}`}
                        >
                          {getTechStackIcon(project.techStack)} {project.techStack.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserIcon className="w-4 h-4" />
                      <span className="truncate">
                        {project.owner.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Last active {getTimeAgo(project.lastActiveAt)}</span>
                    </div>
                    <Link
                      href={`/browser/${project.owner.name}/${project._id}/index.html`}
                      className="block"
                    >
                      <Button
                        variant="outline"
                        className="w-full gap-2 group-hover:bg-blue-50 group-hover:border-blue-300 group-hover:text-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Project (Read-only)
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
