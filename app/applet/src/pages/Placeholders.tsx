import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export const Dashboard = () => {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-6">Global Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground-secondary">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground-secondary">Active Experts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-ai">8</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground-secondary">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-warning">24</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      <Card>
        <div className="rounded-md border-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-elevated text-foreground-secondary">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-lg">Project</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Updated</th>
                <th className="px-4 py-3 font-medium rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-elevated/50 transition-colors">
                <td className="px-4 py-3 font-medium">Alpha Tower</td>
                <td className="px-4 py-3"><Badge variant="warning">Review Pending</Badge></td>
                <td className="px-4 py-3 text-foreground-muted">2 hours ago</td>
                <td className="px-4 py-3"><button className="text-brand hover:underline">View</button></td>
              </tr>
              <tr className="hover:bg-elevated/50 transition-colors">
                <td className="px-4 py-3 font-medium">Beta Complex</td>
                <td className="px-4 py-3"><Badge variant="success">Completed</Badge></td>
                <td className="px-4 py-3 text-foreground-muted">5 hours ago</td>
                <td className="px-4 py-3"><button className="text-brand hover:underline">View</button></td>
              </tr>
              <tr className="hover:bg-elevated/50 transition-colors">
                <td className="px-4 py-3 font-medium">Gamma Factory</td>
                <td className="px-4 py-3"><Badge variant="ai">Analyzing</Badge></td>
                <td className="px-4 py-3 text-foreground-muted">1 day ago</td>
                <td className="px-4 py-3"><button className="text-brand hover:underline">View</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export const Projects = () => {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <button className="px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand/90 transition-colors">
          New Project
        </button>
      </div>
      <div className="bg-surface border border-border rounded-lg shadow-sm p-8 text-center text-foreground-muted">
        [Enterprise Data Grid Placeholder]
      </div>
    </div>
  );
};

export const Admin = () => {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-6">Administration</h1>
      <div className="bg-surface border border-border rounded-lg shadow-sm p-8 text-center text-foreground-muted">
        [System Health & Logs Placeholder]
      </div>
    </div>
  );
};

export const Settings = () => {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      <div className="bg-surface border border-border rounded-lg shadow-sm p-8 text-center text-foreground-muted">
        [Organization Settings Placeholder]
      </div>
    </div>
  );
};
