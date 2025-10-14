"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Eye, Filter, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ResultsPage() {
  const [entityFilter, setEntityFilter] = useState("all");
  const [relationFilter, setRelationFilter] = useState("all");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load results from localStorage (saved by upload page)
    const savedResults = localStorage.getItem("cti_results");
    if (savedResults) {
      try {
        const parsedResults = JSON.parse(savedResults);
        setResults(parsedResults);
      } catch (error) {
        console.error("Error parsing results:", error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results || !results.entities) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No extraction results found. Please upload and process CTI text first.
            </AlertDescription>
          </Alert>
          <Link href="/upload" className="mt-4 inline-block">
            <Button>Upload CTI Text</Button>
          </Link>
        </div>
      </div>
    );
  }

  const filteredEntities =
    entityFilter === "all"
      ? results.entities
      : results.entities.filter((e: any) => e.type === entityFilter);

  const filteredRelations =
    relationFilter === "all"
      ? results.relations
      : results.relations.filter((r: any) => r.relation === relationFilter);

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.95) return <Badge className="bg-green-500">High</Badge>;
    if (confidence >= 0.85) return <Badge className="bg-yellow-500">Medium</Badge>;
    return <Badge className="bg-red-500">Low</Badge>;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "threat-actor": "bg-red-500",
      malware: "bg-orange-500",
      vulnerability: "bg-pink-500",
      technique: "bg-amber-500",
      "target-sector": "bg-cyan-500",
      location: "bg-emerald-500",
      protocol: "bg-purple-500",
      alias: "bg-lime-500",
    };
    return colors[type] || "bg-gray-500";
  };

  const avgConfidence =
    results.entities.reduce((sum: number, e: any) => sum + e.confidence, 0) / results.entities.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Extraction Results
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Detailed view of extracted entities, relations, and attributes
            </p>
          </div>
          <Button variant="outline" onClick={() => {
            const dataStr = JSON.stringify(results, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "cti-extraction-results.json";
            link.click();
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {results.entities.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Entities Extracted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {results.relations.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Relations Mapped</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {results.metadata?.processing_time?.toFixed(2) || "N/A"}s
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Processing Time</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {(avgConfidence * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Avg. Confidence</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Extraction Details</CardTitle>
            <CardDescription>Browse extracted entities and relations</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="entities" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="entities">Entities</TabsTrigger>
                <TabsTrigger value="relations">Relations</TabsTrigger>
              </TabsList>

              {/* Entities Tab */}
              <TabsContent value="entities" className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Filter:</span>
                  </div>
                  <Select value={entityFilter} onValueChange={setEntityFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Array.from(new Set(results.entities.map((e: any) => e.type))).map((type: any) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Confidence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntities.map((entity: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{entity.text}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`${getTypeColor(entity.type)} text-white`}>
                              {entity.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getConfidenceBadge(entity.confidence)}
                              <span className="text-sm text-slate-600">{(entity.confidence * 100).toFixed(1)}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Relations Tab */}
              <TabsContent value="relations" className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Filter:</span>
                  </div>
                  <Select value={relationFilter} onValueChange={setRelationFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Relations</SelectItem>
                      {Array.from(new Set(results.relations.map((r: any) => r.relation))).map((rel: any) => (
                        <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>Relation</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Confidence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRelations.map((relation: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{relation.source}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{relation.relation}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{relation.target}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getConfidenceBadge(relation.confidence)}
                              <span className="text-sm text-slate-600">
                                {(relation.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}