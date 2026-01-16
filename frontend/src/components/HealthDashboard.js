import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, ShieldCheck, Server, Box, Workflow, Activity, AlertCircle } from 'lucide-react';

const HealthDashboard = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/system-health');
        setHealthData(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch system health:", err);
        setError("Unable to connect to System Health API");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const iconMap = {
    'check-circle': CheckCircle,
    'shield-check': ShieldCheck,
    'server': Server,
    'box': Box,
    'workflow': Workflow,
    'activity': Activity
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-300';
    const statusLower = status.toString().toLowerCase();
    
    if (statusLower.includes('pass') || statusLower.includes('success') || statusLower.includes('ok') || statusLower.includes('ready') || statusLower === 'true') {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    if (statusLower.includes('fail') || statusLower.includes('error') || statusLower === 'false') {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600 flex items-center gap-2">
          <Activity className="animate-spin" /> Loading System Health...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
        <AlertCircle /> {error}. Please ensure the Backend is running.
      </div>
    );
  }

  const tools = [
    {
      name: 'Jenkins CI',
      icon: 'workflow',
      description: 'Build Pipeline',
      status: healthData?.jenkins?.status === 'SUCCESS' ? 'Pipeline Passed' : 'Building / Failed',
      metrics: {
        lastBuild: healthData?.jenkins?.status || 'Unknown',
        duration: healthData?.jenkins?.duration ? `${(healthData.jenkins.duration / 1000).toFixed(1)}s` : 'N/A'
      }
    },
    {
      name: 'SonarQube',
      icon: 'check-circle',
      description: 'Code Quality Gate',
      status: healthData?.sonar?.status === 'OK' ? 'Quality Gate Passed' : 'Gate Failed',
      metrics: {
        gateStatus: healthData?.sonar?.status || 'Unknown',
        analysisMode: 'Static Analysis'
      }
    },
    {
      name: 'Docker & Trivy',
      icon: 'box',
      description: 'Container Security',
      status: 'Active', 
      metrics: {
        imageTag: 'latest',
        scanStatus: 'Report Available'
      }
    },
    {
      name: 'Kubernetes Cluster',
      icon: 'server',
      description: 'Production Environment',
      status: healthData?.k8s?.every(n => n.status === 'True') ? 'Healthy' : 'Degraded',
      metrics: {
        nodesOnline: `${healthData?.k8s?.filter(n => n.status === 'True').length} / ${healthData?.k8s?.length}`,
        clusterType: 'AWS / Kubeadm'
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Health Dashboard</h1>
        <p className="text-gray-600 mt-1">Real-time DevSecOps CI/CD Pipeline Status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2"><Activity className="w-4 h-4" /> System Status</CardDescription>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">Operational</div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2"><Box className="w-4 h-4" /> Build Version</CardDescription>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">v1.2.0</div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-600">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2"><Server className="w-4 h-4" /> Environment</CardDescription>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-purple-600">Production (K8s)</div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-600">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2"><Activity className="w-4 h-4" /> Live Nodes</CardDescription>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-orange-600">{healthData?.k8s?.length || 0} Nodes</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>DevOps Tools Status</CardTitle>
          <CardDescription>Live data fetched from Jenkins, SonarQube, and Kubernetes APIs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((tool) => {
              const Icon = iconMap[tool.icon] || Activity;
              return (
                <Card key={tool.name} className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          <CardDescription>{tool.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(tool.status)}>{tool.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(tool.metrics).map(([key, value]) => (
                        <div key={key} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' ').trim()}</p>
                          <p className="font-semibold text-gray-900 mt-1">{value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default HealthDashboard;
