import React from 'react';
import { systemHealthData } from '../data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, ShieldCheck, Server, Box, Workflow, Activity } from 'lucide-react';

const SystemHealth = () => {
  const iconMap = {
    'check-circle': CheckCircle,
    'shield-check': ShieldCheck,
    'server': Server,
    'box': Box,
    'workflow': Workflow
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pass') || statusLower.includes('healthy') || statusLower.includes('success') || statusLower.includes('active')) {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Health Dashboard</h1>
        <p className="text-gray-600 mt-1">DevSecOps CI/CD Pipeline Status</p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              System Status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operational</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              Build Version
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{systemHealthData.buildVersion}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{systemHealthData.environment}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Last Build
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{systemHealthData.buildDate}</div>
          </CardContent>
        </Card>
      </div>

      {/* DevOps Tools Status */}
      <Card>
        <CardHeader>
          <CardTitle>DevOps Tools Status</CardTitle>
          <CardDescription>Real-time status of CI/CD pipeline components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemHealthData.tools.map((tool) => {
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
                      <Badge className={getStatusColor(tool.status)}>
                        {tool.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(tool.metrics).map(([key, value]) => (
                        <div key={key} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Quality Gate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Code Coverage:</span>
                <span className="font-semibold text-green-600">87%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bugs:</span>
                <span className="font-semibold text-green-600">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vulnerabilities:</span>
                <span className="font-semibold text-green-600">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              Security Scan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Critical:</span>
                <span className="font-semibold text-green-600">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">High:</span>
                <span className="font-semibold text-green-600">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Medium:</span>
                <span className="font-semibold text-green-600">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="w-5 h-5 text-green-600" />
              Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Pods Running:</span>
                <span className="font-semibold text-green-600">3/3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nodes Ready:</span>
                <span className="font-semibold text-green-600">2/2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime:</span>
                <span className="font-semibold text-green-600">15 days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemHealth;