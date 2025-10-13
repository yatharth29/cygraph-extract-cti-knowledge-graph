"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Network, BarChart3, FileText, Shield, Zap, Brain, Database } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge className="mb-4 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
            Production-Ready Framework
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            CyGraph-Extract
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
            Automated framework for constructing real-time Malware Threat Intelligence Knowledge Graphs from unstructured CTI text
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/upload">
              <Button size="lg" className="gap-2">
                <Upload className="h-5 w-5" />
                Upload CTI Text
              </Button>
            </Link>
            <Link href="/graph">
              <Button size="lg" variant="outline" className="gap-2">
                <Network className="h-5 w-5" />
                View Graph
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-2 hover:border-indigo-300 transition-colors">
            <CardHeader>
              <Brain className="h-10 w-10 text-indigo-600 dark:text-indigo-400 mb-2" />
              <CardTitle>NER Extraction</CardTitle>
              <CardDescription>
                Advanced Named Entity Recognition with Hugging Face transformers
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-purple-300 transition-colors">
            <CardHeader>
              <Network className="h-10 w-10 text-purple-600 dark:text-purple-400 mb-2" />
              <CardTitle>Knowledge Graph</CardTitle>
              <CardDescription>
                Neo4j-powered graph database with real-time relationship mapping
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-300 transition-colors">
            <CardHeader>
              <Zap className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-2" />
              <CardTitle>Self-Correcting</CardTitle>
              <CardDescription>
                Feedback loops for continuous improvement of extraction accuracy
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-green-300 transition-colors">
            <CardHeader>
              <Shield className="h-10 w-10 text-green-600 dark:text-green-400 mb-2" />
              <CardTitle>Ontology-Based</CardTitle>
              <CardDescription>
                OWL ontology management for structured threat intelligence
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Features */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <Link href="/upload" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Upload className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mb-4" />
                <CardTitle>Upload & Process</CardTitle>
                <CardDescription>
                  Upload CTI text or paste directly for automated extraction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li>• Text and file upload support</li>
                  <li>• Real-time processing feedback</li>
                  <li>• Multiple format support</li>
                  <li>• Batch processing capability</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/graph" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Network className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4" />
                <CardTitle>Visualize Graph</CardTitle>
                <CardDescription>
                  Interactive visualization of threat intelligence relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li>• Interactive D3.js visualization</li>
                  <li>• Multiple layout algorithms</li>
                  <li>• Filter and search nodes</li>
                  <li>• Export to PNG/SVG</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/results" className="block">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                <CardTitle>View Results</CardTitle>
                <CardDescription>
                  Detailed extraction results with confidence scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li>• Entity and relation tables</li>
                  <li>• Confidence scoring</li>
                  <li>• Export to JSON/CSV</li>
                  <li>• Attribute mapping</li>
                </ul>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Section */}
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none">
          <CardContent className="py-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <Database className="h-8 w-8 mx-auto mb-2 opacity-90" />
                <div className="text-3xl font-bold mb-1">Neo4j</div>
                <div className="text-indigo-100 text-sm">Graph Database</div>
              </div>
              <div>
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-90" />
                <div className="text-3xl font-bold mb-1">Hugging Face</div>
                <div className="text-indigo-100 text-sm">NER Models</div>
              </div>
              <div>
                <Zap className="h-8 w-8 mx-auto mb-2 opacity-90" />
                <div className="text-3xl font-bold mb-1">FastAPI</div>
                <div className="text-indigo-100 text-sm">Backend API</div>
              </div>
              <div>
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-90" />
                <div className="text-3xl font-bold mb-1">OWL</div>
                <div className="text-indigo-100 text-sm">Ontology</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture Overview */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Pipeline Architecture
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Multi-stage processing pipeline with self-correcting feedback loops
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="px-4 py-2">Text Preprocessing</Badge>
            <span className="text-2xl text-slate-400">→</span>
            <Badge variant="secondary" className="px-4 py-2">NER Extraction</Badge>
            <span className="text-2xl text-slate-400">→</span>
            <Badge variant="secondary" className="px-4 py-2">Relation Mapping</Badge>
            <span className="text-2xl text-slate-400">→</span>
            <Badge variant="secondary" className="px-4 py-2">Graph Construction</Badge>
            <span className="text-2xl text-slate-400">→</span>
            <Badge variant="secondary" className="px-4 py-2">Visualization</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}