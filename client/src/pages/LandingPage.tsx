import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Zap, GitBranch, Brain, MessageSquare, Map, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

export default function LandingPage() {
  const [, navigate] = useLocation();

  const features = [
    {
      icon: Map,
      title: "Visual Architecture Map",
      description: "Interactive dependency graph showing modules, relationships, and data flow",
    },
    {
      icon: Brain,
      title: "AI Narrative Summary",
      description: "Claude-powered plain-English explanation of your entire codebase",
    },
    {
      icon: MessageSquare,
      title: "Ask-Anything Chat",
      description: "Natural language Q&A with file and line number references",
    },
    {
      icon: TrendingUp,
      title: "Complexity Heatmap",
      description: "Risk scoring to highlight the most complex and untested files",
    },
    {
      icon: GitBranch,
      title: "Smart Onboarding Path",
      description: "Role-based reading guide tailored for Frontend, Backend, or DevOps",
    },
    {
      icon: Zap,
      title: "Instant Analysis",
      description: "Understand any GitHub repo in under 60 seconds",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Paste Repo URL",
      description: "Authenticate with GitHub and drop in any public or private repository URL",
    },
    {
      number: "02",
      title: "AI Analysis",
      description: "DevLens fetches the code, builds an AST, and sends it to Claude for deep analysis",
    },
    {
      number: "03",
      title: "Explore Dashboard",
      description: "View your architecture map, read the AI narrative, and check the heatmap",
    },
    {
      number: "04",
      title: "Ask & Learn",
      description: "Use the chat sidebar to ask specific questions and drill into any part of the code",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 animate-in fade-in duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold">DevLens AI</span>
          </div>
          <Button onClick={() => navigate("/dashboard")} variant="default">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">AI-Powered Code Intelligence</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Your Codebase,
              <br />
              <span className="bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
                Explained Like a Story
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              DevLens AI is an AI-powered codebase onboarding co-pilot that turns any GitHub repo into a living,
              interactive explainer — like having a senior developer walk you through the code on day one.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              Analyze a Repository <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center pt-8 border-t border-border">
            <div>
              <div className="text-2xl font-bold text-accent">60s</div>
              <div className="text-sm text-muted-foreground">To understand a codebase</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">Any Repo</div>
              <div className="text-sm text-muted-foreground">Public or private</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">Zero Setup</div>
              <div className="text-sm text-muted-foreground">Just paste a URL</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-card/50 py-20 animate-in fade-in duration-700 delay-300">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Five Features. One Powerful Tool.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to understand any codebase instantly
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 animate-in fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader>
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20 animate-in fade-in duration-700 delay-500">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From repo URL to full understanding in 4 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-accent/10 border-2 border-accent rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-accent">{step.number}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-8 h-0.5 bg-gradient-to-r from-accent to-transparent" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-card/50 py-20 animate-in fade-in duration-700 delay-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to understand your codebase?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Every developer deserves a senior mentor on day one. DevLens AI makes that a reality — for every repo,
            every team, every developer.
          </p>
          <Button size="lg" onClick={() => navigate("/dashboard")} className="gap-2">
            Start Analyzing Now <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 DevLens AI. Built for developers, by developers.</p>
        </div>
      </footer>
    </div>
  );
}
