import { NextRequest, NextResponse } from "next/server";
import { neo4jService } from "@/lib/services/neo4j-service";
import { neo4jHttpService } from "@/lib/services/neo4j-http-service";

export async function POST(request: NextRequest) {
  try {
    const { uri, username, password } = await request.json();

    if (!uri || !username || !password) {
      return NextResponse.json(
        { success: false, error: "Missing required credentials" },
        { status: 400 }
      );
    }

    // Try driver-based connection first
    const driverResult = await neo4jService.testConnection({
      uri,
      username,
      password,
      database: "neo4j",
    });

    if (driverResult.success) {
      return NextResponse.json(driverResult);
    }

    // If driver fails, try HTTP API
    // Extract instance ID from URI (e.g., neo4j+s://8c50b971.databases.neo4j.io)
    const instanceMatch = uri.match(/neo4j\+s:\/\/([^.]+)\.databases\.neo4j\.io/);
    if (instanceMatch) {
      const instanceId = instanceMatch[1];
      const queryUrl = `https://${instanceId}.databases.neo4j.io/db/neo4j/query/v2`;
      
      const httpResult = await neo4jHttpService.testConnection({
        queryUrl,
        username,
        password,
      });

      if (httpResult.success) {
        return NextResponse.json({
          ...httpResult,
          method: "http",
          message: "Connected via HTTP API",
        });
      }
    }

    // Both methods failed
    return NextResponse.json({
      success: false,
      error: driverResult.error || "Connection failed with both driver and HTTP API",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}