// Neo4j Database Client for Knowledge Graph Operations
// Browser-compatible client that proxies through Next.js API routes

export interface Neo4jNode {
  id: string;
  labels: string[];
  properties: Record<string, any>;
}

export interface Neo4jRelationship {
  id: string;
  type: string;
  startNode: string;
  endNode: string;
  properties: Record<string, any>;
}

export interface CypherQuery {
  query: string;
  parameters?: Record<string, any>;
}

class Neo4jClient {
  /**
   * Execute a Cypher query through the API
   */
  async query(cypherQuery: CypherQuery): Promise<any> {
    try {
      const response = await fetch("/api/neo4j/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cypherQuery),
      });

      if (!response.ok) {
        throw new Error(`Query failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Neo4j query error:", error);
      throw error;
    }
  }

  /**
   * Get all nodes of a specific type
   */
  async getNodesByType(nodeType: string, limit = 100): Promise<Neo4jNode[]> {
    const query = {
      query: `MATCH (n:${nodeType}) RETURN n LIMIT $limit`,
      parameters: { limit },
    };
    const result = await this.query(query);
    return result.data || [];
  }

  /**
   * Get relationships between nodes
   */
  async getRelationships(
    startNodeId?: string,
    endNodeId?: string,
    relationType?: string
  ): Promise<Neo4jRelationship[]> {
    let cypherQuery = "MATCH (a)-[r";
    if (relationType) cypherQuery += `:${relationType}`;
    cypherQuery += "]->(b) ";

    const parameters: Record<string, any> = {};
    const conditions: string[] = [];

    if (startNodeId) {
      conditions.push("id(a) = $startNodeId");
      parameters.startNodeId = startNodeId;
    }
    if (endNodeId) {
      conditions.push("id(b) = $endNodeId");
      parameters.endNodeId = endNodeId;
    }

    if (conditions.length > 0) {
      cypherQuery += "WHERE " + conditions.join(" AND ") + " ";
    }

    cypherQuery += "RETURN a, r, b";

    const result = await this.query({ query: cypherQuery, parameters });
    return result.data || [];
  }

  /**
   * Create a new node
   */
  async createNode(label: string, properties: Record<string, any>): Promise<Neo4jNode> {
    const query = {
      query: `CREATE (n:${label} $props) RETURN n`,
      parameters: { props: properties },
    };
    const result = await this.query(query);
    return result.data?.[0] || null;
  }

  /**
   * Create a relationship between two nodes
   */
  async createRelationship(
    startNodeId: string,
    endNodeId: string,
    relationType: string,
    properties: Record<string, any> = {}
  ): Promise<Neo4jRelationship> {
    const query = {
      query: `
        MATCH (a), (b)
        WHERE id(a) = $startNodeId AND id(b) = $endNodeId
        CREATE (a)-[r:${relationType} $props]->(b)
        RETURN r
      `,
      parameters: {
        startNodeId,
        endNodeId,
        props: properties,
      },
    };
    const result = await this.query(query);
    return result.data?.[0] || null;
  }

  /**
   * Search nodes by property
   */
  async searchNodes(property: string, value: string, limit = 50): Promise<Neo4jNode[]> {
    const query = {
      query: `
        MATCH (n)
        WHERE n.${property} CONTAINS $value
        RETURN n
        LIMIT $limit
      `,
      parameters: { value, limit },
    };
    const result = await this.query(query);
    return result.data || [];
  }

  /**
   * Get graph statistics
   */
  async getStatistics(): Promise<any> {
    const query = {
      query: `
        MATCH (n)
        WITH labels(n) as labels, count(*) as count
        RETURN labels, count
        UNION
        MATCH ()-[r]->()
        WITH type(r) as type, count(*) as count
        RETURN type, count
      `,
      parameters: {},
    };
    const result = await this.query(query);
    return result.data || [];
  }

  /**
   * Get shortest path between two nodes
   */
  async getShortestPath(startNodeId: string, endNodeId: string): Promise<any> {
    const query = {
      query: `
        MATCH (start), (end),
        path = shortestPath((start)-[*]-(end))
        WHERE id(start) = $startNodeId AND id(end) = $endNodeId
        RETURN path
      `,
      parameters: { startNodeId, endNodeId },
    };
    const result = await this.query(query);
    return result.data?.[0] || null;
  }

  /**
   * Get neighbors of a node
   */
  async getNeighbors(nodeId: string, depth = 1): Promise<any> {
    const query = {
      query: `
        MATCH (n)-[r*1..${depth}]-(neighbor)
        WHERE id(n) = $nodeId
        RETURN DISTINCT neighbor, r
      `,
      parameters: { nodeId },
    };
    const result = await this.query(query);
    return result.data || [];
  }
}

// Export singleton instance
export const neo4jClient = new Neo4jClient();