import { NextRequest, NextResponse } from "next/server";

// This API route handles CTI text processing
// In production, this would call a FastAPI backend service
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
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock response - in production, this would call FastAPI backend
    // Example: const response = await fetch(`${process.env.FASTAPI_URL}/extract`, { ... })
    
    const mockEntities = [
      { id: "e1", text: "APT28", type: "threat-actor", confidence: 0.98, start: 0, end: 5 },
      { id: "e2", text: "Fancy Bear", type: "alias", confidence: 0.95, start: 21, end: 31 },
      { id: "e3", text: "Zebrocy", type: "malware", confidence: 0.97, start: 61, end: 68 },
      { id: "e4", text: "HTTP", type: "protocol", confidence: 0.99, start: 150, end: 154 },
      { id: "e5", text: "CVE-2017-0199", type: "vulnerability", confidence: 0.99, start: 230, end: 243 },
    ];

    const mockRelations = [
      { source: "e1", target: "e3", relation: "uses", confidence: 0.96 },
      { source: "e1", target: "e2", relation: "aka", confidence: 0.98 },
      { source: "e3", target: "e4", relation: "communicates_via", confidence: 0.95 },
      { source: "e3", target: "e5", relation: "exploits", confidence: 0.97 },
    ];

    const mockGraph = {
      nodes: mockEntities.map((e) => ({
        id: e.id,
        label: e.text,
        type: e.type,
        properties: { confidence: e.confidence },
      })),
      edges: mockRelations.map((r, idx) => ({
        id: `r${idx + 1}`,
        source: r.source,
        target: r.target,
        label: r.relation,
        confidence: r.confidence,
      })),
    };

    return NextResponse.json({
      success: true,
      entities: mockEntities,
      relations: mockRelations,
      graph: mockGraph,
      metadata: {
        processing_time: 1.85,
        model_version: "bert-base-ner-v2.0",
        confidence_threshold: 0.85,
        text_length: text.length,
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