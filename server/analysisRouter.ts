import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import {
  createRepository,
  getRepositoriesByUserId,
  createAnalysis,
  getAnalysisByRepositoryId,
  getAnalysisById,
  updateAnalysis,
  createChatMessage,
  getChatMessagesByAnalysisId,
  createOnboardingPath,
  getOnboardingPathsByAnalysisId,
} from "./db";
import {
  parseRepoUrl,
  analyzeRepositoryStructure,
  getFileTree,
  getFileContent,
} from "./github";
import {
  buildArchitectureGraph,
  calculateHeatmap,
  generateOnboardingPath,
} from "./codeAnalysis";

export const analysisRouter = router({
  // Analyze a new repository
  analyzeRepository: publicProcedure
    .input(z.object({ repoUrl: z.string().url() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { owner, repo } = parseRepoUrl(input.repoUrl);
        const userId = ctx.user?.id || 1; // Use default user ID for public access

        // Check if already analyzed
        const existingRepo = await getRepositoriesByUserId(userId);
        const found = existingRepo.find(
          (r) => r.repoOwner === owner && r.repoName === repo
        );

        if (found) {
          const analysis = await getAnalysisByRepositoryId(found.id);
          if (analysis && analysis.status === "completed") {
            return { analysisId: analysis.id, status: "cached" };
          }
        }

        // Fetch repository structure
        const repoData = await analyzeRepositoryStructure(owner, repo);

        // Create repository record
        const repoResult = await createRepository({
          userId,
          repoUrl: input.repoUrl,
          repoName: repo,
          repoOwner: owner,
          description: repoData.metadata.description,
          language: repoData.metadata.language,
          fileCount: repoData.stats.fileCount,
          totalLines: repoData.stats.totalLines,
        });

        const repositoryId = (repoResult as any).insertId;

        // Create analysis record
        const analysisResult = await createAnalysis({
          repositoryId,
          userId,
          status: "analyzing",
          fileTree: JSON.stringify(repoData.fileTree),
          narrative: "",
          architectureMap: "",
          heatmap: "",
          complexity: 0,
          error: "",
        });

        const analysisId = (analysisResult as any).insertId;

        // Generate AI narrative
        const narrativePrompt = `Analyze this GitHub repository structure and provide a comprehensive narrative explaining:
1. The main purpose and entry points of the codebase
2. Key architectural patterns and layers
3. Authentication and authorization flows (if any)
4. Data models and database interactions
5. Security considerations and potential gaps
6. Testing coverage and documentation status

Repository: ${owner}/${repo}
Language: ${repoData.metadata.language}
Files: ${repoData.stats.fileCount}
Lines of Code: ${repoData.stats.totalLines}

File Structure:
${JSON.stringify(repoData.fileTree, null, 2).substring(0, 5000)}

Provide a clear, developer-friendly explanation suitable for onboarding a new team member.`;

        const narrativeResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are an expert code analyst. Provide clear, concise explanations of codebases for developer onboarding.",
            },
            {
              role: "user",
              content: narrativePrompt,
            },
          ],
        } as any);

        const narrativeContent = narrativeResponse.choices[0]?.message.content;
        const narrative = typeof narrativeContent === "string" ? narrativeContent : "";

        // Generate architecture map
        const architectureGraph = buildArchitectureGraph(repoData.fileTree);

        // Generate heatmap
        const heatmap = calculateHeatmap(repoData.fileTree);

        // Update analysis with generated data
        await updateAnalysis(analysisId, {
          narrative,
          architectureMap: JSON.stringify(architectureGraph),
          heatmap: JSON.stringify(heatmap),
          status: "completed",
        });

        // Generate onboarding paths for all roles
        for (const role of ["Frontend", "Backend", "DevOps"] as const) {
          const path = generateOnboardingPath(role, repoData.fileTree);
          await createOnboardingPath({
            analysisId,
            role,
            path: JSON.stringify(path),
          });
        }

        return {
          analysisId,
          status: "completed",
          narrative,
          architectureGraph,
          heatmap,
        };
      } catch (error) {
        console.error("Analysis error:", error);
        throw new Error(`Failed to analyze repository: ${error}`);
      }
    }),

  // Get analysis by ID
  getAnalysis: publicProcedure
    .input(z.object({ analysisId: z.number() }))
    .query(async ({ input, ctx }) => {
      const analysis = await getAnalysisById(input.analysisId);
      if (!analysis) {
        throw new Error("Analysis not found");
      }

      return {
        ...analysis,
        architectureMap: analysis.architectureMap
          ? JSON.parse(analysis.architectureMap)
          : null,
        heatmap: analysis.heatmap ? JSON.parse(analysis.heatmap) : null,
        fileTree: analysis.fileTree ? JSON.parse(analysis.fileTree) : null,
      };
    }),

  // Get user's analysis history
  getAnalysisHistory: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id || 1; // Use default user ID for public access
    const repos = await getRepositoriesByUserId(userId);
    const analyses = [];

    for (const repo of repos) {
      const analysis = await getAnalysisByRepositoryId(repo.id);
      if (analysis) {
        analyses.push({
          ...analysis,
          repo: {
            name: repo.repoName,
            owner: repo.repoOwner,
            url: repo.repoUrl,
          },
        });
      }
    }

    return analyses;
  }),

  // Chat with code
  chatWithCode: publicProcedure
    .input(
      z.object({
        analysisId: z.number(),
        message: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Get analysis and chat history
        const analysis = await getAnalysisById(input.analysisId);
        if (!analysis) {
          throw new Error("Analysis not found");
        }

        const chatHistory = await getChatMessagesByAnalysisId(input.analysisId);
        const fileTree = analysis.fileTree
          ? JSON.parse(analysis.fileTree)
          : null;

        // Build context for LLM
        const conversationHistory = chatHistory.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

        const systemPrompt = `You are an expert code analyst helping developers understand a codebase.
You have access to the repository structure and can provide specific file locations and line numbers.
Always reference specific files and line numbers when answering questions.
Be concise but thorough in your explanations.

Repository Structure:
${JSON.stringify(fileTree, null, 2).substring(0, 3000)}`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            ...conversationHistory,
            {
              role: "user",
              content: input.message,
            },
          ],
        });

        const assistantContent = response.choices[0]?.message.content;
        const assistantMessage = typeof assistantContent === "string" ? assistantContent : "";

        // Save messages to database
        const userId = ctx.user?.id || 1; // Use default user ID for public access
        const fileReferences = extractFileReferences(assistantMessage);
        
        await createChatMessage({
          analysisId: input.analysisId,
          userId,
          role: "user",
          content: input.message,
          fileReferences: JSON.stringify([]),
        });

        await createChatMessage({
          analysisId: input.analysisId,
          userId,
          role: "assistant",
          content: assistantMessage,
          fileReferences: JSON.stringify(fileReferences),
        });

        return {
          message: assistantMessage,
          fileReferences: extractFileReferences(assistantMessage),
        };
      } catch (error) {
        console.error("Chat error:", error);
        throw new Error(`Failed to process chat message: ${error}`);
      }
    }),

  // Get chat history
  getChatHistory: publicProcedure
    .input(z.object({ analysisId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify analysis exists
      const analysis = await getAnalysisById(input.analysisId);
      if (!analysis) {
        throw new Error("Analysis not found");
      }

      const messages = await getChatMessagesByAnalysisId(input.analysisId);
      return messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        fileReferences: msg.fileReferences
          ? JSON.parse(msg.fileReferences)
          : [],
      }));
    }),

  // Get onboarding path
  getOnboardingPath: publicProcedure
    .input(
      z.object({
        analysisId: z.number(),
        role: z.enum(["Frontend", "Backend", "DevOps"]),
      })
    )
    .query(async ({ input, ctx }) => {
      // Verify analysis exists
      const analysis = await getAnalysisById(input.analysisId);
      if (!analysis) {
        throw new Error("Analysis not found");
      }

      const paths = await getOnboardingPathsByAnalysisId(input.analysisId);
      const path = paths.find((p) => p.role === input.role);

      if (!path) {
        throw new Error("Onboarding path not found");
      }

      return {
        role: path.role,
        steps: path.path ? JSON.parse(path.path) : [],
      };
    }),
});

function extractFileReferences(text: string): Array<{ file: string; line?: number }> {
  const references: Array<{ file: string; line?: number }> = [];
  const filePattern = /(?:file|path|location):\s*([^\s,\n]+)(?:\s*(?:line|at)\s*(\d+))?/gi;

  let match;
  while ((match = filePattern.exec(text)) !== null) {
    references.push({
      file: match[1],
      line: match[2] ? parseInt(match[2]) : undefined,
    });
  }

  return references;
}
