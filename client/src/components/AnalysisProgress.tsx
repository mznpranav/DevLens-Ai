import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Zap } from "lucide-react";

interface AnalysisStep {
  id: string;
  label: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "error";
  progress?: number;
}

interface AnalysisProgressProps {
  status: "pending" | "analyzing" | "completed" | "failed";
  steps?: AnalysisStep[];
  currentStep?: string;
  estimatedTime?: number;
  elapsedTime?: number;
}

export default function AnalysisProgress({
  status,
  steps = [
    {
      id: "fetch",
      label: "Fetching Repository",
      description: "Cloning and analyzing repository structure",
      status: "pending",
    },
    {
      id: "analyze",
      label: "Code Analysis",
      description: "Parsing files and building dependency graph",
      status: "pending",
    },
    {
      id: "narrative",
      label: "Generating Narrative",
      description: "Creating AI-powered codebase explanation",
      status: "pending",
    },
    {
      id: "heatmap",
      label: "Complexity Analysis",
      description: "Calculating risk scores and complexity metrics",
      status: "pending",
    },
    {
      id: "onboarding",
      label: "Onboarding Paths",
      description: "Generating role-based learning paths",
      status: "pending",
    },
  ],
  currentStep,
  estimatedTime = 60,
  elapsedTime = 0,
}: AnalysisProgressProps) {
  const [displaySteps, setDisplaySteps] = useState(steps);
  const [animatedElapsed, setAnimatedElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedElapsed((prev) => (prev < elapsedTime ? prev + 1 : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, [elapsedTime]);

  useEffect(() => {
    const updatedSteps = displaySteps.map((step) => {
      if (step.id === currentStep) {
        return { ...step, status: "in-progress" as const };
      }
      if (displaySteps.findIndex((s) => s.id === currentStep) > displaySteps.findIndex((s) => s.id === step.id)) {
        return { ...step, status: "completed" as const };
      }
      return step;
    });
    setDisplaySteps(updatedSteps);
  }, [currentStep]);

  const completedSteps = displaySteps.filter((s) => s.status === "completed").length;
  const overallProgress = (completedSteps / displaySteps.length) * 100;

  return (
    <Card className="bg-gradient-to-br from-background to-background/95 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Analysis in Progress
            </CardTitle>
            <CardDescription>Processing your repository</CardDescription>
          </div>
          <Badge
            variant={
              status === "completed"
                ? "default"
                : status === "failed"
                  ? "destructive"
                  : "secondary"
            }
            className="gap-1"
          >
            <Clock className="w-3 h-3" />
            {Math.floor(animatedElapsed)}s / {estimatedTime}s
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        <div className="space-y-3">
          {displaySteps.map((step, idx) => (
            <div
              key={step.id}
              className={`p-3 rounded-lg border transition-all duration-300 ${
                step.status === "completed"
                  ? "bg-accent/5 border-accent/30"
                  : step.status === "in-progress"
                    ? "bg-accent/10 border-accent/50 ring-1 ring-accent/20"
                    : "bg-background/50 border-border/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {step.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-accent animate-pulse" />
                  ) : step.status === "in-progress" ? (
                    <div className="w-5 h-5 rounded-full border-2 border-accent border-r-transparent animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-border/50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                  {step.progress !== undefined && step.status === "in-progress" && (
                    <Progress value={step.progress} className="h-1 mt-2" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {status === "completed" && (
          <div className="p-3 rounded-lg bg-accent/10 border border-accent/30 text-center">
            <p className="text-sm font-medium text-accent">✨ Analysis Complete!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your codebase is ready to explore
            </p>
          </div>
        )}

        {status === "failed" && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
            <p className="text-sm font-medium text-destructive">Analysis Failed</p>
            <p className="text-xs text-muted-foreground mt-1">
              Please try again with a different repository
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
