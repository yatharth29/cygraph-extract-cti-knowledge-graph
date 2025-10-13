"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FeedbackFormProps {
  triple: {
    subject: string;
    relation: string;
    object: string;
  };
  validationError?: string;
  onSubmit: (feedback: any) => Promise<void>;
}

export default function FeedbackForm({ triple, validationError, onSubmit }: FeedbackFormProps) {
  const [feedback, setFeedback] = useState("");
  const [correctionType, setCorrectionType] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!correctionType) {
      setError("Please select a correction type");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await onSubmit({
        triple,
        correctionType,
        feedback,
        timestamp: new Date().toISOString(),
      });
      setSuccess(true);
      setFeedback("");
      setCorrectionType("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provide Correction Feedback</CardTitle>
        <CardDescription>
          Help improve the self-correcting pipeline by providing feedback on invalid triples
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Triple */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium mb-2">Current Triple:</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{triple.subject}</Badge>
            <span className="text-slate-500">→</span>
            <Badge variant="outline">{triple.relation}</Badge>
            <span className="text-slate-500">→</span>
            <Badge variant="secondary">{triple.object}</Badge>
          </div>
          {validationError && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Correction Type */}
        <div>
          <Label htmlFor="correction-type">Correction Type</Label>
          <Select value={correctionType} onValueChange={setCorrectionType}>
            <SelectTrigger id="correction-type" className="mt-2">
              <SelectValue placeholder="Select correction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wrong_relation">Wrong Relation</SelectItem>
              <SelectItem value="wrong_subject">Wrong Subject Entity</SelectItem>
              <SelectItem value="wrong_object">Wrong Object Entity</SelectItem>
              <SelectItem value="entity_type_mismatch">Entity Type Mismatch</SelectItem>
              <SelectItem value="missing_context">Missing Context</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Feedback Text */}
        <div>
          <Label htmlFor="feedback-text">Detailed Feedback</Label>
          <Textarea
            id="feedback-text"
            placeholder="Explain the issue and suggest corrections..."
            className="mt-2 min-h-[120px]"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Feedback submitted successfully! The system will learn from this correction.
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting || !correctionType}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Feedback"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}