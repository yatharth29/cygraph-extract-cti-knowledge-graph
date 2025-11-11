/**
 * Neo4j HTTP Query API Service
 * Alternative to driver-based connection using Neo4j's HTTP API
 */

export interface Neo4jHttpConfig {
  queryUrl: string; // e.g., https://8c50b971.databases.neo4j.io/db/neo4j/query/v2
  username: string;
  password: string;
}

export interface Neo4jHttpResponse {
  data?: {
    fields: string[];
    values: any[][];
  };
  error?: {
    message: string;
    code: string;
  };
}

class Neo4jHttpService {
  /**
   * Execute Cypher query using HTTP API
   */
  async executeQuery(
    config: Neo4jHttpConfig,
    cypherQuery: string,
    parameters?: Record<string, any>
  ): Promise<any> {
    const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

    const response = await fetch(config.queryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        statement: cypherQuery,
        parameters: parameters || {},
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Neo4j HTTP API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Test connection using HTTP API
   */
  async testConnection(config: Neo4jHttpConfig): Promise<{
    success: boolean;
    version?: string;
    error?: string;
  }> {
    try {
      const result = await this.executeQuery(
        config,
        "RETURN 'Connection successful' as status, '5.x' as version"
      );

      if (result.data && result.data.values && result.data.values.length > 0) {
        return {
          success: true,
          version: result.data.values[0][1] || 'Connected via HTTP API',
        };
      }

      return {
        success: false,
        error: 'Unexpected response format',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get graph data using HTTP API
   */
  async getGraphData(config: Neo4jHttpConfig, limit: number = 100): Promise<{
    nodes: any[];
    relationships: any[];
  }> {
    try {
      const result = await this.executeQuery(
        config,
        `
        MATCH (n:Entity)
        OPTIONAL MATCH (n)-[r:RELATES]->(m:Entity)
        RETURN n, r, m
        LIMIT $limit
        `,
        { limit }
      );

      const nodes: any[] = [];
      const relationships: any[] = [];
      const nodeIds = new Set<string>();

      if (result.data && result.data.values) {
        result.data.values.forEach((row: any[]) => {
          const n = row[0];
          const r = row[1];
          const m = row[2];

          // Process source node
          if (n && n.properties && !nodeIds.has(n.properties.id)) {
            nodes.push({
              id: n.properties.id,
              labels: n.labels || ['Entity'],
              properties: n.properties,
            });
            nodeIds.add(n.properties.id);
          }

          // Process target node
          if (m && m.properties && !nodeIds.has(m.properties.id)) {
            nodes.push({
              id: m.properties.id,
              labels: m.labels || ['Entity'],
              properties: m.properties,
            });
            nodeIds.add(m.properties.id);
          }

          // Process relationship
          if (r && r.properties && n && m) {
            relationships.push({
              id: r.id || `rel-${relationships.length}`,
              type: r.properties.type || r.type || 'RELATES',
              startNode: n.properties.id,
              endNode: m.properties.id,
              properties: r.properties,
            });
          }
        });
      }

      return { nodes, relationships };
    } catch (error) {
      console.error('Failed to get graph data:', error);
      return { nodes: [], relationships: [] };
    }
  }

  /**
   * Create entity using HTTP API
   */
  async createEntity(
    config: Neo4jHttpConfig,
    entity: {
      id: string;
      text: string;
      type: string;
      confidence: number;
      attributes?: Record<string, any>;
    }
  ): Promise<void> {
    await this.executeQuery(
      config,
      `
      MERGE (e:Entity {id: $id})
      SET e.text = $text,
          e.type = $type,
          e.confidence = $confidence,
          e.attributes = $attributes,
          e.updated_at = datetime()
      `,
      {
        id: entity.id,
        text: entity.text,
        type: entity.type,
        confidence: entity.confidence,
        attributes: JSON.stringify(entity.attributes || {}),
      }
    );
  }

  /**
   * Create relation using HTTP API
   */
  async createRelation(
    config: Neo4jHttpConfig,
    relation: {
      source: string;
      target: string;
      relation: string;
      confidence: number;
    }
  ): Promise<void> {
    await this.executeQuery(
      config,
      `
      MATCH (source:Entity {id: $sourceId})
      MATCH (target:Entity {id: $targetId})
      MERGE (source)-[r:RELATES {type: $relationType}]->(target)
      SET r.confidence = $confidence,
          r.updated_at = datetime()
      `,
      {
        sourceId: relation.source,
        targetId: relation.target,
        relationType: relation.relation,
        confidence: relation.confidence,
      }
    );
  }
}

export const neo4jHttpService = new Neo4jHttpService();
