import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Zap,
  Brain,
  Gauge,
  MessageSquare,
  Map,
  BookOpen,
  ArrowRight,
  Github,
  Sparkles,
} from "lucide-react";
import { useLocation } from "wouter";

export default function EnhancedLanding() {
  const [, setLocation] = useLocation();
  const [repoUrl, setRepoUrl] = useState("");
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAnalyze = () => {
    if (repoUrl.trim()) {
      setLocation(`/dashboard?repo=${encodeURIComponent(repoUrl)}`);
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI Narrative",
      description: "Claude-powered codebase explanation",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Map,
      title: "Architecture Map",
      description: "Interactive dependency visualization",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Gauge,
      title: "Complexity Heatmap",
      description: "Risk scoring and metrics",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: MessageSquare,
      title: "Ask Anything",
      description: "Context-aware Q&A about your code",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: BookOpen,
      title: "Onboarding Paths",
      description: "Role-based learning guides",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: Sparkles,
      title: "Code Preview",
      description: "Syntax-highlighted file browser",
      color: "from-yellow-500 to-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          style={{ transform: `translateY(-${scrollY * 0.3}px)` }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">DevLens AI</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Badge
            variant="outline"
            className="mx-auto gap-2 bg-accent/10 border-accent/30 text-accent"
          >
            <Sparkles className="w-3 h-3" />
            AI-Powered Code Intelligence
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Your Codebase,
            <br />
            <span className="bg-gradient-to-r from-accent via-accent/80 to-accent/60 bg-clip-text text-transparent">
              Explained Like a Story
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            DevLens AI transforms any GitHub repository into an interactive learning experience.
            Get instant AI-powered insights, visual architecture maps, and personalized onboarding
            paths.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <div className="flex gap-2 w-full max-w-md mx-auto">
              <Input
                placeholder="Paste GitHub repo URL..."
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                className="bg-background/50 border-border/50"
              />
              <Button onClick={handleAnalyze} className="gap-2" size="lg">
                Analyze
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8 text-sm">
            <div className="space-y-1">
              <p className="font-semibold text-accent">60s</p>
              <p className="text-muted-foreground">To understand any codebase</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-accent">Any Repo</p>
              <p className="text-muted-foreground">Public or private</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-accent">Zero Setup</p>
              <p className="text-muted-foreground">Just paste a URL</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Five Features, One Powerful Tool</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card
                key={idx}
                className="group relative overflow-hidden border-border/50 hover:border-accent/50 transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setIsHovered(feature.title)}
                onMouseLeave={() => setIsHovered(null)}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-br ${feature.color} text-white group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    {isHovered === feature.title && (
                      <ArrowRight className="w-5 h-5 text-accent animate-in fade-in slide-in-from-left-2 duration-300" />
                    )}
                  </div>
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: "1", title: "Paste URL", desc: "Enter any GitHub repository URL" },
            { step: "2", title: "Analyze", desc: "AI analyzes the entire codebase" },
            { step: "3", title: "Explore", desc: "Browse interactive visualizations" },
            { step: "4", title: "Learn", desc: "Get personalized insights and paths" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="p-6 rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center text-white font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              {idx < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-accent/50 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Card className="border-accent/50 bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="py-12">
            <h2 className="text-3xl font-bold mb-4">Ready to understand your codebase?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start with any public GitHub repository. No authentication required. No limits.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Input
                placeholder="github.com/username/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                className="max-w-xs"
              />
              <Button onClick={handleAnalyze} size="lg" className="gap-2">
                Analyze Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <p>DevLens AI © 2026. Powered by Claude AI and modern web technologies.</p>
      </footer>
    </div>
  );
}
