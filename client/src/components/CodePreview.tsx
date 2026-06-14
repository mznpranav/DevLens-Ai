import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, FileCode } from "lucide-react";
import { toast } from "sonner";

interface CodeFile {
  name: string;
  path: string;
  language: string;
  content: string;
  lines: number;
  complexity?: number;
}

interface CodePreviewProps {
  files?: CodeFile[];
  selectedFile?: string;
  onSelectFile?: (path: string) => void;
}

export default function CodePreview({
  files = [
    {
      name: "index.ts",
      path: "src/index.ts",
      language: "typescript",
      content: `import express from 'express';\nimport { router } from './routes';\n\nconst app = express();\napp.use(express.json());\napp.use('/api', router);\n\napp.listen(3000, () => {\n  console.log('Server running on port 3000');\n});`,
      lines: 10,
      complexity: 0.3,
    },
  ],
  selectedFile = files[0]?.path,
  onSelectFile,
}: CodePreviewProps) {
  const [copiedLines, setCopiedLines] = useState<Set<number>>(new Set());
  const currentFile = files.find((f) => f.path === selectedFile) || files[0];

  if (!currentFile) {
    return (
      <Card className="bg-gradient-to-br from-background to-background/95">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No files to display</p>
        </CardContent>
      </Card>
    );
  }

  const lines = currentFile.content.split("\n");

  const copyLine = (lineNum: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedLines((prev) => new Set(prev).add(lineNum));
    toast.success("Line copied");
    setTimeout(() => {
      setCopiedLines((prev) => {
        const next = new Set(prev);
        next.delete(lineNum);
        return next;
      });
    }, 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(currentFile.content);
    toast.success("Code copied to clipboard");
  };

  return (
    <Card className="bg-gradient-to-br from-background to-background/95 border-border/50 h-full flex flex-col">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-accent" />
              Code Preview
            </CardTitle>
            <CardDescription className="mt-1">{currentFile.path}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {currentFile.complexity !== undefined && (
              <Badge variant="outline" className="text-xs">
                Complexity: {Math.round(currentFile.complexity * 100)}%
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {currentFile.language}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {files.length > 1 && (
        <div className="border-b border-border/50 p-2 flex gap-1 overflow-x-auto">
          {files.map((file) => (
            <Button
              key={file.path}
              variant={selectedFile === file.path ? "default" : "outline"}
              size="sm"
              className="text-xs whitespace-nowrap"
              onClick={() => onSelectFile?.(file.path)}
            >
              {file.name}
            </Button>
          ))}
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-4 font-mono text-sm">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className="group flex gap-2 py-1 hover:bg-accent/5 transition-colors"
              onDoubleClick={() => copyLine(idx + 1, line)}
            >
              <div className="w-8 text-right text-muted-foreground/50 select-none flex-shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 relative">
                <code className="text-foreground/80">{line || " "}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 p-0"
                  onClick={() => copyLine(idx + 1, line)}
                >
                  {copiedLines.has(idx + 1) ? (
                    <Check className="w-3 h-3 text-accent" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-border/50 p-3 flex items-center justify-between bg-background/50">
        <span className="text-xs text-muted-foreground">
          {lines.length} lines • {currentFile.language}
        </span>
        <Button size="sm" variant="outline" onClick={copyAll} className="gap-2">
          <Copy className="w-3 h-3" />
          Copy All
        </Button>
      </div>
    </Card>
  );
}
