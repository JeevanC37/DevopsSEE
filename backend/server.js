const express = require('express');
const cors = require('cors');
const axios = require('axios');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- Configuration (Set these via environment variables) ---
const JENKINS_URL = process.env.JENKINS_URL || 'http://localhost:8080';
const JENKINS_USER = process.env.JENKINS_USER || 'admin';
const JENKINS_TOKEN = process.env.JENKINS_TOKEN || '';
const JENKINS_JOB_NAME = process.env.JENKINS_JOB_NAME || 'DevopsSEE';

const SONAR_URL = process.env.SONAR_URL || 'http://localhost:9000';
const SONAR_TOKEN = process.env.SONAR_TOKEN || '';
const SONAR_PROJECT_KEY = process.env.SONAR_PROJECT_KEY || 'banking-app';

// --- In-Memory Storage for Trivy Data ---
let trivyData = {
    lastScan: null,
    vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0, unknown: 0 },
    scanStatus: 'No Scan Data',
    imageScanned: 'N/A',
    results: []
};

// --- Trivy Webhook Endpoint (Receives data from Jenkins Pipeline) ---
app.post('/api/trivy-webhook', (req, res) => {
    try {
        console.log('[Trivy Webhook] Received scan results');
        const report = req.body;
        
        // Parse Trivy JSON report
        const vulnCounts = { critical: 0, high: 0, medium: 0, low: 0, unknown: 0 };
        let imageName = 'Unknown';
        
        if (report && report.Results) {
            report.Results.forEach(result => {
                if (result.Vulnerabilities) {
                    result.Vulnerabilities.forEach(vuln => {
                        const severity = (vuln.Severity || 'UNKNOWN').toLowerCase();
                        if (vulnCounts.hasOwnProperty(severity)) {
                            vulnCounts[severity]++;
                        } else {
                            vulnCounts.unknown++;
                        }
                    });
                }
            });
        }
        
        if (report && report.ArtifactName) {
            imageName = report.ArtifactName;
        }
        
        const hasIssues = vulnCounts.critical > 0 || vulnCounts.high > 0;
        
        trivyData = {
            lastScan: new Date().toISOString(),
            vulnerabilities: vulnCounts,
            scanStatus: hasIssues ? 'VULNERABILITIES_FOUND' : 'PASSED',
            imageScanned: imageName,
            results: report.Results || []
        };
        
        // Optionally save to file for persistence (non-critical)
        try {
            fs.writeFileSync(
                path.join(__dirname, 'trivy-latest.json'), 
                JSON.stringify(trivyData, null, 2)
            );
        } catch (fsError) {
            console.warn('[Trivy Webhook] Could not persist to file:', fsError.message);
        }
        
        console.log('[Trivy Webhook] Processed:', vulnCounts);
        res.json({ success: true, message: 'Trivy data received', summary: vulnCounts });
    } catch (error) {
        console.error('[Trivy Webhook] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// --- Load persisted Trivy data on startup ---
try {
    const trivyFile = path.join(__dirname, 'trivy-latest.json');
    if (fs.existsSync(trivyFile)) {
        trivyData = JSON.parse(fs.readFileSync(trivyFile, 'utf8'));
        console.log('[Startup] Loaded persisted Trivy data');
    }
} catch (e) {
    console.log('[Startup] No persisted Trivy data found');
}

// --- Main System Health API ---
app.get('/api/system-health', async (req, res) => {
    try {
        const healthData = {
            timestamp: new Date().toISOString(),
            jenkins: { 
                status: 'UNKNOWN', 
                result: 'Unknown',
                duration: 0, 
                buildNumber: 'N/A',
                timestamp: null,
                url: null,
                building: false
            },
            sonar: { 
                status: 'UNKNOWN', 
                gateStatus: 'Unknown',
                metrics: {
                    bugs: 'N/A',
                    vulnerabilities: 'N/A',
                    codeSmells: 'N/A',
                    coverage: 'N/A',
                    duplications: 'N/A'
                }
            },
            trivy: trivyData,
            k8s: {
                nodes: [],
                clusterStatus: 'Unknown',
                totalNodes: 0,
                readyNodes: 0
            },
            docker: {
                images: ['jeevanc370/banking-app:latest', 'jeevanc370/banking-backend:latest'],
                registry: 'Docker Hub'
            },
            ansible: {
                status: 'Configured',
                playbooks: ['docker.yaml', 'k8s.yaml', 'kube.yaml']
            }
        };

        // =====================================================
        // 1. JENKINS - Get Build Status
        // =====================================================
        try {
            const jenkinsAuth = {
                username: JENKINS_USER,
                password: JENKINS_TOKEN
            };
            
            // Get last build info
            const jenkinsRes = await axios.get(
                `${JENKINS_URL}/job/${JENKINS_JOB_NAME}/lastBuild/api/json`,
                { auth: jenkinsAuth, timeout: 5000 }
            );
            
            const build = jenkinsRes.data;
            healthData.jenkins = {
                status: build.result || (build.building ? 'BUILDING' : 'UNKNOWN'),
                result: build.result || 'IN_PROGRESS',
                duration: build.duration || 0,
                estimatedDuration: build.estimatedDuration || 0,
                buildNumber: `#${build.number}`,
                timestamp: build.timestamp ? new Date(build.timestamp).toISOString() : null,
                url: build.url,
                building: build.building || false,
                displayName: build.displayName || `Build #${build.number}`
            };
            
        } catch (e) {
            console.error('[Jenkins API Error]:', e.message);
            healthData.jenkins.error = e.message;
        }

        // =====================================================
        // 2. SONARQUBE - Get Quality Gate & Metrics
        // =====================================================
        try {
            const sonarAuth = {
                username: SONAR_TOKEN,
                password: ''
            };
            
            // Get Quality Gate Status
            const gateRes = await axios.get(
                `${SONAR_URL}/api/qualitygates/project_status?projectKey=${SONAR_PROJECT_KEY}`,
                { auth: sonarAuth, timeout: 5000 }
            );
            
            const gateStatus = gateRes.data.projectStatus;
            healthData.sonar.status = gateStatus.status; // OK or ERROR
            healthData.sonar.gateStatus = gateStatus.status === 'OK' ? 'Passed' : 'Failed';
            
            // Get detailed metrics
            try {
                const metricsRes = await axios.get(
                    `${SONAR_URL}/api/measures/component?component=${SONAR_PROJECT_KEY}&metricKeys=bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,ncloc,security_rating,reliability_rating`,
                    { auth: sonarAuth, timeout: 5000 }
                );
                
                const measures = metricsRes.data.component?.measures || [];
                const metricsMap = {};
                measures.forEach(m => {
                    metricsMap[m.metric] = m.value;
                });
                
                healthData.sonar.metrics = {
                    bugs: metricsMap.bugs || '0',
                    vulnerabilities: metricsMap.vulnerabilities || '0',
                    codeSmells: metricsMap.code_smells || '0',
                    coverage: metricsMap.coverage ? `${parseFloat(metricsMap.coverage).toFixed(1)}%` : 'N/A',
                    duplications: metricsMap.duplicated_lines_density ? `${parseFloat(metricsMap.duplicated_lines_density).toFixed(1)}%` : 'N/A',
                    linesOfCode: metricsMap.ncloc || 'N/A',
                    securityRating: getRating(metricsMap.security_rating),
                    reliabilityRating: getRating(metricsMap.reliability_rating)
                };
            } catch (metricsError) {
                console.error('[SonarQube Metrics Error]:', metricsError.message);
            }
            
        } catch (e) {
            console.error('[SonarQube API Error]:', e.message);
            healthData.sonar.error = e.message;
        }

        // =====================================================
        // 3. KUBERNETES - Get Cluster & Node Status
        // =====================================================
        try {
            const kc = new k8s.KubeConfig();
            
            // Handle both in-cluster and local development environments
            try {
                kc.loadFromCluster(); // Try in-cluster config first (when running inside K8s pod)
            } catch (clusterErr) {
                try {
                    kc.loadFromDefault(); // Fall back to kubeconfig file (local development)
                } catch (defaultErr) {
                    throw new Error('Unable to load Kubernetes config - neither in-cluster nor kubeconfig available');
                }
            }
            
            const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
            
            // Get Nodes
            const nodeRes = await k8sApi.listNode();
            const nodes = nodeRes.body.items.map(node => {
                const readyCondition = node.status.conditions.find(c => c.type === 'Ready');
                return {
                    name: node.metadata.name,
                    status: readyCondition?.status || 'Unknown',
                    isReady: readyCondition?.status === 'True',
                    roles: Object.keys(node.metadata.labels || {})
                        .filter(l => l.startsWith('node-role.kubernetes.io/'))
                        .map(l => l.replace('node-role.kubernetes.io/', ''))
                        .join(', ') || 'worker',
                    kubeletVersion: node.status.nodeInfo?.kubeletVersion || 'N/A',
                    os: node.status.nodeInfo?.osImage || 'N/A',
                    cpu: node.status.capacity?.cpu || 'N/A',
                    memory: node.status.capacity?.memory || 'N/A'
                };
            });
            
            const readyNodes = nodes.filter(n => n.isReady).length;
            
            healthData.k8s = {
                nodes: nodes,
                clusterStatus: readyNodes === nodes.length ? 'Healthy' : 'Degraded',
                totalNodes: nodes.length,
                readyNodes: readyNodes
            };
            
            // Get Pods in default namespace
            try {
                const podRes = await k8sApi.listNamespacedPod('default');
                const pods = podRes.body.items.map(pod => ({
                    name: pod.metadata.name,
                    status: pod.status.phase,
                    ready: pod.status.containerStatuses?.every(c => c.ready) || false
                }));
                healthData.k8s.pods = pods;
                healthData.k8s.totalPods = pods.length;
                healthData.k8s.runningPods = pods.filter(p => p.status === 'Running').length;
            } catch (podError) {
                console.log('[K8s Pods]:', podError.message);
            }
            
        } catch (e) {
            console.error('[Kubernetes API Error]:', e.message);
            healthData.k8s.error = e.message;
        }

        res.json(healthData);
        
    } catch (error) {
        console.error('[System Health API Error]:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- Get Trivy Details Endpoint ---
app.get('/api/trivy-details', (req, res) => {
    res.json(trivyData);
});

// --- Health Check Endpoint ---
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'DevSecOps Backend',
        timestamp: new Date().toISOString()
    });
});

// --- Helper Functions ---
function getRating(value) {
    const ratings = { '1.0': 'A', '2.0': 'B', '3.0': 'C', '4.0': 'D', '5.0': 'E' };
    return ratings[value] || value || 'N/A';
}

// --- Start Server ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║       DevSecOps Backend Server Started                     ║
╠════════════════════════════════════════════════════════════╣
║  Port: ${PORT}                                               ║
║  Endpoints:                                                ║
║    GET  /api/health         - Service health check         ║
║    GET  /api/system-health  - Full pipeline status         ║
║    GET  /api/trivy-details  - Trivy scan details           ║
║    POST /api/trivy-webhook  - Receive Trivy reports        ║
╠════════════════════════════════════════════════════════════╣
║  Environment Variables Required:                           ║
║    JENKINS_URL, JENKINS_USER, JENKINS_TOKEN                ║
║    SONAR_URL, SONAR_TOKEN                                  ║
║    (K8s uses default kubeconfig)                           ║
╚════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
