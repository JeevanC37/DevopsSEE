import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  CheckCircle, ShieldCheck, Server, Box, Workflow, Activity, AlertCircle,
  RefreshCw, Clock, XCircle, AlertTriangle, Play, Loader2, Bug, Code,
  Shield, Database, Container, GitBranch, Terminal, Cpu, HardDrive
} from 'lucide-react';
import { Button } from './ui/button';

const HealthDashboard = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const res = await axios.get('/api/system-health');
      setHealthData(res.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Failed to fetch system health:", err);
      setError("Unable to connect to System Health API");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(false), 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [fetchData]);

  // Helper Functions
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-300';
    const s = status.toString().toUpperCase();
    
    if (['SUCCESS', 'PASSED', 'OK', 'HEALTHY', 'TRUE', 'READY', 'RUNNING'].some(x => s.includes(x))) {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    if (['FAIL', 'ERROR', 'CRITICAL', 'FALSE', 'VULNERABILITIES_FOUND'].some(x => s.includes(x))) {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    if (['BUILDING', 'IN_PROGRESS', 'PENDING', 'WARNING', 'UNKNOWN'].some(x => s.includes(x))) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  const getStatusIcon = (status) => {
    if (!status) return <AlertCircle className="w-5 h-5" />;
    const s = status.toString().toUpperCase();
    
    if (['SUCCESS', 'PASSED', 'OK', 'HEALTHY'].some(x => s.includes(x))) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (['FAIL', 'ERROR', 'CRITICAL'].some(x => s.includes(x))) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
    if (s.includes('BUILDING') || s.includes('PROGRESS')) {
      return <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />;
    }
    return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
  };

  const formatDuration = (ms) => {
    if (!ms || ms === 0) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${seconds}s`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600 flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span>Loading DevSecOps Pipeline Status...</span>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle className="w-6 h-6" />
          <div>
            <p className="font-semibold">{error}</p>
            <p className="text-sm mt-1">Please ensure the Backend server is running on port 5000.</p>
          </div>
        </div>
        <Button onClick={() => fetchData(true)} className="mt-4" variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
        </Button>
      </div>
    );
  }

  const { jenkins, sonar, trivy, k8s, docker, ansible } = healthData || {};

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            DevSecOps Pipeline Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Real-time CI/CD Pipeline Status • Jenkins → SonarQube → Trivy → Docker → Kubernetes</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={() => fetchData(true)} disabled={refreshing} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Jenkins Status */}
        <Card className={`border-l-4 ${jenkins?.status === 'SUCCESS' ? 'border-l-green-600' : jenkins?.building ? 'border-l-yellow-500' : 'border-l-red-600'}`}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Workflow className="w-4 h-4" /> Jenkins Build
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(jenkins?.status)}
              <span className={`text-xl font-bold ${jenkins?.status === 'SUCCESS' ? 'text-green-600' : jenkins?.building ? 'text-yellow-600' : 'text-red-600'}`}>
                {jenkins?.status || 'Unknown'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{jenkins?.buildNumber || 'N/A'}</p>
          </CardContent>
        </Card>

        {/* SonarQube Status */}
        <Card className={`border-l-4 ${sonar?.status === 'OK' ? 'border-l-green-600' : 'border-l-red-600'}`}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Code className="w-4 h-4" /> Quality Gate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(sonar?.status)}
              <span className={`text-xl font-bold ${sonar?.status === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
                {sonar?.gateStatus || sonar?.status || 'Unknown'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">SonarQube Analysis</p>
          </CardContent>
        </Card>

        {/* Trivy Status */}
        <Card className={`border-l-4 ${trivy?.scanStatus === 'PASSED' ? 'border-l-green-600' : trivy?.scanStatus === 'No Scan Data' ? 'border-l-gray-400' : 'border-l-red-600'}`}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Trivy Scan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(trivy?.scanStatus)}
              <span className={`text-xl font-bold ${trivy?.scanStatus === 'PASSED' ? 'text-green-600' : trivy?.scanStatus === 'No Scan Data' ? 'text-gray-500' : 'text-red-600'}`}>
                {trivy?.scanStatus === 'PASSED' ? 'Secure' : trivy?.scanStatus === 'No Scan Data' ? 'Pending' : 'Issues Found'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Container Security</p>
          </CardContent>
        </Card>

        {/* Kubernetes Status */}
        <Card className={`border-l-4 ${k8s?.clusterStatus === 'Healthy' ? 'border-l-green-600' : 'border-l-yellow-500'}`}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Server className="w-4 h-4" /> Kubernetes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(k8s?.clusterStatus)}
              <span className={`text-xl font-bold ${k8s?.clusterStatus === 'Healthy' ? 'text-green-600' : 'text-yellow-600'}`}>
                {k8s?.clusterStatus || 'Unknown'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{k8s?.readyNodes || 0}/{k8s?.totalNodes || 0} Nodes Ready</p>
          </CardContent>
        </Card>

        {/* Overall Pipeline Status */}
        <Card className={`border-l-4 ${
          jenkins?.status === 'SUCCESS' && sonar?.status === 'OK' && trivy?.scanStatus === 'PASSED'
            ? 'border-l-green-600 bg-green-50'
            : 'border-l-yellow-500 bg-yellow-50'
        }`}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" /> Pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {jenkins?.status === 'SUCCESS' && sonar?.status === 'OK' ? 
                <CheckCircle className="w-5 h-5 text-green-600" /> : 
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              }
              <span className={`text-xl font-bold ${
                jenkins?.status === 'SUCCESS' && sonar?.status === 'OK' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {jenkins?.status === 'SUCCESS' && sonar?.status === 'OK' ? 'Healthy' : 'Attention'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Overall Status</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tool Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ==================== JENKINS CARD ==================== */}
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Workflow className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Jenkins CI/CD</CardTitle>
                  <CardDescription>Build & Deployment Pipeline</CardDescription>
                </div>
              </div>
              <Badge className={getStatusColor(jenkins?.status)}>
                {jenkins?.building ? '🔄 Building...' : jenkins?.status || 'Unknown'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 flex items-center gap-1"><Terminal className="w-3 h-3" /> Build Number</p>
                <p className="font-bold text-gray-900 text-lg mt-1">{jenkins?.buildNumber || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" /> Duration</p>
                <p className="font-bold text-gray-900 text-lg mt-1">{formatDuration(jenkins?.duration)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                <p className="text-xs text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" /> Last Build Time</p>
                <p className="font-semibold text-gray-900 mt-1">{formatTime(jenkins?.timestamp)}</p>
              </div>
            </div>
            {jenkins?.building && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
                <span className="text-yellow-800 font-medium">Build in progress...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ==================== SONARQUBE CARD ==================== */}
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-teal-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center">
                  <Code className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">SonarQube</CardTitle>
                  <CardDescription>Static Code Analysis (SAST)</CardDescription>
                </div>
              </div>
              <Badge className={getStatusColor(sonar?.status)}>
                {sonar?.status === 'OK' ? '✅ Gate Passed' : sonar?.status === 'ERROR' ? '❌ Gate Failed' : sonar?.status || 'Unknown'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <Bug className="w-5 h-5 mx-auto text-red-500" />
                <p className="text-xs text-gray-600 mt-1">Bugs</p>
                <p className="font-bold text-2xl text-gray-900">{sonar?.metrics?.bugs || '0'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <Shield className="w-5 h-5 mx-auto text-orange-500" />
                <p className="text-xs text-gray-600 mt-1">Vulnerabilities</p>
                <p className="font-bold text-2xl text-gray-900">{sonar?.metrics?.vulnerabilities || '0'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <AlertTriangle className="w-5 h-5 mx-auto text-yellow-500" />
                <p className="text-xs text-gray-600 mt-1">Code Smells</p>
                <p className="font-bold text-2xl text-gray-900">{sonar?.metrics?.codeSmells || '0'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600">Coverage</p>
                <p className="font-bold text-lg text-blue-700">{sonar?.metrics?.coverage || 'N/A'}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-600">Duplications</p>
                <p className="font-bold text-lg text-purple-700">{sonar?.metrics?.duplications || 'N/A'}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600">Security Rating</p>
                <p className="font-bold text-lg text-green-700">{sonar?.metrics?.securityRating || 'N/A'}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <p className="text-xs text-gray-600">Lines of Code</p>
                <p className="font-bold text-lg text-indigo-700">{sonar?.metrics?.linesOfCode || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ==================== TRIVY SECURITY CARD ==================== */}
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Trivy Security Scan</CardTitle>
                  <CardDescription>Container Vulnerability Scanner</CardDescription>
                </div>
              </div>
              <Badge className={getStatusColor(trivy?.scanStatus)}>
                {trivy?.scanStatus === 'PASSED' ? '✅ No Critical Issues' : 
                 trivy?.scanStatus === 'No Scan Data' ? '⏳ Awaiting Scan' : 
                 '⚠️ Vulnerabilities Found'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-5 gap-2 mb-4">
              <div className="p-3 bg-red-100 rounded-lg text-center">
                <p className="text-xs text-red-800 font-medium">CRITICAL</p>
                <p className="font-bold text-2xl text-red-700">{trivy?.vulnerabilities?.critical || 0}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg text-center">
                <p className="text-xs text-orange-800 font-medium">HIGH</p>
                <p className="font-bold text-2xl text-orange-700">{trivy?.vulnerabilities?.high || 0}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg text-center">
                <p className="text-xs text-yellow-800 font-medium">MEDIUM</p>
                <p className="font-bold text-2xl text-yellow-700">{trivy?.vulnerabilities?.medium || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg text-center">
                <p className="text-xs text-blue-800 font-medium">LOW</p>
                <p className="font-bold text-2xl text-blue-700">{trivy?.vulnerabilities?.low || 0}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg text-center">
                <p className="text-xs text-gray-700 font-medium">UNKNOWN</p>
                <p className="font-bold text-2xl text-gray-600">{trivy?.vulnerabilities?.unknown || 0}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 flex items-center gap-1"><Container className="w-3 h-3" /> Image Scanned</p>
                <p className="font-semibold text-gray-900 mt-1 text-sm truncate">{trivy?.imageScanned || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" /> Last Scan</p>
                <p className="font-semibold text-gray-900 mt-1 text-sm">{trivy?.lastScan ? new Date(trivy.lastScan).toLocaleString() : 'Never'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ==================== KUBERNETES CARD ==================== */}
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Server className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Kubernetes Cluster</CardTitle>
                  <CardDescription>AWS EC2 • Kubeadm • Production</CardDescription>
                </div>
              </div>
              <Badge className={getStatusColor(k8s?.clusterStatus)}>
                {k8s?.clusterStatus === 'Healthy' ? '✅ All Nodes Ready' : k8s?.clusterStatus || 'Unknown'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <Server className="w-5 h-5 mx-auto text-purple-600" />
                <p className="text-xs text-gray-600 mt-1">Total Nodes</p>
                <p className="font-bold text-2xl text-gray-900">{k8s?.totalNodes || 0}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <CheckCircle className="w-5 h-5 mx-auto text-green-600" />
                <p className="text-xs text-gray-600 mt-1">Ready</p>
                <p className="font-bold text-2xl text-green-700">{k8s?.readyNodes || 0}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <Box className="w-5 h-5 mx-auto text-blue-600" />
                <p className="text-xs text-gray-600 mt-1">Pods</p>
                <p className="font-bold text-2xl text-blue-700">{k8s?.runningPods || 0}/{k8s?.totalPods || 0}</p>
              </div>
            </div>
            
            {/* Node Details */}
            {k8s?.nodes && k8s.nodes.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Node Details:</p>
                {k8s.nodes.map((node, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {node.isReady ? 
                        <CheckCircle className="w-4 h-4 text-green-600" /> : 
                        <XCircle className="w-4 h-4 text-red-600" />
                      }
                      <div>
                        <p className="font-semibold text-gray-900">{node.name}</p>
                        <p className="text-xs text-gray-500">{node.roles || 'worker'} • {node.kubeletVersion}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <p className="flex items-center gap-1"><Cpu className="w-3 h-3" /> {node.cpu} CPU</p>
                      <p className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {node.memory}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Docker & Ansible Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Docker */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Box className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Docker Registry</CardTitle>
                <CardDescription>Container Images on Docker Hub</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {docker?.images?.map((img, idx) => (
                <div key={idx} className="p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                  <Container className="w-4 h-4 text-blue-600" />
                  <code className="text-sm text-blue-800">{img}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ansible */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Ansible Automation</CardTitle>
                <CardDescription>Infrastructure as Code Playbooks</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ansible?.playbooks?.map((pb, idx) => (
                <div key={idx} className="p-3 bg-red-50 rounded-lg flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-red-600" />
                  <code className="text-sm text-red-800">{pb}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Flow Diagram */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" /> CI/CD Pipeline Flow
          </CardTitle>
          <CardDescription>Automated workflow triggered on every Git push</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
            {[
              { icon: <GitBranch className="w-6 h-6" />, label: 'GitHub Push', status: 'success' },
              { icon: <Workflow className="w-6 h-6" />, label: 'Jenkins', status: jenkins?.status === 'SUCCESS' ? 'success' : jenkins?.building ? 'building' : 'error' },
              { icon: <Code className="w-6 h-6" />, label: 'SonarQube', status: sonar?.status === 'OK' ? 'success' : sonar?.status === 'ERROR' ? 'error' : 'pending' },
              { icon: <ShieldCheck className="w-6 h-6" />, label: 'Trivy Scan', status: trivy?.scanStatus === 'PASSED' ? 'success' : trivy?.scanStatus === 'No Scan Data' ? 'pending' : 'warning' },
              { icon: <Box className="w-6 h-6" />, label: 'Docker Build', status: 'success' },
              { icon: <Play className="w-6 h-6" />, label: 'Ansible Deploy', status: 'success' },
              { icon: <Server className="w-6 h-6" />, label: 'Kubernetes', status: k8s?.clusterStatus === 'Healthy' ? 'success' : 'warning' },
            ].map((step, idx) => (
              <React.Fragment key={idx}>
                <div className={`flex flex-col items-center p-3 rounded-lg ${
                  step.status === 'success' ? 'bg-green-100' : 
                  step.status === 'building' ? 'bg-yellow-100' : 
                  step.status === 'error' ? 'bg-red-100' : 
                  step.status === 'warning' ? 'bg-orange-100' : 'bg-gray-200'
                }`}>
                  <div className={`${
                    step.status === 'success' ? 'text-green-600' : 
                    step.status === 'building' ? 'text-yellow-600' : 
                    step.status === 'error' ? 'text-red-600' : 
                    step.status === 'warning' ? 'text-orange-600' : 'text-gray-500'
                  }`}>
                    {step.icon}
                  </div>
                  <span className="text-xs font-medium mt-1">{step.label}</span>
                </div>
                {idx < 6 && <span className="text-gray-400 text-2xl hidden md:block">→</span>}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthDashboard;
