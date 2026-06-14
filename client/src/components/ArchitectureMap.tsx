import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface Node {
  id: string;
  label: string;
  type: "file" | "module" | "component" | "service";
  complexity: number;
}

interface Edge {
  source: string;
  target: string;
  weight?: number;
}

interface ArchitectureMapProps {
  nodes?: Node[];
  edges?: Edge[];
  title?: string;
}

export default function ArchitectureMap({
  nodes = [
    { id: "1", label: "API Server", type: "service", complexity: 0.7 },
    { id: "2", label: "Database", type: "service", complexity: 0.5 },
    { id: "3", label: "Auth Module", type: "module", complexity: 0.6 },
    { id: "4", label: "User Service", type: "service", complexity: 0.8 },
    { id: "5", label: "Cache Layer", type: "service", complexity: 0.4 },
  ],
  edges = [
    { source: "1", target: "2", weight: 1 },
    { source: "1", target: "3", weight: 1 },
    { source: "1", target: "4", weight: 2 },
    { source: "4", target: "2", weight: 1 },
    { source: "4", target: "5", weight: 1 },
  ],
  title = "Architecture Map",
}: ArchitectureMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = "#0f0f0f";
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Calculate positions using force-directed layout
    const positions: Record<string, { x: number; y: number }> = {};
    nodes.forEach((node, idx) => {
      const angle = (idx / nodes.length) * Math.PI * 2;
      const radius = Math.min(width, height) / 3;
      positions[node.id] = {
        x: width / 2 + radius * Math.cos(angle) + pan.x,
        y: height / 2 + radius * Math.sin(angle) + pan.y,
      };
    });

    // Draw edges
    ctx.strokeStyle = "rgba(100, 150, 255, 0.3)";
    ctx.lineWidth = 2;
    edges.forEach((edge) => {
      const from = positions[edge.source];
      const to = positions[edge.target];
      if (from && to) {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        // Draw arrow
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const arrowSize = 10;
        ctx.fillStyle = "rgba(100, 150, 255, 0.5)";
        ctx.beginPath();
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(to.x - arrowSize * Math.cos(angle - Math.PI / 6), to.y - arrowSize * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(to.x - arrowSize * Math.cos(angle + Math.PI / 6), to.y - arrowSize * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      }
    });

    // Draw nodes
    nodes.forEach((node) => {
      const pos = positions[node.id];
      if (!pos) return;

      const radius = 30 + node.complexity * 20;
      const isSelected = selectedNode === node.id;

      // Node circle
      ctx.fillStyle = isSelected ? "#6366f1" : `rgba(100, 150, 255, ${0.3 + node.complexity * 0.4})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Node border
      ctx.strokeStyle = isSelected ? "#818cf8" : "rgba(100, 150, 255, 0.6)";
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // Node label
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, pos.x, pos.y);
    });

    // Draw info
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Nodes: ${nodes.length} | Edges: ${edges.length}`, 10, height - 10);
  }, [nodes, edges, zoom, pan, selectedNode]);

  const handleZoom = (direction: "in" | "out") => {
    setZoom((prev) => (direction === "in" ? prev * 1.2 : prev / 1.2));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  return (
    <Card className="bg-gradient-to-br from-background to-background/95 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">{title}</CardTitle>
            <CardDescription>Interactive dependency visualization</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleZoom("in")}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleZoom("out")}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full border border-border/50 rounded-lg bg-black/20 cursor-crosshair"
          />

          <div className="grid grid-cols-2 gap-2 text-xs">
            {nodes.map((node) => (
              <div
                key={node.id}
                className="p-2 rounded bg-card/50 border border-border/30 hover:border-accent/50 cursor-pointer transition-colors"
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: `rgba(100, 150, 255, ${0.3 + node.complexity * 0.4})`,
                    }}
                  />
                  <span className="font-medium">{node.label}</span>
                </div>
                <div className="text-muted-foreground mt-1">
                  <Badge variant="outline" className="text-xs">
                    {node.type}
                  </Badge>
                  <span className="ml-2">
                    Complexity: {Math.round(node.complexity * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
