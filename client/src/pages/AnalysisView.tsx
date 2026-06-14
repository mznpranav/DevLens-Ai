import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Map, MessageSquare, BookOpen, TrendingUp, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import EnhancedChat from "@/components/EnhancedChat";
import AnalysisProgress from "@/components/AnalysisProgress";
import ArchitectureMap from "@/components/ArchitectureMap";
import CodePreview from "@/components/CodePreview";

interface AnalysisViewProps {
  analysisId: number;
}

export default function AnalysisView({ analysisId }: AnalysisViewProps) {
  const [chatMessage, setChatMessage] = useState("");
  const [selectedRole, setSelectedRole] = useState<"Frontend" | "Backend" | "DevOps">("Backend");
  const [activeTab, setActiveTab] = useState("narrative");

  const { data: analysis, isLoading: analysisLoading, error: analysisError } = trpc.analysis.getAnalysis.useQuery(
    { analysisId },
    { enabled: !!analysisId }
  );

  const { data: chatHistory, isLoading: chatLoading } = trpc.analysis.getChatHistory.useQuery(
    { analysisId },
    { enabled: !!analysisId }
  );

  const { data: onboardingPath, isLoading: onboardingLoading } = trpc.analysis.getOnboardingPath.useQuery(
    { analysisId, role: selectedRole },
    { enabled: !!analysisId }
  );

  const utils = trpc.useUtils();
  const chatMutation = trpc.analysis.chatWithCode.useMutation({
    onSuccess: () => {
      setChatMessage("");
      utils.analysis.getChatHistory.invalidate({ analysisId });
    },
  });

  const handleChat = (message: string) => {
    if (!message.trim()) return;
    chatMutation.mutate({
      analysisId,
      message,
    });
  };

  if (analysisLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  if (analysisError) {
    return (
      <Card className="border-destructive/50 bg-destructive/10">
        <CardContent className="py-12 text-center">
          <p className="text-destructive font-semibold mb-2">Error Loading Analysis</p>
          <p className="text-sm text-muted-foreground">{analysisError.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Analysis not found</p>
        </CardContent>
      </Card>
    );
  }

  // Parse fileTree if it's a string
  let fileTreeData = [];
  try {
    if (typeof analysis.fileTree === "string") {
      fileTreeData = JSON.parse(analysis.fileTree);
    } else {
      fileTreeData = analysis.fileTree;
    }
  } catch {
    fileTreeData = [];
  }

  // Parse architectureMap if it's a string
  let architectureData = { nodes: [], edges: [] };
  try {
    if (typeof analysis.architectureMap === "string") {
      architectureData = JSON.parse(analysis.architectureMap);
    } else {
      architectureData = analysis.architectureMap || { nodes: [], edges: [] };
    }
  } catch {
    architectureData = { nodes: [], edges: [] };
  }

  // Parse heatmap if it's a string
  let heatmapData = [];
  try {
    if (typeof analysis.heatmap === "string") {
      heatmapData = JSON.parse(analysis.heatmap);
    } else {
      heatmapData = analysis.heatmap || [];
    }
  } catch {
    heatmapData = [];
  }

  const suggestedPrompts = [
    "What are the main entry points?",
    "How is authentication handled?",
    "What are the key dependencies?",
    "Explain the data flow",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Repository Analysis</CardTitle>
              <CardDescription>Comprehensive codebase intelligence report</CardDescription>
            </div>
            <Badge variant={analysis.status === "completed" ? "default" : "secondary"}>
              {analysis.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {analysis.status === "analyzing" && (
        <AnalysisProgress
          status="analyzing"
          currentStep="analyze"
          estimatedTime={60}
          elapsedTime={30}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="narrative" className="gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Narrative</span>
          </TabsTrigger>
          <TabsTrigger value="architecture" className="gap-2">
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Architecture</span>
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Heatmap</span>
          </TabsTrigger>
          <TabsTrigger value="onboarding" className="gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Path</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="narrative">
          <Card>
            <CardHeader>
              <CardTitle>AI Narrative Summary</CardTitle>
              <CardDescription>Claude-powered explanation of your codebase</CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.narrative ? (
                <ScrollArea className="h-96 w-full rounded-lg border border-border p-4">
                  <Streamdown>{analysis.narrative}</Streamdown>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground">No narrative available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="architecture">
          <ArchitectureMap
            nodes={architectureData.nodes || []}
            edges={architectureData.edges || []}
            title="Architecture Map"
          />
        </TabsContent>

        <TabsContent value="heatmap">
          <Card>
            <CardHeader>
              <CardTitle>Complexity Heatmap</CardTitle>
              <CardDescription>Risk scores for files and modules</CardDescription>
            </CardHeader>
            <CardContent>
              {heatmapData && heatmapData.length > 0 ? (
                <ScrollArea className="h-96 w-full rounded-lg border border-border p-4">
                  <div className="space-y-2">
                    {heatmapData.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-card/50 border border-border/30 hover:border-accent/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{item.file || `File ${idx + 1}`}</span>
                          <Badge
                            variant={
                              (item.complexity || 0) > 0.7
                                ? "destructive"
                                : (item.complexity || 0) > 0.4
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {Math.round((item.complexity || 0) * 100)}%
                          </Badge>
                        </div>
                        <div className="w-full bg-background/50 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              (item.complexity || 0) > 0.7
                                ? "bg-destructive"
                                : (item.complexity || 0) > 0.4
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{ width: `${(item.complexity || 0) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground">No heatmap data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding">
          <Card>
            <CardHeader>
              <CardTitle>Smart Onboarding Path</CardTitle>
              <CardDescription>Role-based learning guide</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2 mb-6">
                  {(["Frontend", "Backend", "DevOps"] as const).map((role) => (
                    <Button
                      key={role}
                      variant={selectedRole === role ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRole(role)}
                    >
                      {role}
                    </Button>
                  ))}
                </div>

                {onboardingLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="w-6 h-6" />
                  </div>
                ) : onboardingPath && Array.isArray(onboardingPath) && onboardingPath.length > 0 ? (
                  <div className="space-y-3">
                    {(onboardingPath as any[]).map((step: string, index: number) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-card/50 border border-border/30 hover:border-accent/50 transition-colors"
                      >
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-accent">{index + 1}</span>
                          </div>
                          <p className="text-sm leading-relaxed">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No onboarding path available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="h-96">
          <EnhancedChat
            messages={
              chatHistory?.map((msg) => ({
                ...msg,
                fileReferences:
                  typeof msg.fileReferences === "string"
                    ? JSON.parse(msg.fileReferences || "[]")
                    : msg.fileReferences,
              })) || []
            }
            isLoading={chatMutation.isPending}
            onSendMessage={handleChat}
            suggestedPrompts={suggestedPrompts}
          />
        </TabsContent>
      </Tabs>

      {fileTreeData.length > 0 && (
        <CodePreview
          files={fileTreeData.slice(0, 5).map((file: any, idx: number) => ({
            name: file.name || `File ${idx + 1}`,
            path: file.path || `file-${idx}`,
            language: file.language || "text",
            content: `// ${file.name}\n// Type: ${file.type}\n// Size: ${file.size} bytes`,
            lines: 3,
            complexity: Math.random() * 0.8,
          }))}
        />
      )}
    </div>
  );
}
