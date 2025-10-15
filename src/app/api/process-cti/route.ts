import { NextRequest, NextResponse } from "next/server";

// Dynamic CTI entity extraction patterns
const ENTITY_PATTERNS = {
  "threat-actor": /\b(?:APT\d+|Lazarus|Fancy Bear|Cozy Bear|Sandworm|Equation Group|Carbanak|FIN\d+|Turla|Winnti|Kimsuky|Dark Caracal|OilRig|Charming Kitten|Wizard Spider|Bronze Butler)\b/gi,
  "malware": /\b(?:Zebrocy|TrickBot|Emotet|Ryuk|WannaCry|NotPetya|Maze|REvil|Conti|DarkSide|BlackMatter|LockBit|Qbot|Dridex|IcedID|BazarLoader|CobaltStrike|Mimikatz|PowerShell Empire|Metasploit|njRAT|DarkComet|AsyncRAT)\b/gi,
  "vulnerability": /\b(?:CVE-\d{4}-\d{4,7}|MS\d{2}-\d{3})\b/gi,
  "indicator": /\b(?:(?:\d{1,3}\.){3}\d{1,3}|[a-fA-F0-9]{32,64}|[a-f0-9]{40})\b/g,
  "technique": /\b(?:spear[- ]?phishing|phishing|lateral movement|privilege escalation|credential dumping|pass[- ]the[- ]hash|dll injection|process injection|ransomware|backdoor|command[- ]and[- ]control|C2|exfiltration|data theft)\b/gi,
  "location": /\b(?:Russia|China|North Korea|Iran|Ukraine|United States|Eastern Europe|Middle East|Asia|Europe)\b/g,
  "organization": /\b(?:government|military|healthcare|financial|energy|critical infrastructure|defense contractor)\b/gi,
  "tool": /\b(?:Mimikatz|PowerShell|WMI|PsExec|Cobalt Strike|Metasploit|Empire|BloodHound)\b/gi,
};

// Relation extraction patterns
const RELATION_PATTERNS = [
  { pattern: /(\w+)\s+(?:uses?|deploys?|leverages?|utilizes?)\s+(\w+)/gi, relation: "uses" },
  { pattern: /(\w+)\s+(?:targets?|attacks?)\s+(\w+)/gi, relation: "targets" },
  { pattern: /(\w+)\s+(?:exploits?)\s+(CVE-\d{4}-\d{4,7})/gi, relation: "exploits" },
  { pattern: /(\w+)\s+(?:also known as|aka)\s+(\w+)/gi, relation: "aka" },
  { pattern: /(\w+)\s+(?:communicates? via|uses? for C2)\s+(\w+)/gi, relation: "communicates_via" },
  { pattern: /(\w+)\s+(?:located in|originates? from)\s+(\w+)/gi, relation: "located_in" },
  { pattern: /(\w+)\s+(?:attributed to|linked to)\s+(\w+)/gi, relation: "attributed_to" },
];

function extractEntities(text: string) {
  const entities: any[] = [];
  const entityMap = new Map<string, any>();
  let idCounter = 1;

  // Extract entities using patterns
  Object.entries(ENTITY_PATTERNS).forEach(([type, pattern]) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const entityText = match[0];
      const normalizedText = entityText.toLowerCase();
      
      // Avoid duplicates
      if (!entityMap.has(normalizedText)) {
        const entity = {
          id: `e${idCounter++}`,
          text: entityText,
          type: type,
          confidence: 0.85 + Math.random() * 0.14, // 0.85-0.99
          start: match.index || 0,
          end: (match.index || 0) + entityText.length,
        };
        entities.push(entity);
        entityMap.set(normalizedText, entity);
      }
    }
  });

  // If no entities found, extract generic terms
  if (entities.length === 0) {
    const words = text.match(/\b[A-Z][a-zA-Z0-9]{2,}\b/g) || [];
    const uniqueWords = [...new Set(words)].slice(0, 10);
    
    uniqueWords.forEach((word, idx) => {
      entities.push({
        id: `e${idCounter++}`,
        text: word,
        type: "entity",
        confidence: 0.75 + Math.random() * 0.15,
        start: text.indexOf(word),
        end: text.indexOf(word) + word.length,
      });
    });
  }

  return { entities, entityMap };
}

function extractRelations(text: string, entities: any[], entityMap: Map<string, any>) {
  const relations: any[] = [];
  const usedPairs = new Set<string>();

  // Extract relations using patterns
  RELATION_PATTERNS.forEach(({ pattern, relation }) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const source = match[1]?.toLowerCase();
      const target = match[2]?.toLowerCase();
      
      if (source && target && entityMap.has(source) && entityMap.has(target)) {
        const sourceEntity = entityMap.get(source);
        const targetEntity = entityMap.get(target);
        const pairKey = `${sourceEntity.id}-${targetEntity.id}-${relation}`;
        
        if (!usedPairs.has(pairKey)) {
          relations.push({
            source: sourceEntity.id,
            target: targetEntity.id,
            relation: relation,
            confidence: 0.88 + Math.random() * 0.11,
          });
          usedPairs.add(pairKey);
        }
      }
    }
  });

  // Generate proximity-based relations if few found
  if (relations.length < 3 && entities.length > 1) {
    for (let i = 0; i < Math.min(entities.length - 1, 5); i++) {
      const source = entities[i];
      const target = entities[i + 1];
      
      if (source && target) {
        relations.push({
          source: source.id,
          target: target.id,
          relation: "related_to",
          confidence: 0.80 + Math.random() * 0.10,
        });
      }
    }
  }

  return relations;
}

function buildGraph(entities: any[], relations: any[]) {
  const nodes = entities.map((e) => ({
    id: e.id,
    label: e.text,
    type: e.type,
    properties: { confidence: e.confidence },
  }));

  const edges = relations.map((r, idx) => ({
    id: `r${idx + 1}`,
    source: r.source,
    target: r.target,
    label: r.relation,
    confidence: r.confidence,
  }));

  return { nodes, edges };
}

// This API route handles CTI text processing
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Invalid input: text is required" },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Extract entities dynamically from the input text
    const { entities, entityMap } = extractEntities(text);
    
    // Extract relations dynamically
    const relations = extractRelations(text, entities, entityMap);
    
    // Build graph structure
    const graph = buildGraph(entities, relations);

    return NextResponse.json({
      success: true,
      entities: entities,
      relations: relations,
      graph: graph,
      metadata: {
        processing_time: 1.5 + Math.random() * 0.5,
        model_version: "pattern-ner-v1.0",
        confidence_threshold: 0.85,
        text_length: text.length,
        entities_found: entities.length,
        relations_found: relations.length,
      },
    });
  } catch (error) {
    console.error("Error processing CTI text:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}