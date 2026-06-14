import axios from "axios";

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  content?: string;
  language?: string;
  children?: FileNode[];
}

export interface RepoMetadata {
  name: string;
  owner: string;
  url: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
}

const GITHUB_API_BASE = "https://api.github.com";

export async function getRepoMetadata(owner: string, repo: string): Promise<RepoMetadata> {
  try {
    const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    return {
      name: response.data.name,
      owner: response.data.owner.login,
      url: response.data.html_url,
      description: response.data.description || "",
      language: response.data.language || "Unknown",
      stars: response.data.stargazers_count,
      forks: response.data.forks_count,
    };
  } catch (error) {
    throw new Error(`Failed to fetch repo metadata: ${error}`);
  }
}

export async function getFileTree(owner: string, repo: string, path = ""): Promise<FileNode[]> {
  try {
    const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    const items: FileNode[] = [];

    for (const item of response.data) {
      if (item.type === "dir") {
        items.push({
          name: item.name,
          path: item.path,
          type: "dir",
          children: [],
        });
      } else {
        items.push({
          name: item.name,
          path: item.path,
          type: "file",
          size: item.size,
          language: getLanguageFromExtension(item.name),
        });
      }
    }

    return items;
  } catch (error) {
    throw new Error(`Failed to fetch file tree: ${error}`);
  }
}

export async function getFileContent(owner: string, repo: string, path: string): Promise<string> {
  try {
    const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Accept: "application/vnd.github.v3.raw",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch file content: ${error}`);
  }
}

export async function buildCompleteFileTree(
  owner: string,
  repo: string,
  path = "",
  depth = 0,
  maxDepth = 5
): Promise<FileNode[]> {
  if (depth > maxDepth) return [];

  try {
    const items = await getFileTree(owner, repo, path);
    const result: FileNode[] = [];

    // Filter out common non-essential directories
    const skipDirs = [
      "node_modules",
      ".git",
      ".github",
      "dist",
      "build",
      ".next",
      ".venv",
      "venv",
      "__pycache__",
      ".pytest_cache",
    ];

    for (const item of items) {
      if (item.type === "dir" && skipDirs.includes(item.name)) {
        continue;
      }

      if (item.type === "dir" && depth < maxDepth) {
        item.children = await buildCompleteFileTree(owner, repo, item.path, depth + 1, maxDepth);
      }

      result.push(item);
    }

    return result;
  } catch (error) {
    console.error("Error building file tree:", error);
    return [];
  }
}

export function getLanguageFromExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const languageMap: Record<string, string> = {
    js: "JavaScript",
    jsx: "JavaScript",
    ts: "TypeScript",
    tsx: "TypeScript",
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
    scala: "Scala",
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

  return languageMap[ext] || ext.toUpperCase();
}

export function parseRepoUrl(url: string): { owner: string; repo: string } {
  let match = url.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/)?$/);
  
  if (!match) {
    match = url.match(/^([^\/]+)\/([^\/]+)$/);
  }
  
  if (!match) {
    throw new Error("Invalid GitHub repository URL");
  }

  let repo = match[2];
  if (repo.endsWith(".git")) {
    repo = repo.slice(0, -4);
  }

  return {
    owner: match[1],
    repo,
  };
}

export async function analyzeRepositoryStructure(owner: string, repo: string) {
  try {
    const metadata = await getRepoMetadata(owner, repo);
    const fileTree = await buildCompleteFileTree(owner, repo);

    // Count files and estimate lines
    let fileCount = 0;
    let totalLines = 0;

    const countFilesRecursive = (nodes: FileNode[]): void => {
      for (const node of nodes) {
        if (node.type === "file") {
          fileCount++;
          // Rough estimate: 50 lines per KB
          totalLines += Math.ceil((node.size || 0) / 20);
        } else if (node.children) {
          countFilesRecursive(node.children);
        }
      }
    };

    countFilesRecursive(fileTree);

    return {
      metadata,
      fileTree,
      stats: {
        fileCount,
        totalLines,
        languages: extractLanguages(fileTree),
      },
    };
  } catch (error) {
    throw new Error(`Failed to analyze repository: ${error}`);
  }
}

function extractLanguages(nodes: FileNode[]): Record<string, number> {
  const languages: Record<string, number> = {};

  const traverse = (nodeList: FileNode[]) => {
    for (const node of nodeList) {
      if (node.type === "file" && node.language) {
        languages[node.language] = (languages[node.language] || 0) + 1;
      } else if (node.children) {
        traverse(node.children);
      }
    }
  };

  traverse(nodes);
  return languages;
}
