"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Eye, Filter } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock extraction results
const mockResults = {
  entities: [
    { id: 1, text: "APT28", type: "threat-actor", confidence: 0.98, context: "APT28, also known as Fancy Bear..." },
    { id: 2, text: "Fancy Bear", type: "alias", confidence: 0.95, context: "also known as Fancy Bear, has been..." },
    { id: 3, text: "Zebrocy", type: "malware", confidence: 0.97, context: "deploying the Zebrocy malware family..." },
    { id: 4, text: "Government", type: "target-sector", confidence: 0.92, context: "target government and military organizations..." },
    { id: 5, text: "Eastern Europe", type: "location", confidence: 0.94, context: "organizations across Eastern Europe..." },
    { id: 6, text: "HTTP", type: "protocol", confidence: 0.99, context: "The malware uses HTTP for C2 communication..." },
    { id: 7, text: "CVE-2017-0199", type: "vulnerability", confidence: 0.99, context: "exploiting CVE-2017-0199..." },
    { id: 8, text: "Spear-phishing", type: "technique", confidence: 0.96, context: "leveraged spear-phishing emails..." },
  ],
  relations: [
    { id: 1, source: "APT28", relation: "uses", target: "Zebrocy", confidence: 0.96 },
    { id: 2, source: "APT28", relation: "aka", target: "Fancy Bear", confidence: 0.98 },
    { id: 3, source: "APT28", relation: "targets", target: "Government", confidence: 0.93 },
    { id: 4, source: "Zebrocy", relation: "communicates_via", target: "HTTP", confidence: 0.95 },
    { id: 5, source: "Zebrocy", relation: "exploits", target: "CVE-2017-0199", confidence: 0.97 },
    { id: 6, source: "APT28", relation: "leverages", target: "Spear-phishing", confidence: 0.94 },
    { id: 7, source: "Government", relation: "located_in", target: "Eastern Europe", confidence: 0.91 },
  ],
  attributes: [
    { entity: "Zebrocy", attribute: "malware_family", value: "Trojan", confidence: 0.89 },
    { entity: "APT28", attribute: "origin", value: "Russia", confidence: 0.87 },
    { entity: "CVE-2017-0199", attribute: "severity", value: "Critical", confidence: 0.95 },
    { entity: "Zebrocy", attribute: "c2_protocol", value: "HTTP", confidence: 0.93 },
  ],
};

export default function ResultsPage() {
  const [entityFilter, setEntityFilter] = useState("all");
  const [relationFilter, setRelationFilter] = useState("all");

  const filteredEntities =
    entityFilter === "all"
      ? mockResults.entities
      : mockResults.entities.filter((e) => e.type === entityFilter);

  const filteredRelations =
    relationFilter === "all"
      ? mockResults.relations
      : mockResults.relations.filter((r) => r.relation === relationFilter);

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
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {mockResults.entities.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Entities Extracted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {mockResults.relations.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Relations Mapped</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {mockResults.attributes.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Attributes Found</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">96.2%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Avg. Confidence</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Extraction Details</CardTitle>
            <CardDescription>Browse extracted entities, relations, and attributes</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="entities" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="entities">Entities</TabsTrigger>
                <TabsTrigger value="relations">Relations</TabsTrigger>
                <TabsTrigger value="attributes">Attributes</TabsTrigger>
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
                      <SelectItem value="threat-actor">Threat Actors</SelectItem>
                      <SelectItem value="malware">Malware</SelectItem>
                      <SelectItem value="vulnerability">Vulnerabilities</SelectItem>
                      <SelectItem value="technique">Techniques</SelectItem>
                      <SelectItem value="target-sector">Target Sectors</SelectItem>
                      <SelectItem value="location">Locations</SelectItem>
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
                        <TableHead>Context</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntities.map((entity) => (
                        <TableRow key={entity.id}>
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
                          <TableCell className="max-w-xs truncate text-sm text-slate-600">
                            {entity.context}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
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
                      <SelectItem value="uses">Uses</SelectItem>
                      <SelectItem value="targets">Targets</SelectItem>
                      <SelectItem value="exploits">Exploits</SelectItem>
                      <SelectItem value="communicates_via">Communicates Via</SelectItem>
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
                      {filteredRelations.map((relation) => (
                        <TableRow key={relation.id}>
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

              {/* Attributes Tab */}
              <TabsContent value="attributes" className="space-y-4">
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity</TableHead>
                        <TableHead>Attribute</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Confidence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockResults.attributes.map((attr, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{attr.entity}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{attr.attribute}</Badge>
                          </TableCell>
                          <TableCell>{attr.value}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getConfidenceBadge(attr.confidence)}
                              <span className="text-sm text-slate-600">{(attr.confidence * 100).toFixed(1)}%</span>
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