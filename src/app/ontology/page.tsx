"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, Download, FileCode, Network, CheckCircle } from "lucide-react";
import Link from "next/link";
import { ontologyManager, OntologyStructure } from "@/lib/services/ontology-manager";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function OntologyPage() {
  const [ontology, setOntology] = useState<OntologyStructure | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    // Load default ontology on mount
    const defaultOntology = ontologyManager.loadDefaultOntology();
    setOntology(defaultOntology);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setUploadStatus(null);

    try {
      const content = await file.text();
      const loadedOntology = await ontologyManager.loadOntology(content);
      setOntology(loadedOntology);
      setUploadStatus("success");
    } catch (error) {
      setUploadStatus("error");
      console.error("Error loading ontology:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!ontology) return;

    const dataStr = JSON.stringify(ontology, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ontology-structure.json";
    link.click();
    URL.revokeObjectURL(url);
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

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Ontology Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage and visualize CTI ontology structure (OWL/RDF)
            </p>
          </div>
          <div className="flex gap-2">
            <label htmlFor="owl-upload">
              <Button variant="outline" className="cursor-pointer" disabled={isLoading}>
                <Upload className="h-4 w-4 mr-2" />
                Upload OWL
              </Button>
              <input
                id="owl-upload"
                type="file"
                accept=".owl,.rdf,.xml"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <Button variant="outline" onClick={handleExport} disabled={!ontology}>
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>

        {uploadStatus && (
          <Alert
            className={`mb-6 ${
              uploadStatus === "success"
                ? "border-green-500 bg-green-50 dark:bg-green-950"
                : "border-red-500 bg-red-50 dark:bg-red-950"
            }`}
          >
            <CheckCircle
              className={`h-4 w-4 ${uploadStatus === "success" ? "text-green-600" : "text-red-600"}`}
            />
            <AlertDescription
              className={uploadStatus === "success" ? "text-green-600 dark:text-green-400" : "text-red-600"}
            >
              {uploadStatus === "success"
                ? "Ontology loaded successfully!"
                : "Error loading ontology file. Please check the format."}
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <FileCode className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <div className="text-3xl font-bold">{ontology?.classes.length || 0}</div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Entity Classes</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Network className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <div className="text-3xl font-bold">{ontology?.relations.length || 0}</div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Relations Defined</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div className="text-3xl font-bold">{ontology?.properties.length || 0}</div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Properties</div>
            </CardContent>
          </Card>
        </div>

        {/* Ontology Details */}
        <Card>
          <CardHeader>
            <CardTitle>Ontology Structure</CardTitle>
            <CardDescription>Browse classes, properties, and relations</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="classes">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="classes">Classes</TabsTrigger>
                <TabsTrigger value="relations">Relations</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
              </TabsList>

              <TabsContent value="classes" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {ontology?.classes.map((cls) => (
                    <Card key={cls.id} className="border-2">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{cls.label}</CardTitle>
                          <Badge variant="secondary">{cls.id}</Badge>
                        </div>
                        {cls.description && (
                          <CardDescription className="text-sm">{cls.description}</CardDescription>
                        )}
                      </CardHeader>
                      {cls.superClasses.length > 0 && (
                        <CardContent>
                          <div className="text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Inherits from:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {cls.superClasses.map((sc) => (
                                <Badge key={sc} variant="outline">
                                  {sc}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="relations" className="space-y-4">
                <div className="space-y-3">
                  {ontology?.relations.map((rel) => (
                    <Card key={rel.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Badge className="bg-indigo-500">{rel.domain}</Badge>
                            <span className="font-mono font-bold text-lg">{rel.label}</span>
                            <Badge className="bg-purple-500">{rel.range}</Badge>
                          </div>
                          <Badge variant="outline">{rel.id}</Badge>
                        </div>
                        {rel.inverse && (
                          <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Inverse: <Badge variant="secondary">{rel.inverse}</Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="properties" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {ontology?.properties.map((prop) => (
                    <Card key={prop.id} className="border-2">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{prop.label}</CardTitle>
                          <Badge variant={prop.type === "object" ? "default" : "secondary"}>
                            {prop.type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {prop.domain.length > 0 && (
                          <div>
                            <span className="text-slate-600 dark:text-slate-400">Domain:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {prop.domain.map((d) => (
                                <Badge key={d} variant="outline" className="text-xs">
                                  {d}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {prop.range.length > 0 && (
                          <div>
                            <span className="text-slate-600 dark:text-slate-400">Range:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {prop.range.map((r) => (
                                <Badge key={r} variant="outline" className="text-xs">
                                  {r}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}