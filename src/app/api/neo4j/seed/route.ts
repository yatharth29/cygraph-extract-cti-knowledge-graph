import { NextRequest, NextResponse } from "next/server";
import { neo4jService } from "@/lib/services/neo4j-service";

export async function POST(request: NextRequest) {
  try {
    const neo4jConfig = {
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

    neo4jService.connect(neo4jConfig);

    // Clear existing data
    await neo4jService.clearGraph();

    // Create comprehensive CTI sample data with proper entities and relationships
    const sampleData = `
      // Threat Actors
      CREATE (apt28:Entity {id: 'apt28', text: 'APT28', type: 'threat-actor', confidence: 0.98})
      CREATE (apt29:Entity {id: 'apt29', text: 'APT29', type: 'threat-actor', confidence: 0.97})
      CREATE (lazarus:Entity {id: 'lazarus', text: 'Lazarus Group', type: 'threat-actor', confidence: 0.99})
      
      // Malware
      CREATE (zebrocy:Entity {id: 'zebrocy', text: 'Zebrocy', type: 'malware', confidence: 0.96})
      CREATE (wannacry:Entity {id: 'wannacry', text: 'WannaCry', type: 'malware', confidence: 0.99})
      CREATE (emotet:Entity {id: 'emotet', text: 'Emotet', type: 'malware', confidence: 0.98})
      CREATE (cobalt:Entity {id: 'cobalt', text: 'Cobalt Strike', type: 'tool', confidence: 0.95})
      
      // Vulnerabilities
      CREATE (cve2017:Entity {id: 'cve-2017-0199', text: 'CVE-2017-0199', type: 'vulnerability', confidence: 0.99})
      CREATE (cve2017eternalblue:Entity {id: 'cve-2017-0144', text: 'CVE-2017-0144', type: 'vulnerability', confidence: 0.99})
      CREATE (cve2020:Entity {id: 'cve-2020-1472', text: 'CVE-2020-1472', type: 'vulnerability', confidence: 0.98})
      
      // Techniques (MITRE ATT&CK)
      CREATE (spearphish:Entity {id: 't1566.001', text: 'Spear Phishing', type: 'technique', confidence: 0.97})
      CREATE (powershell:Entity {id: 't1059.001', text: 'PowerShell Execution', type: 'technique', confidence: 0.96})
      CREATE (lateral:Entity {id: 't1021', text: 'Lateral Movement', type: 'technique', confidence: 0.95})
      
      // Indicators
      CREATE (ip1:Entity {id: 'ip-185.86.148.227', text: '185.86.148.227', type: 'indicator', confidence: 0.94})
      CREATE (domain1:Entity {id: 'domain-evil.com', text: 'evil-c2.com', type: 'indicator', confidence: 0.93})
      CREATE (hash1:Entity {id: 'hash-abc123', text: 'abc123def456...', type: 'indicator', confidence: 0.92})
      
      // Organizations/Targets
      CREATE (govt:Entity {id: 'govt-sector', text: 'Government Agencies', type: 'organization', confidence: 0.96})
      CREATE (finance:Entity {id: 'finance-sector', text: 'Financial Institutions', type: 'organization', confidence: 0.95})
      CREATE (healthcare:Entity {id: 'healthcare-sector', text: 'Healthcare', type: 'organization', confidence: 0.94})
      
      // Locations
      CREATE (russia:Entity {id: 'loc-russia', text: 'Russia', type: 'location', confidence: 0.98})
      CREATE (nkorea:Entity {id: 'loc-nkorea', text: 'North Korea', type: 'location', confidence: 0.97})
      CREATE (easteurope:Entity {id: 'loc-easteurope', text: 'Eastern Europe', type: 'location', confidence: 0.95})
      
      // Campaigns
      CREATE (operation1:Entity {id: 'op-apt28-2023', text: 'Operation GhostWriter', type: 'campaign', confidence: 0.96})
      CREATE (operation2:Entity {id: 'op-lazarus-2023', text: 'Operation DreamJob', type: 'campaign', confidence: 0.97})
      
      // RELATIONSHIPS - Following Entity->Relationship->Entity pattern
      
      // Threat Actor uses Malware
      CREATE (apt28)-[:RELATES {type: 'uses', confidence: 0.96}]->(zebrocy)
      CREATE (apt29)-[:RELATES {type: 'uses', confidence: 0.95}]->(cobalt)
      CREATE (lazarus)-[:RELATES {type: 'uses', confidence: 0.98}]->(wannacry)
      CREATE (lazarus)-[:RELATES {type: 'uses', confidence: 0.96}]->(emotet)
      
      // Threat Actor attributed to Location
      CREATE (apt28)-[:RELATES {type: 'attributed-to', confidence: 0.97}]->(russia)
      CREATE (apt29)-[:RELATES {type: 'attributed-to', confidence: 0.96}]->(russia)
      CREATE (lazarus)-[:RELATES {type: 'attributed-to', confidence: 0.98}]->(nkorea)
      
      // Threat Actor targets Organization
      CREATE (apt28)-[:RELATES {type: 'targets', confidence: 0.94}]->(govt)
      CREATE (apt29)-[:RELATES {type: 'targets', confidence: 0.95}]->(govt)
      CREATE (lazarus)-[:RELATES {type: 'targets', confidence: 0.96}]->(finance)
      CREATE (lazarus)-[:RELATES {type: 'targets', confidence: 0.93}]->(healthcare)
      
      // Threat Actor executes Campaign
      CREATE (apt28)-[:RELATES {type: 'executes', confidence: 0.95}]->(operation1)
      CREATE (lazarus)-[:RELATES {type: 'executes', confidence: 0.96}]->(operation2)
      
      // Malware exploits Vulnerability
      CREATE (zebrocy)-[:RELATES {type: 'exploits', confidence: 0.97}]->(cve2017)
      CREATE (wannacry)-[:RELATES {type: 'exploits', confidence: 0.99}]->(cve2017eternalblue)
      CREATE (emotet)-[:RELATES {type: 'exploits', confidence: 0.94}]->(cve2020)
      
      // Threat Actor leverages Technique
      CREATE (apt28)-[:RELATES {type: 'leverages', confidence: 0.96}]->(spearphish)
      CREATE (apt28)-[:RELATES {type: 'leverages', confidence: 0.95}]->(powershell)
      CREATE (lazarus)-[:RELATES {type: 'leverages', confidence: 0.94}]->(spearphish)
      CREATE (apt29)-[:RELATES {type: 'leverages', confidence: 0.96}]->(lateral)
      
      // Malware communicates to Indicator
      CREATE (zebrocy)-[:RELATES {type: 'communicates-to', confidence: 0.93}]->(ip1)
      CREATE (wannacry)-[:RELATES {type: 'communicates-to', confidence: 0.94}]->(domain1)
      CREATE (emotet)-[:RELATES {type: 'identified-by', confidence: 0.95}]->(hash1)
      
      // Campaign targets Location
      CREATE (operation1)-[:RELATES {type: 'targets', confidence: 0.92}]->(easteurope)
      CREATE (operation2)-[:RELATES {type: 'targets', confidence: 0.93}]->(finance)
      
      // Tool used in Technique
      CREATE (cobalt)-[:RELATES {type: 'implements', confidence: 0.94}]->(lateral)
      CREATE (cobalt)-[:RELATES {type: 'implements', confidence: 0.93}]->(powershell)
    `;

    await neo4jService.executeCypher(sampleData);
    await neo4jService.close();

    return NextResponse.json({
      success: true,
      message: "Sample CTI data seeded successfully",
      entities: 23,
      relationships: 27,
    });
  } catch (error: any) {
    console.error("Neo4j seed error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
