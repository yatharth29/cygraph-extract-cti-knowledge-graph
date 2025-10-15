import { NextRequest, NextResponse } from "next/server";
import { neo4jService } from "@/lib/services/neo4j-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uri, username, password } = body;

    if (!uri || !username || !password) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await neo4jService.testConnection({
      uri,
      username,
      password,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}