"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
    };
    reader.readAsText(selectedFile);
  };

  const handleProcess = async () => {
    if (!text.trim()) {
      setError("Please enter CTI text to process");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResults(null);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      // Use local Next.js API route instead of FastAPI backend
      const response = await fetch("/api/process-cti", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Store results in localStorage for results page
      localStorage.setItem("cti-results", JSON.stringify(data));
      
      setResults(data);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : "Failed to process CTI text");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewResults = () => {
    router.push("/results");
  };

  const handleViewGraph = () => {
    router.push("/graph");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Upload CTI Text
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Upload or paste Cyber Threat Intelligence text for automated extraction and analysis
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Upload Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>CTI Text Input</CardTitle>
                  <CardDescription>
                    Paste CTI text directly or upload a text file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File Upload */}
                  <div>
                    <Label htmlFor="file-upload">Upload File</Label>
                    <div className="mt-2">
                      <label
                        htmlFor="file-upload"
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors"
                      >
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {file ? file.name : "Click to upload or drag and drop"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            TXT, PDF, or DOC files
                          </p>
                        </div>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept=".txt,.pdf,.doc,.docx"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Text Area */}
                  <div>
                    <Label htmlFor="cti-text">CTI Text</Label>
                    <Textarea
                      id="cti-text"
                      placeholder="Paste your CTI text here... e.g., 'The APT28 group has been observed using the Zebrocy malware to target government organizations...'"
                      className="mt-2 min-h-[300px] font-mono text-sm"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      {text.length} characters | {text.split(/\s+/).filter(Boolean).length} words
                    </p>
                  </div>

                  {/* Progress */}
                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Processing CTI text...</span>
                        <span className="text-slate-600 dark:text-slate-400">{progress}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                  )}

                  {/* Error Alert */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Success Alert */}
                  {results && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600 dark:text-green-400">
                        Successfully processed! Extracted {results.entities?.length || 0} entities and{" "}
                        {results.relations?.length || 0} relations.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleProcess}
                    disabled={isProcessing || !text.trim()}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FileText className="h-5 w-5 mr-2" />
                        Process CTI Text
                      </>
                    )}
                  </Button>

                  {results && (
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={handleViewResults}>
                        View Results
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={handleViewGraph}>
                        View Graph
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Processing Pipeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1">1</Badge>
                    <div>
                      <p className="font-medium text-sm">Text Preprocessing</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Clean and tokenize input text
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1">2</Badge>
                    <div>
                      <p className="font-medium text-sm">NER Extraction</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Identify malware, threats, and IOCs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1">3</Badge>
                    <div>
                      <p className="font-medium text-sm">Relation Mapping</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Extract entity relationships
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1">4</Badge>
                    <div>
                      <p className="font-medium text-sm">Graph Construction</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Build Neo4j knowledge graph
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sample CTI Text</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      setText(
                        "APT28, also known as Fancy Bear, has been observed deploying the Zebrocy malware family to target government and military organizations across Eastern Europe. The malware uses HTTP for C2 communication and exfiltrates sensitive documents. Recent campaigns have leveraged spear-phishing emails with malicious attachments exploiting CVE-2017-0199."
                      )
                    }
                  >
                    Load Sample Text
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}