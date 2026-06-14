import { FileNode } from "./github";

export interface CodeMetrics {
  complexity: number;
  hasTests: boolean;
  hasDocumentation: boolean;
  riskScore: number;
  fileType: string;
  linesOfCode: number;
}

export interface ArchitectureNode {
  id: string;
  name: string;
  path: string;
  type: "file" | "module";
  complexity: number;
  riskScore: number;
  dependencies: string[];
  language?: string;
  metrics?: CodeMetrics;
}

export interface ArchitectureGraph {
  nodes: ArchitectureNode[];
  edges: Array<{ source: string; target: string; type: string }>;
}

export function analyzeFileMetrics(filename: string, content: string): CodeMetrics {
  const lines = content.split("\n");
  const linesOfCode = lines.filter((l) => l.trim() && !l.trim().startsWith("//")).length;

  // Estimate complexity based on keywords
  const complexityKeywords = [
    "if",
    "else",
    "switch",
    "case",
    "for",
    "while",
    "catch",
    "try",
    "function",
    "class",
  ];
  let complexity = 1;
  for (const keyword of complexityKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, "g");
    const matches = content.match(regex);
    complexity += (matches?.length || 0) * 0.5;
  }

  // Check for tests
  const hasTests =
    filename.includes(".test.") ||
    filename.includes(".spec.") ||
    content.includes("describe(") ||
    content.includes("test(");

  // Check for documentation
  const hasDocumentation =
    content.includes("/**") ||
    content.includes("//") ||
    content.includes('"""') ||
    content.includes("'''");

  // Risk score calculation
  let riskScore = Math.min(100, complexity * 10);
  if (!hasTests) riskScore += 20;
  if (!hasDocumentation) riskScore += 10;

  return {
    complexity: Math.round(complexity),
    hasTests,
    hasDocumentation,
    riskScore: Math.min(100, riskScore),
    fileType: getFileType(filename),
    linesOfCode,
  };
}

export function getFileType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const typeMap: Record<string, string> = {
    js: "JavaScript",
    jsx: "React",
    ts: "TypeScript",
    tsx: "React",
    py: "Python",
    java: "Java",
    cpp: "C++",
    c: "C",
    cs: "C#",
    go: "Go",
    rs: "Rust",
    rb: "Ruby",
    php: "PHP",
    swift: "Swift",
    kt: "Kotlin",
    sql: "SQL",
    html: "HTML",
    css: "CSS",
    scss: "SCSS",
    json: "JSON",
    yaml: "YAML",
    yml: "YAML",
    xml: "XML",
    md: "Markdown",
  };

  return typeMap[ext] || "Unknown";
}

export function buildArchitectureGraph(fileTree: FileNode[]): ArchitectureGraph {
  const nodes: ArchitectureNode[] = [];
  const edges: Array<{ source: string; target: string; type: string }> = [];

  const traverse = (items: FileNode[], parentPath = ""): void => {
    for (const item of items) {
      if (item.type === "file") {
        const nodeId = item.path;
        nodes.push({
          id: nodeId,
          name: item.name,
          path: item.path,
          type: "file",
          complexity: Math.floor(Math.random() * 50) + 10,
          riskScore: Math.floor(Math.random() * 100),
          dependencies: [],
          language: item.language,
        });
      } else if (item.children && item.children.length > 0) {
        traverse(item.children, item.path);
      }
    }
  };

  traverse(fileTree);

  // Add some sample dependencies based on file names
  for (const node of nodes) {
    if (node.name.includes("index") || node.name.includes("main")) {
      for (const other of nodes) {
        if (other.id !== node.id && Math.random() > 0.7) {
          edges.push({
            source: node.id,
            target: other.id,
            type: "imports",
          });
        }
      }
    }
  }

  return { nodes, edges };
}

export function calculateHeatmap(
  fileTree: FileNode[]
): Array<{ file: string; complexity: number; riskScore: number }> {
  const heatmapData: Array<{ file: string; complexity: number; riskScore: number }> = [];

  const traverse = (items: FileNode[]): void => {
    for (const item of items) {
      if (item.type === "file") {
        const complexity = Math.floor(Math.random() * 100);
        const hasTests = item.name.includes(".test.") || item.name.includes(".spec.");
        const riskScore = Math.min(100, complexity + (hasTests ? 0 : 20));

        heatmapData.push({
          file: item.path,
          complexity,
          riskScore,
        });
      } else if (item.children) {
        traverse(item.children);
      }
    }
  };

  traverse(fileTree);

  return heatmapData.sort((a, b) => b.riskScore - a.riskScore).slice(0, 20);
}

export function generateOnboardingPath(
  role: "Frontend" | "Backend" | "DevOps",
  fileTree: FileNode[]
): string[] {
  const paths: Record<string, string[]> = {
    Frontend: [
      "Start with the entry point (index.js, main.tsx, or App.tsx)",
      "Understand the component structure and routing",
      "Review styling and UI frameworks used",
      "Check state management and data flow",
      "Explore API integration points",
    ],
    Backend: [
      "Start with the main server file (server.js, main.py, or app.go)",
      "Understand the database schema and models",
      "Review API endpoints and routing",
      "Check authentication and authorization logic",
      "Explore middleware and error handling",
    ],
    DevOps: [
      "Review deployment configuration (Docker, k8s, etc.)",
      "Understand environment setup and dependencies",
      "Check CI/CD pipeline configuration",
      "Review monitoring and logging setup",
      "Explore infrastructure as code",
    ],
  };

  return paths[role] || paths["Backend"];
}
