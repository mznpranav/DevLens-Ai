import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { ArrowRight, Github, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import AnalysisView from "./AnalysisView";

export default function Dashboard() {
  const [repoUrl, setRepoUrl] = useState("");
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("history");

  const { data: history, isLoading: historyLoading } = trpc.analysis.getAnalysisHistory.useQuery(undefined, {
    enabled: true,
  });

  const analyzeRepoMutation = trpc.analysis.analyzeRepository.useMutation({
    onSuccess: (data) => {
      setSelectedAnalysisId(data.analysisId);
      setActiveTab("analysis");
      setRepoUrl("");
    },
  });

  const handleAnalyze = () => {
    if (!repoUrl.trim()) return;
    analyzeRepoMutation.mutate({ repoUrl });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Analysis Input */}
        <Card className="border-accent/20 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="w-5 h-5" />
              Analyze a Repository
            </CardTitle>
            <CardDescription>Paste any GitHub repository URL to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="https://github.com/owner/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                disabled={analyzeRepoMutation.isPending}
              />
              <Button
                onClick={handleAnalyze}
                disabled={!repoUrl.trim() || analyzeRepoMutation.isPending}
                className="gap-2"
              >
                {analyzeRepoMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
            {analyzeRepoMutation.error && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-2">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{analyzeRepoMutation.error.message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">Analysis History</TabsTrigger>
            <TabsTrigger value="analysis" disabled={!selectedAnalysisId}>
              Current Analysis
            </TabsTrigger>
          </TabsList>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            {historyLoading ? (
              <div className="flex justify-center py-12">
                <Spinner className="w-6 h-6" />
              </div>
            ) : history && history.length > 0 ? (
              <div className="grid gap-4">
                {history.map((analysis) => (
                  <Card
                    key={analysis.id}
                    className="cursor-pointer hover:border-accent/50 transition-colors"
                    onClick={() => {
                      setSelectedAnalysisId(analysis.id);
                      setActiveTab("analysis");
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {analysis.repo.owner}/{analysis.repo.name}
                      </CardTitle>
                      <CardDescription>
                        {new Date(analysis.createdAt).toLocaleDateString()} •{" "}
                        <span className="capitalize">{analysis.status}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {analysis.fileTree ? `${JSON.parse(analysis.fileTree).length} files analyzed` : "No files"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No analyses yet</p>
                  <p className="text-sm text-muted-foreground">
                    Paste a GitHub repository URL above to get started
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis">
            {selectedAnalysisId ? (
              <AnalysisView analysisId={selectedAnalysisId} />
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Select or analyze a repository to view details</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
