import { NextRequest, NextResponse } from "next/server";
import { neo4jService } from "@/lib/services/neo4j-service";

export async function GET(request: NextRequest) {
  try {
    // Get Neo4j config from headers
    const configHeader = request.headers.get("x-neo4j-config");
    if (!configHeader) {
      return NextResponse.json(
        { success: false, error: "Neo4j configuration not provided" },
        { status: 400 }
      );
    }

    const config = JSON.parse(configHeader);
    
    // Connect to Neo4j
    neo4jService.connect(config);

    // Query the graph
    const result = await neo4jService.queryGraph();

    // Transform to frontend format
    const graphData = {
      nodes: result.nodes.map((node) => ({
        id: node.id,
        label: node.properties.text || node.properties.name || node.id,
        type: node.properties.type || "unknown",
        confidence: node.properties.confidence || 1,
      })),
      edges: result.relationships.map((rel) => ({
        id: rel.id,
        source: rel.startNode,
        target: rel.endNode,
        label: rel.properties.type || rel.type,
        confidence: rel.properties.confidence || 1,
      })),
    };

    await neo4jService.close();

    return NextResponse.json({
      success: true,
      data: graphData,
      metadata: {
        total_nodes: graphData.nodes.length,
        total_edges: graphData.edges.length,
      },
    });
  } catch (error: any) {
    console.error("Neo4j query error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, params, config } = body;

    if (!config) {
      return NextResponse.json(
        { success: false, error: "Neo4j configuration not provided" },
        { status: 400 }
      );
    }

    // Connect to Neo4j
    neo4jService.connect(config);

    // Execute custom Cypher query
    const result = await neo4jService.executeCypher(query, params);

    await neo4jService.close();

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Neo4j query error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}