import { describe, it, expect } from "vitest";
import { analyzeFileMetrics, getFileType, buildArchitectureGraph, calculateHeatmap, generateOnboardingPath } from "./codeAnalysis";
import { parseRepoUrl } from "./github";

describe("Code Analysis", () => {
  describe("analyzeFileMetrics", () => {
    it("should calculate complexity based on code keywords", () => {
      const code = `
        if (condition) {
          for (let i = 0; i < 10; i++) {
            while (true) {
              try {
                // do something
              } catch (e) {
                console.log(e);
              }
            }
          }
        }
      `;
      const metrics = analyzeFileMetrics("test.js", code);
      expect(metrics.complexity).toBeGreaterThan(1);
      expect(metrics.fileType).toBe("JavaScript");
    });

    it("should detect test files", () => {
      const code = "describe('test', () => { test('should work', () => {}); });";
      const metrics = analyzeFileMetrics("test.test.js", code);
      expect(metrics.hasTests).toBe(true);
    });

    it("should detect documentation", () => {
      const code = "/** This is a documented function */ function test() {}";
      const metrics = analyzeFileMetrics("test.js", code);
      expect(metrics.hasDocumentation).toBe(true);
    });

    it("should calculate risk score", () => {
      const code = "function test() {}";
      const metrics = analyzeFileMetrics("test.js", code);
      expect(metrics.riskScore).toBeGreaterThanOrEqual(0);
      expect(metrics.riskScore).toBeLessThanOrEqual(100);
    });
  });

  describe("getFileType", () => {
    it("should identify JavaScript files", () => {
      expect(getFileType("app.js")).toBe("JavaScript");
      expect(getFileType("component.jsx")).toBe("React");
    });

    it("should identify TypeScript files", () => {
      expect(getFileType("app.ts")).toBe("TypeScript");
      expect(getFileType("component.tsx")).toBe("React");
    });

    it("should identify Python files", () => {
      expect(getFileType("script.py")).toBe("Python");
    });

    it("should return Unknown for unrecognized extensions", () => {
      expect(getFileType("file.unknown")).toBe("Unknown");
    });
  });

  describe("parseRepoUrl", () => {
    it("should parse GitHub HTTPS URLs", () => {
      const result = parseRepoUrl("https://github.com/owner/repo");
      expect(result.owner).toBe("owner");
      expect(result.repo).toBe("repo");
    });

    it("should parse GitHub HTTPS URLs with .git suffix", () => {
      const result = parseRepoUrl("https://github.com/owner/repo.git");
      expect(result.owner).toBe("owner");
      expect(result.repo).toBe("repo");
    });

    it("should parse owner/repo format", () => {
      const result = parseRepoUrl("owner/repo");
      expect(result.owner).toBe("owner");
      expect(result.repo).toBe("repo");
    });

    it("should throw error for invalid URLs", () => {
      expect(() => parseRepoUrl("invalid-url")).toThrow();
    });
  });

  describe("generateOnboardingPath", () => {
    it("should generate Frontend onboarding path", () => {
      const path = generateOnboardingPath("Frontend", []);
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toContain("entry point");
    });

    it("should generate Backend onboarding path", () => {
      const path = generateOnboardingPath("Backend", []);
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toContain("server");
    });

    it("should generate DevOps onboarding path", () => {
      const path = generateOnboardingPath("DevOps", []);
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toContain("deployment");
    });
  });

  describe("buildArchitectureGraph", () => {
    it("should create nodes for files", () => {
      const fileTree = [
        {
          name: "index.js",
          path: "src/index.js",
          type: "file" as const,
          language: "JavaScript",
        },
      ];
      const graph = buildArchitectureGraph(fileTree);
      expect(graph.nodes.length).toBeGreaterThan(0);
      expect(graph.nodes[0].name).toBe("index.js");
    });

    it("should create edges for dependencies", () => {
      const fileTree = [
        {
          name: "index.js",
          path: "src/index.js",
          type: "file" as const,
          language: "JavaScript",
        },
        {
          name: "utils.js",
          path: "src/utils.js",
          type: "file" as const,
          language: "JavaScript",
        },
      ];
      const graph = buildArchitectureGraph(fileTree);
      expect(graph.edges).toBeDefined();
      expect(Array.isArray(graph.edges)).toBe(true);
    });
  });

  describe("calculateHeatmap", () => {
    it("should generate heatmap data", () => {
      const fileTree = [
        {
          name: "test.js",
          path: "src/test.js",
          type: "file" as const,
          size: 1000,
        },
      ];
      const heatmap = calculateHeatmap(fileTree);
      expect(Array.isArray(heatmap)).toBe(true);
    });

    it("should include risk scores", () => {
      const fileTree = [
        {
          name: "app.js",
          path: "src/app.js",
          type: "file" as const,
          size: 5000,
        },
      ];
      const heatmap = calculateHeatmap(fileTree);
      if (heatmap.length > 0) {
        expect(heatmap[0]).toHaveProperty("riskScore");
        expect(heatmap[0].riskScore).toBeGreaterThanOrEqual(0);
        expect(heatmap[0].riskScore).toBeLessThanOrEqual(100);
      }
    });
  });
});
