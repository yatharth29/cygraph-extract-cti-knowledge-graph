"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, Settings, TrendingUp, Brain, Network, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

export default function PipelinePage() {
  const [model, setModel] = useState("dslim/bert-base-NER");
  const [confidenceThreshold, setConfidenceThreshold] = useState([0.85]);
  const [useOntology, setUseOntology] = useState(true);
  const [selfCorrecting, setSelfCorrecting] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  const availableModels = [
    { value: "dslim/bert-base-NER", label: "BERT Base NER", accuracy: 94 },
    { value: "dbmdz/bert-large-cased-finetuned-conll03-english", label: "BERT Large CoNLL03", accuracy: 96 },
    { value: "xlm-roberta-large-finetuned-conll03-english", label: "XLM-RoBERTa Large", accuracy: 97 },
    { value: "microsoft/deberta-v3-base", label: "DeBERTa v3 Base", accuracy: 95 },
  ];

  const pipelineStages = [
    {
      name: "Text Preprocessing",
      status: "completed",
      duration: "0.3s",
      description: "Tokenization, cleaning, normalization",
    },
    {
      name: "NER Extraction",
      status: "completed",
      duration: "1.8s",
      description: "Entity recognition using Hugging Face models",
    },
    {
      name: "Relation Extraction",
      status: "running",
      duration: "0.9s",
      description: "Identifying relationships between entities",
    },
    {
      name: "Ontology Validation",
      status: "pending",
      duration: "-",
      description: "Validating against CTI ontology",
    },
    {
      name: "Graph Construction",
      status: "pending",
      duration: "-",
      description: "Building Neo4j knowledge graph",
    },
    {
      name: "Self-Correction",
      status: "pending",
      duration: "-",
      description: "Applying feedback-based improvements",
    },
  ];

  const feedbackStats = {
    total_feedback: 47,
    corrections_applied: 132,
    accuracy_improvement: 3.2,
    avg_confidence: 96.8,
  };

  const handleRunPipeline = () => {
    setIsRunning(true);
    // Simulate pipeline execution
    setTimeout(() => setIsRunning(false), 5000);
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

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            NER Pipeline Configuration
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Configure and monitor the extraction pipeline with self-correcting feedback loops
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration
                </CardTitle>
                <CardDescription>Model and extraction settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Hugging Face Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{m.label}</span>
                            <Badge variant="secondary" className="ml-2">
                              {m.accuracy}%
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    Current accuracy: {availableModels.find((m) => m.value === model)?.accuracy}%
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Confidence Threshold: {confidenceThreshold[0].toFixed(2)}</Label>
                  <Slider
                    value={confidenceThreshold}
                    onValueChange={setConfidenceThreshold}
                    min={0.5}
                    max={0.99}
                    step={0.01}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500">
                    Entities below this threshold will be filtered out
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Use Ontology Validation</Label>
                    <p className="text-xs text-slate-500">Validate against OWL ontology</p>
                  </div>
                  <Switch checked={useOntology} onCheckedChange={setUseOntology} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Self-Correcting Mode</Label>
                    <p className="text-xs text-slate-500">Apply feedback corrections</p>
                  </div>
                  <Switch checked={selfCorrecting} onCheckedChange={setSelfCorrecting} />
                </div>

                <Button className="w-full" size="lg" onClick={handleRunPipeline} disabled={isRunning}>
                  <Play className="h-5 w-5 mr-2" />
                  {isRunning ? "Running..." : "Run Pipeline"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Feedback Stats
                </CardTitle>
                <CardDescription>Self-correction performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total Feedback</span>
                    <span className="font-bold">{feedbackStats.total_feedback}</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Corrections Applied</span>
                    <span className="font-bold">{feedbackStats.corrections_applied}</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Accuracy Improvement</span>
                    <Badge className="bg-green-500">+{feedbackStats.accuracy_improvement}%</Badge>
                  </div>
                  <Progress value={feedbackStats.accuracy_improvement * 10} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Avg. Confidence</span>
                    <span className="font-bold">{feedbackStats.avg_confidence}%</span>
                  </div>
                  <Progress value={feedbackStats.avg_confidence} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pipeline Status */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Stages</CardTitle>
                <CardDescription>Real-time processing status</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="stages">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="stages">Stages</TabsTrigger>
                    <TabsTrigger value="models">Model Info</TabsTrigger>
                  </TabsList>

                  <TabsContent value="stages" className="space-y-4">
                    {pipelineStages.map((stage, idx) => (
                      <Card
                        key={idx}
                        className={`border-l-4 ${
                          stage.status === "completed"
                            ? "border-l-green-500"
                            : stage.status === "running"
                            ? "border-l-blue-500"
                            : "border-l-slate-300"
                        }`}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {stage.status === "completed" && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                              {stage.status === "running" && (
                                <Brain className="h-5 w-5 text-blue-500 animate-pulse" />
                              )}
                              {stage.status === "pending" && (
                                <AlertCircle className="h-5 w-5 text-slate-400" />
                              )}
                              <div>
                                <h3 className="font-semibold">{stage.name}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {stage.description}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={
                                  stage.status === "completed"
                                    ? "default"
                                    : stage.status === "running"
                                    ? "secondary"
                                    : "outline"
                                }
                                className={
                                  stage.status === "completed"
                                    ? "bg-green-500"
                                    : stage.status === "running"
                                    ? "bg-blue-500"
                                    : ""
                                }
                              >
                                {stage.status}
                              </Badge>
                              <p className="text-xs text-slate-500 mt-1">{stage.duration}</p>
                            </div>
                          </div>
                          {stage.status === "running" && (
                            <Progress value={60} className="h-1 mt-3" />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="models" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Current Model</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-xs">Model Name</Label>
                          <p className="font-mono text-sm">{model}</p>
                        </div>
                        <div>
                          <Label className="text-xs">Architecture</Label>
                          <p className="text-sm">BERT (Bidirectional Encoder Representations)</p>
                        </div>
                        <div>
                          <Label className="text-xs">Training Dataset</Label>
                          <p className="text-sm">CoNLL-2003 + Custom CTI Dataset</p>
                        </div>
                        <div>
                          <Label className="text-xs">Supported Entity Types</Label>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="secondary">Threat Actor</Badge>
                            <Badge variant="secondary">Malware</Badge>
                            <Badge variant="secondary">Vulnerability</Badge>
                            <Badge variant="secondary">IOC</Badge>
                            <Badge variant="secondary">Technique</Badge>
                            <Badge variant="secondary">Target</Badge>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Performance</Label>
                          <div className="grid grid-cols-3 gap-3 mt-2">
                            <div className="text-center p-2 bg-slate-100 dark:bg-slate-800 rounded">
                              <div className="text-lg font-bold">94.2%</div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">Precision</div>
                            </div>
                            <div className="text-center p-2 bg-slate-100 dark:bg-slate-800 rounded">
                              <div className="text-lg font-bold">93.8%</div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">Recall</div>
                            </div>
                            <div className="text-center p-2 bg-slate-100 dark:bg-slate-800 rounded">
                              <div className="text-lg font-bold">94.0%</div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">F1 Score</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Self-Correcting System</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p className="text-slate-600 dark:text-slate-400">
                          The pipeline uses feedback loops to continuously improve extraction accuracy:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                          <li>User corrections are stored and analyzed</li>
                          <li>Common patterns are identified and learned</li>
                          <li>Confidence thresholds auto-adjust based on error rates</li>
                          <li>Model predictions are refined using historical feedback</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}