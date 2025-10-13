// Relation Extraction Service
// Extracts relationships between entities using pattern matching and ML

import { NEREntity } from "./ner-pipeline";

export interface ExtractedRelation {
  id: string;
  source: NEREntity;
  target: NEREntity;
  relation: string;
  confidence: number;
  context: string;
}

export interface RelationPattern {
  source_types: string[];
  target_types: string[];
  patterns: string[];
  relation_type: string;
}

class RelationExtractor {
  private patterns: RelationPattern[] = [
    {
      source_types: ["threat-actor"],
      target_types: ["malware"],
      patterns: ["uses", "deploys", "leverages", "distributes", "operates"],
      relation_type: "uses",
    },
    {
      source_types: ["threat-actor"],
      target_types: ["target-sector", "organization"],
      patterns: ["targets", "attacks", "compromises", "infiltrates"],
      relation_type: "targets",
    },
    {
      source_types: ["malware"],
      target_types: ["vulnerability"],
      patterns: ["exploits", "leverages", "abuses", "takes advantage of"],
      relation_type: "exploits",
    },
    {
      source_types: ["threat-actor"],
      target_types: ["technique"],
      patterns: ["uses", "employs", "leverages", "utilizes"],
      relation_type: "leverages",
    },
    {
      source_types: ["malware"],
      target_types: ["protocol", "network"],
      patterns: ["communicates via", "uses", "connects through"],
      relation_type: "communicates_via",
    },
    {
      source_types: ["threat-actor"],
      target_types: ["threat-actor"],
      patterns: ["also known as", "aka", "identified as", "aliases"],
      relation_type: "aka",
    },
    {
      source_types: ["malware"],
      target_types: ["ip-address", "domain"],
      patterns: ["connects to", "communicates with", "beacons to", "contacts"],
      relation_type: "connects_to",
    },
    {
      source_types: ["target-sector", "organization"],
      target_types: ["location"],
      patterns: ["located in", "based in", "operates in"],
      relation_type: "located_in",
    },
  ];

  /**
   * Extract relations between entities in text
   */
  async extractRelations(text: string, entities: NEREntity[]): Promise<ExtractedRelation[]> {
    const relations: ExtractedRelation[] = [];

    // Sort entities by position in text
    const sortedEntities = [...entities].sort((a, b) => a.start - b.start);

    // Check each pair of entities
    for (let i = 0; i < sortedEntities.length; i++) {
      for (let j = i + 1; j < sortedEntities.length; j++) {
        const source = sortedEntities[i];
        const target = sortedEntities[j];

        // Skip if entities are too far apart (> 100 characters)
        if (target.start - source.end > 100) continue;

        // Extract context between entities
        const context = text.substring(source.end, target.start);

        // Try to match patterns
        const matchedRelations = this.matchPatterns(source, target, context);

        if (matchedRelations.length > 0) {
          // Take the highest confidence match
          const bestMatch = matchedRelations.reduce((best, current) =>
            current.confidence > best.confidence ? current : best
          );

          relations.push({
            id: `rel_${relations.length + 1}`,
            source,
            target,
            relation: bestMatch.relation_type,
            confidence: bestMatch.confidence,
            context: context.trim(),
          });
        }
      }
    }

    return relations;
  }

  /**
   * Match entity pair against relation patterns
   */
  private matchPatterns(
    source: NEREntity,
    target: NEREntity,
    context: string
  ): Array<{ relation_type: string; confidence: number }> {
    const matches: Array<{ relation_type: string; confidence: number }> = [];
    const contextLower = context.toLowerCase();

    for (const pattern of this.patterns) {
      // Check if entity types match pattern
      if (
        pattern.source_types.includes(source.type) &&
        pattern.target_types.includes(target.type)
      ) {
        // Check if any pattern keyword is in context
        for (const keyword of pattern.patterns) {
          if (contextLower.includes(keyword)) {
            // Calculate confidence based on:
            // 1. Entity confidences
            // 2. Pattern match quality
            // 3. Distance between entities
            const avgEntityConfidence = (source.confidence + target.confidence) / 2;
            const distanceScore = Math.max(0.7, 1 - context.length / 100);
            const patternScore = keyword.length > 5 ? 0.95 : 0.85; // Longer patterns = higher confidence

            const confidence = avgEntityConfidence * distanceScore * patternScore;

            matches.push({
              relation_type: pattern.relation_type,
              confidence: Math.min(confidence, 0.99),
            });
          }
        }
      }
    }

    return matches;
  }

  /**
   * Add custom relation pattern
   */
  addPattern(pattern: RelationPattern): void {
    this.patterns.push(pattern);
  }

  /**
   * Get all defined patterns
   */
  getPatterns(): RelationPattern[] {
    return this.patterns;
  }

  /**
   * Extract co-occurrence relations (entities mentioned close together)
   */
  extractCooccurrences(
    entities: NEREntity[],
    windowSize: number = 50
  ): ExtractedRelation[] {
    const cooccurrences: ExtractedRelation[] = [];

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const source = entities[i];
        const target = entities[j];

        // Check if entities are within window
        if (Math.abs(target.start - source.start) <= windowSize) {
          cooccurrences.push({
            id: `cooc_${cooccurrences.length + 1}`,
            source,
            target,
            relation: "co-occurs_with",
            confidence: 0.7, // Lower confidence for simple co-occurrence
            context: "",
          });
        }
      }
    }

    return cooccurrences;
  }
}

// Export singleton instance
export const relationExtractor = new RelationExtractor();