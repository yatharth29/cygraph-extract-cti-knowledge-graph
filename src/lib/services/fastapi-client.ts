// FastAPI Backend Integration Client
// This service handles all communication with the FastAPI backend

export interface CTIProcessingRequest {
  text: string;
  options?: {
    confidence_threshold?: number;
    extract_iocs?: boolean;
    use_ontology?: boolean;
  };
}

export interface Entity {
  id: string;
  text: string;
  type: string;
  confidence: number;
  start: number;
  end: number;
  attributes?: Record<string, any>;
}

export interface Relation {
  id: string;
  source: string;
  target: string;
  relation: string;
  confidence: number;
}

export interface CTIProcessingResponse {
  success: boolean;
  entities: Entity[];
  relations: Relation[];
  graph: {
    nodes: any[];
    edges: any[];
  };
  metadata: {
    processing_time: number;
    model_version: string;
    confidence_threshold: number;
    text_length: number;
  };
}

export interface GraphQueryRequest {
  filter?: string;
  limit?: number;
  search?: string;
}

export interface GraphQueryResponse {
  success: boolean;
  data: {
    nodes: any[];
    edges: any[];
  };
  metadata: {
    total_nodes: number;
    total_edges: number;
    filter_applied?: string;
  };
}

class FastAPIClient {
  private baseURL: string;

  constructor() {
    // Use deployed backend URL or environment variable
    this.baseURL = process.env.NEXT_PUBLIC_FASTAPI_URL || "https://cygraph-extract-cti-knowledge-graph.onrender.com";
  }

  /**
   * Process CTI text through the FastAPI backend
   */
  async processCTI(request: CTIProcessingRequest): Promise<CTIProcessingResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/extract`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error processing CTI:", error);
      throw error;
    }
  }

  /**
   * Query the Neo4j knowledge graph
   */
  async queryGraph(request: GraphQueryRequest): Promise<GraphQueryResponse> {
    try {
      const params = new URLSearchParams();
      if (request.filter) params.append("filter", request.filter);
      if (request.limit) params.append("limit", request.limit.toString());
      if (request.search) params.append("search", request.search);

      const response = await fetch(`${this.baseURL}/api/graph?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error querying graph:", error);
      throw error;
    }
  }

  /**
   * Get NER model information
   */
  async getModelInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/model/info`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting model info:", error);
      throw error;
    }
  }

  /**
   * Upload ontology file (OWL format)
   */
  async uploadOntology(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${this.baseURL}/api/ontology/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error uploading ontology:", error);
      throw error;
    }
  }

  /**
   * Get current ontology structure
   */
  async getOntology(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/ontology`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting ontology:", error);
      throw error;
    }
  }

  /**
   * Submit feedback for self-correcting pipeline
   */
  async submitFeedback(feedback: {
    extraction_id: string;
    corrections: Array<{
      entity_id: string;
      correct_type?: string;
      correct_text?: string;
      should_delete?: boolean;
    }>;
  }): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      throw error;
    }
  }

  /**
   * Get system health metrics
   */
  async getHealthMetrics(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting health metrics:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const fastapiClient = new FastAPIClient();