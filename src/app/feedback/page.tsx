"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import FeedbackForm from "@/components/FeedbackForm";
import { Badge } from "@/components/ui/badge";
import { fastapiClient } from "@/lib/services/fastapi-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function FeedbackPage() {
  const [invalidTriples, setInvalidTriples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTriple, setSelectedTriple] = useState<any>(null);

  useEffect(() => {
    fetchInvalidTriples();
  }, []);

  const fetchInvalidTriples = async () => {
    setLoading(true);
    try {
      // Mock data - backend endpoint for fetching invalid triples not yet implemented
      const mockTriples = [
        {
          id: 1,
          subject: "APT28",
          relation: "exploits",
          object: "Eastern Europe",
          error: "Invalid relation: 'exploits' cannot connect ThreatActor to Location. Expected Tool or Vulnerability.",
          timestamp: new Date().toISOString(),
        },
        {
          id: 2,
          subject: "Zebrocy",
          relation: "targets",
          object: "HTTP",
          error: "Entity type mismatch: Malware cannot 'target' a Protocol. Did you mean 'uses'?",
          timestamp: new Date().toISOString(),
        },
      ];
      setInvalidTriples(mockTriples);
    } catch (error) {
      console.error("Failed to fetch invalid triples:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (feedback: any) => {
    try {
      // Submit to FastAPI backend
      await fastapiClient.submitFeedback({
        extraction_id: selectedTriple.id,
        corrections: [
          {
            entity_id: selectedTriple.id.toString(),
            correct_type: feedback.correctedType,
            correct_text: feedback.correctedText,
            should_delete: feedback.shouldDelete,
          },
        ],
      });

      toast.success("Feedback submitted successfully!");
      
      // Remove the triple from the list after successful feedback
      setInvalidTriples((prev) => prev.filter((t) => t.id !== selectedTriple.id));
      setSelectedTriple(null);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    }
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
          <Button onClick={fetchInvalidTriples} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Self-Correcting Feedback
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Review and provide feedback on invalid triples to improve the extraction pipeline
            </p>
          </div>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Using demo data - backend endpoint for fetching invalid triples not yet implemented
            </AlertDescription>
          </Alert>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Invalid Triples List */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Invalid Triples ({invalidTriples.length})</CardTitle>
                  <CardDescription>
                    Triples that failed ontology validation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-slate-500 text-sm">Loading...</p>
                  ) : invalidTriples.length === 0 ? (
                    <p className="text-slate-500 text-sm">No invalid triples found</p>
                  ) : (
                    <div className="space-y-3">
                      {invalidTriples.map((triple) => (
                        <div
                          key={triple.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedTriple?.id === triple.id
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                          }`}
                          onClick={() => setSelectedTriple(triple)}
                        >
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {triple.subject}
                            </Badge>
                            <span className="text-slate-400">→</span>
                            <Badge variant="outline" className="text-xs">
                              {triple.relation}
                            </Badge>
                            <span className="text-slate-400">→</span>
                            <Badge variant="secondary" className="text-xs">
                              {triple.object}
                            </Badge>
                          </div>
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {triple.error}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Feedback Form */}
            <div>
              {selectedTriple ? (
                <FeedbackForm
                  triple={{
                    subject: selectedTriple.subject,
                    relation: selectedTriple.relation,
                    object: selectedTriple.object,
                  }}
                  validationError={selectedTriple.error}
                  onSubmit={handleFeedbackSubmit}
                />
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-slate-500 text-center">
                      Select an invalid triple to provide feedback
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Statistics */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Feedback Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {invalidTriples.length}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Pending Review
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Corrected
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    85%
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Validation Rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}