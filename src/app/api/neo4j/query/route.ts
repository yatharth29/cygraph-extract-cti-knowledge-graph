import { NextRequest, NextResponse } from "next/server";
import { neo4jService } from "@/lib/services/neo4j-service";
import { neo4jHttpService } from "@/lib/services/neo4j-http-service";

export async function POST(request: NextRequest) {
  try {
    const { query, params, config } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Cypher query is required" },
        { status: 400 }
      );
    }

    // Get config from request or environment
    const neo4jConfig = config || {
      uri: process.env.NEO4J_URI || "",
      username: process.env.NEO4J_USERNAME || "",
      password: process.env.NEO4J_PASSWORD || "",
      database: process.env.NEO4J_DATABASE || "neo4j",
    };

    if (!neo4jConfig.uri || !neo4jConfig.username || !neo4jConfig.password) {
      return NextResponse.json(
        { error: "Neo4j configuration missing" },
        { status: 500 }
      );
    }

    // Try driver-based execution first
    try {
      neo4jService.connect(neo4jConfig);
      const result = await neo4jService.executeCypher(query, params);
      await neo4jService.close();
      
      return NextResponse.json({ success: true, data: result });
    } catch (driverError: any) {
      console.log("Driver failed, trying HTTP API:", driverError.message);
      
      // Fallback to HTTP API
      const instanceMatch = neo4jConfig.uri.match(/neo4j\+s:\/\/([^.]+)\.databases\.neo4j\.io/);
      if (instanceMatch) {
        const instanceId = instanceMatch[1];
        const queryUrl = `https://${instanceId}.databases.neo4j.io/db/neo4j/query/v2`;
        
        const httpResult = await neo4jHttpService.executeQuery(
          {
            queryUrl,
            username: neo4jConfig.username,
            password: neo4jConfig.password,
          },
          query,
          params
        );

        return NextResponse.json({ 
          success: true, 
          data: httpResult,
          method: "http" 
        });
      }
      
      throw driverError;
    }
  } catch (error: any) {
    console.error("Neo4j query error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}