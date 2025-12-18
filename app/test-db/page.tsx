"use client";

import { db } from "@/lib/instantdb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function TestDBPage() {
  const [testResult, setTestResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Test db.useQuery - this is how the app uses InstantDB
  const { data, isLoading, error } = db.useQuery({
    users: {},
  });

  const testDirectQuery = async () => {
    setLoading(true);
    try {
      const result = await fetch("/api/debug-env");
      const envData = await result.json();
      setTestResult(JSON.stringify(envData, null, 2));
    } catch (err) {
      setTestResult(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">InstantDB Test Page</h1>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testDirectQuery} disabled={loading}>
            {loading ? "Checking..." : "Check Environment Variables"}
          </Button>
          {testResult && (
            <pre className="bg-muted p-4 rounded-md overflow-auto">
              {testResult}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>db.useQuery Test (Client-Side)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p>Loading users...</p>}
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
              <p className="font-bold">Error:</p>
              <pre className="text-sm overflow-auto">{JSON.stringify(error, null, 2)}</pre>
            </div>
          )}
          {data && (
            <div className="bg-muted p-4 rounded-md">
              <p className="font-bold mb-2">Users in Database:</p>
              <pre className="text-sm overflow-auto">{JSON.stringify(data.users, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Client-Side APP_ID</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-sm">
            {process.env.NEXT_PUBLIC_INSTANT_APP_ID || "NOT SET ❌"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

