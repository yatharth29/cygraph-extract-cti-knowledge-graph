"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Database, Key, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SettingsPage() {
  const [config, setConfig] = useState({
    neo4jUri: "",
    neo4jUsername: "",
    neo4jPassword: "",
    geminiApiKey: "",
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    // Load saved configuration from localStorage
    const savedConfig = localStorage.getItem("cygraph-config");
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem("cygraph-config", JSON.stringify(config));
      
      // Test connection
      const response = await fetch("/api/neo4j/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uri: config.neo4jUri,
          username: config.neo4jUsername,
          password: config.neo4jPassword,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("Configuration saved and Neo4j connection verified!");
      } else {
        toast.warning("Configuration saved, but couldn't verify Neo4j connection.");
      }
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const response = await fetch("/api/neo4j/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uri: config.neo4jUri,
          username: config.neo4jUsername,
          password: config.neo4jPassword,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Connected successfully! Neo4j version: ${result.version}`);
      } else {
        toast.error(`Connection failed: ${result.error}`);
      }
    } catch (error) {
      toast.error("Failed to test connection");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Configuration Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Configure Neo4j database and AI model credentials
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Neo4j Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-600" />
                <CardTitle>Neo4j Database</CardTitle>
              </div>
              <CardDescription>
                Connect to your Neo4j Aura instance for persistent graph storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="neo4j-uri">Connection URI</Label>
                <Input
                  id="neo4j-uri"
                  placeholder="neo4j+s://xxxxx.databases.neo4j.io"
                  value={config.neo4jUri}
                  onChange={(e) => setConfig({ ...config, neo4jUri: e.target.value })}
                />
                <p className="text-xs text-slate-500">
                  Format: neo4j+s://your-instance.databases.neo4j.io
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="neo4j-username">Username</Label>
                <Input
                  id="neo4j-username"
                  placeholder="neo4j"
                  value={config.neo4jUsername}
                  onChange={(e) => setConfig({ ...config, neo4jUsername: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neo4j-password">Password</Label>
                <Input
                  id="neo4j-password"
                  type="password"
                  placeholder="Enter your Neo4j password"
                  value={config.neo4jPassword}
                  onChange={(e) => setConfig({ ...config, neo4jPassword: e.target.value })}
                />
              </div>

              <Button 
                onClick={handleTest} 
                variant="outline" 
                disabled={testing || !config.neo4jUri}
                className="w-full"
              >
                {testing ? "Testing..." : "Test Connection"}
              </Button>
            </CardContent>
          </Card>

          {/* Gemini Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-green-600" />
                <CardTitle>Google Gemini API</CardTitle>
              </div>
              <CardDescription>
                API key for AI-powered relation extraction using Gemini models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gemini-key">API Key</Label>
                <Input
                  id="gemini-key"
                  type="password"
                  placeholder="AIza..."
                  value={config.geminiApiKey}
                  onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
                />
                <p className="text-xs text-slate-500">
                  Get your API key from{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-amber-900 dark:text-amber-100">
                  Security Notice
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Credentials are stored locally in your browser. For production use, configure
                environment variables on your server instead.
              </p>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full"
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </div>
    </div>
  );
}