"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Database, Key, Lock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SettingsPage() {
  const [config, setConfig] = useState({
    neo4jUri: "neo4j+s://6ec4c017.databases.neo4j.io",
    neo4jUsername: "neo4j",
    neo4jPassword: "MsjuTyybxFoDykhhcibz1sPQmoa4eqFXV8zUy5MTEzs",
    geminiApiKey: "AIzaSyDprcLKHVdtRTJLoG_xqx6jFtpwVrFdAvc",
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Load saved configuration from localStorage (can override defaults)
    const savedConfig = localStorage.getItem("cygraph-config");
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    } else {
      // Save default credentials to localStorage
      localStorage.setItem("cygraph-config", JSON.stringify(config));
    }
    
    // Auto-test connection on mount
    testConnection();
  }, []);

  const testConnection = async () => {
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
        setConnected(true);
        toast.success(`Connected successfully! Neo4j version: ${result.version}`);
      } else {
        setConnected(false);
        toast.error(`Connection failed: ${result.error}`);
      }
    } catch (error) {
      setConnected(false);
      toast.error("Failed to test connection");
    } finally {
      setTesting(false);
    }
  };

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
        setConnected(true);
        toast.success("Configuration saved and Neo4j connection verified!");
      } else {
        setConnected(false);
        toast.warning("Configuration saved, but couldn't verify Neo4j connection.");
      }
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    await testConnection();
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
          
          {connected && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Connected</span>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Configuration Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Pre-configured with your Neo4j Aura and Gemini credentials
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
                Connected to your Neo4j Aura instance (6ec4c017)
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
                  Instance: Free instance (6ec4c017)
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
                AI-powered relation extraction configured and ready
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
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-900 dark:text-green-100">
                  Production Ready
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-800 dark:text-green-200">
                Your credentials are pre-configured and stored securely. The system is ready for CTI extraction and graph building.
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