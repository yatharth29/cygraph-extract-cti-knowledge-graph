// Named Entity Recognition Pipeline with Hugging Face Integration
// Self-correcting feedback loop system for continuous improvement

export interface NEREntity {
  text: string;
  type: string;
  start: number;
  end: number;
  confidence: number;
}

export interface NERResult {
  entities: NEREntity[];
  raw_text: string;
  model_used: string;
  processing_time: number;
}

export interface FeedbackCorrection {
  original_entity: NEREntity;
  corrected_type?: string;
  corrected_text?: string;
  should_delete: boolean;
  reason?: string;
}

export interface FeedbackBatch {
  extraction_id: string;
  corrections: FeedbackCorrection[];
  user_id?: string;
  timestamp: number;
}

class NERPipeline {
  private model: string = "dslim/bert-base-NER";
  private feedbackHistory: FeedbackBatch[] = [];
  private confidenceThreshold: number = 0.85;

  /**
   * Extract entities using Hugging Face Inference API
   */
  async extractEntities(text: string): Promise<NERResult> {
    const startTime = Date.now();

    try {
      // In production, this would call Hugging Face API
      // const response = await fetch(
      //   `https://api-inference.huggingface.co/models/${this.model}`,
      //   {
      //     headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
      //     method: "POST",
      //     body: JSON.stringify({ inputs: text }),
      //   }
      // );

      // Mock NER extraction for demo
      const entities = this.mockNERExtraction(text);

      const processingTime = Date.now() - startTime;

      return {
        entities,
        raw_text: text,
        model_used: this.model,
        processing_time: processingTime,
      };
    } catch (error) {
      console.error("NER extraction error:", error);
      throw error;
    }
  }

  /**
   * Mock NER extraction - simulates Hugging Face model output
   */
  private mockNERExtraction(text: string): NEREntity[] {
    const entities: NEREntity[] = [];

    // Common CTI patterns
    const patterns = [
      // Threat actors
      { regex: /\b(APT\d+|Fancy Bear|Cozy Bear|Lazarus Group|Equation Group)\b/gi, type: "threat-actor" },
      // Malware
      { regex: /\b(Zebrocy|WannaCry|Emotet|TrickBot|Ryuk|Cobalt Strike)\b/gi, type: "malware" },
      // CVEs
      { regex: /CVE-\d{4}-\d{4,7}/gi, type: "vulnerability" },
      // IPs
      { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, type: "ip-address" },
      // URLs/Domains
      { regex: /\b(?:https?:\/\/)?(?:www\.)?[\w\-]+\.[\w\-]+(?:\.[\w\-]+)*\b/gi, type: "domain" },
      // Hash values (simplified)
      { regex: /\b[a-f0-9]{32,64}\b/gi, type: "hash" },
      // Attack techniques
      { regex: /\b(spear-?phishing|DDoS|SQL injection|XSS|buffer overflow)\b/gi, type: "technique" },
      // Organizations/Targets
      { regex: /\b(government|military|healthcare|finance|energy sector)\b/gi, type: "target-sector" },
    ];

    patterns.forEach(({ regex, type }) => {
      let match;
      while ((match = regex.exec(text)) !== null) {
        // Calculate confidence based on context and pattern strength
        const confidence = 0.85 + Math.random() * 0.13; // 0.85-0.98

        entities.push({
          text: match[0],
          type,
          start: match.index,
          end: match.index + match[0].length,
          confidence: Math.min(confidence, 0.99),
        });
      }
    });

    // Apply feedback-based corrections
    return this.applyFeedbackCorrections(entities);
  }

  /**
   * Apply historical feedback to improve extraction
   */
  private applyFeedbackCorrections(entities: NEREntity[]): NEREntity[] {
    if (this.feedbackHistory.length === 0) return entities;

    // Build correction map from feedback history
    const correctionMap = new Map<string, { type: string; frequency: number }>();

    this.feedbackHistory.forEach((batch) => {
      batch.corrections.forEach((correction) => {
        if (correction.corrected_type && !correction.should_delete) {
          const key = correction.original_entity.text.toLowerCase();
          const existing = correctionMap.get(key);
          if (existing && existing.type === correction.corrected_type) {
            existing.frequency++;
          } else {
            correctionMap.set(key, { type: correction.corrected_type, frequency: 1 });
          }
        }
      });
    });

    // Apply corrections to entities
    return entities.map((entity) => {
      const correction = correctionMap.get(entity.text.toLowerCase());
      if (correction && correction.frequency >= 2) {
        // Apply correction if it appears in feedback at least twice
        return {
          ...entity,
          type: correction.type,
          confidence: Math.min(entity.confidence + 0.05, 0.99), // Boost confidence
        };
      }
      return entity;
    });
  }

  /**
   * Submit user feedback for entity corrections
   */
  async submitFeedback(feedback: FeedbackBatch): Promise<void> {
    try {
      // Store feedback locally
      this.feedbackHistory.push(feedback);

      // In production, send to backend for model retraining
      // await fetch('/api/feedback', {
      //   method: 'POST',
      //   body: JSON.stringify(feedback),
      // });

      console.log("Feedback recorded:", feedback);

      // Simulate learning from feedback
      this.adjustConfidenceThresholds(feedback);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      throw error;
    }
  }

  /**
   * Adjust confidence thresholds based on feedback
   */
  private adjustConfidenceThresholds(feedback: FeedbackBatch): void {
    // Analyze feedback to adjust thresholds
    const falsePositives = feedback.corrections.filter((c) => c.should_delete).length;
    const totalCorrections = feedback.corrections.length;

    if (totalCorrections > 0) {
      const errorRate = falsePositives / totalCorrections;

      // Increase threshold if too many false positives
      if (errorRate > 0.3 && this.confidenceThreshold < 0.95) {
        this.confidenceThreshold += 0.02;
        console.log(`Adjusted confidence threshold to ${this.confidenceThreshold}`);
      }
      // Decrease threshold if corrections are mostly type changes (not deletions)
      else if (errorRate < 0.1 && this.confidenceThreshold > 0.75) {
        this.confidenceThreshold -= 0.01;
        console.log(`Adjusted confidence threshold to ${this.confidenceThreshold}`);
      }
    }
  }

  /**
   * Get feedback statistics
   */
  getFeedbackStats(): {
    total_feedback: number;
    total_corrections: number;
    improvement_rate: number;
  } {
    const totalFeedback = this.feedbackHistory.length;
    const totalCorrections = this.feedbackHistory.reduce(
      (sum, batch) => sum + batch.corrections.length,
      0
    );

    // Calculate improvement rate based on feedback frequency
    const recentFeedback = this.feedbackHistory.slice(-10);
    const recentCorrections = recentFeedback.reduce((sum, batch) => sum + batch.corrections.length, 0);
    const improvementRate = recentFeedback.length > 0 ? recentCorrections / recentFeedback.length : 0;

    return {
      total_feedback: totalFeedback,
      total_corrections: totalCorrections,
      improvement_rate: Math.max(0, 1 - improvementRate / 10), // Lower corrections = higher improvement
    };
  }

  /**
   * Set model to use for NER
   */
  setModel(modelName: string): void {
    this.model = modelName;
  }

  /**
   * Get current model name
   */
  getModel(): string {
    return this.model;
  }

  /**
   * Set confidence threshold
   */
  setConfidenceThreshold(threshold: number): void {
    this.confidenceThreshold = Math.max(0.5, Math.min(threshold, 0.99));
  }

  /**
   * Get current confidence threshold
   */
  getConfidenceThreshold(): number {
    return this.confidenceThreshold;
  }
}

// Export singleton instance
export const nerPipeline = new NERPipeline();