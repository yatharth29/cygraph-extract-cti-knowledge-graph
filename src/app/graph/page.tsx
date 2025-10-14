"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with D3
const D3GraphVisualization = dynamic(
  () => import("@/components/D3GraphVisualization"),
  { ssr: false }
);

export default function GraphPage() {
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    nodes: 0,
    edges: 0,
    entityTypes: 0,
  });

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      // First try to get graph data from localStorage (uploaded data)
      const savedResults = localStorage.getItem("cti-results");
      if (savedResults) {
        const parsedResults = JSON.parse(savedResults);
        if (parsedResults.graph) {
          setGraphData(parsedResults.graph);
          const uniqueTypes = new Set(parsedResults.graph.nodes?.map((n: any) => n.type));
          setStats({
            nodes: parsedResults.graph.nodes?.length || 0,
            edges: parsedResults.graph.edges?.length || 0,
            entityTypes: uniqueTypes.size,
          });
          setLoading(false);
          return;
        }
      }

      // Fallback to API endpoint
      const response = await fetch("/api/graph");
      const result = await response.json();
      
      if (result.success && result.data) {
        setGraphData(result.data);
        
        // Calculate stats
        const uniqueTypes = new Set(result.data.nodes?.map((n: any) => n.type));
        setStats({
          nodes: result.data.nodes?.length || 0,
          edges: result.data.edges?.length || 0,
          entityTypes: uniqueTypes.size,
        });
      }
    } catch (error) {
      console.error("Failed to fetch graph data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(graphData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cygraph-${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Graph
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Knowledge Graph Visualization
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Interactive visualization of extracted threat intelligence entities and relationships
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Entities</CardDescription>
              <CardTitle className="text-3xl">{stats.nodes}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Relations</CardDescription>
              <CardTitle className="text-3xl">{stats.edges}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Entity Types</CardDescription>
              <CardTitle className="text-3xl">{stats.entityTypes}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Graph Visualization */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Interactive Graph</CardTitle>
                <CardDescription>
                  Drag nodes to explore relationships. Click on nodes for details.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[600px] bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading graph visualization...</p>
                  </div>
                </div>
              ) : graphData?.nodes && graphData?.edges ? (
                <D3GraphVisualization 
                  nodes={graphData.nodes} 
                  links={graphData.edges}
                  width={1200}
                  height={600}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-slate-500 mb-4">No graph data available</p>
                  <Link href="/upload">
                    <Button>Process CTI Text First</Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Entity Types Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-red-500">Malware</Badge>
              <Badge className="bg-orange-500">Threat Actor</Badge>
              <Badge className="bg-yellow-500">Tool</Badge>
              <Badge className="bg-green-500">Vulnerability</Badge>
              <Badge className="bg-blue-500">Indicator</Badge>
              <Badge className="bg-purple-500">Campaign</Badge>
              <Badge className="bg-pink-500">Tactic</Badge>
              <Badge className="bg-cyan-500">Location</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}