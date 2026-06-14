import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Copy, Check } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  fileReferences?: Array<{ file: string; line: number }>;
  timestamp?: Date;
}

interface EnhancedChatProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  suggestedPrompts?: string[];
}

export default function EnhancedChat({
  messages,
  isLoading,
  onSendMessage,
  suggestedPrompts = [
    "What are the main entry points?",
    "How is authentication handled?",
    "What are the key dependencies?",
    "Explain the data flow",
  ],
}: EnhancedChatProps) {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  const handleSuggestedPrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card className="flex flex-col h-full bg-gradient-to-b from-background to-background/95">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Ask Anything</CardTitle>
            <CardDescription>Chat with your codebase using AI</CardDescription>
          </div>
          <Badge variant="outline" className="bg-accent/10">
            {messages.length} messages
          </Badge>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pr-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 text-4xl">💬</div>
              <p className="text-muted-foreground mb-6">Start a conversation about your codebase</p>
              <div className="space-y-2 w-full max-w-xs">
                {suggestedPrompts.map((prompt, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-2 px-3 hover:bg-accent/10 transition-colors"
                    onClick={() => handleSuggestedPrompt(prompt)}
                  >
                    <span className="text-xs">{prompt}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-lg transition-all hover:shadow-md ${
                    msg.role === "user"
                      ? "bg-accent text-accent-foreground rounded-br-none"
                      : "bg-card border border-border/50 rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="space-y-2">
                      <div className="text-sm prose prose-invert max-w-none">
                        <Streamdown>{msg.content}</Streamdown>
                      </div>
                      {msg.fileReferences && msg.fileReferences.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-current/10 space-y-1">
                          <p className="text-xs font-semibold opacity-70">References:</p>
                          {msg.fileReferences.map((ref, i) => (
                            <div
                              key={i}
                              className="text-xs bg-background/50 rounded px-2 py-1 font-mono opacity-75 hover:opacity-100 transition-opacity"
                            >
                              📄 {ref.file}:{ref.line}
                            </div>
                          ))}
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 h-6 text-xs"
                        onClick={() => copyToClipboard(msg.content, `msg-${idx}`)}
                      >
                        {copiedId === `msg-${idx}` ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card border border-border/50 rounded-lg rounded-bl-none px-4 py-3 flex items-center gap-2">
                <Spinner className="w-4 h-4" />
                <span className="text-sm text-muted-foreground">Analyzing...</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border/50 p-4 space-y-3 bg-background/50">
        {messages.length === 0 && (
          <div className="text-xs text-muted-foreground text-center">
            💡 Tip: Ask specific questions about architecture, dependencies, or implementation details
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="Ask about your code..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
            disabled={isLoading}
            className="bg-background/80"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="gap-2"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
