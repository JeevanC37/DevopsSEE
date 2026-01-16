const axios = require('axios');
const k8s = require('@kubernetes/client-node');

// --- Configuration ---
const JENKINS_URL = process.env.JENKINS_URL || 'http://<JENKINS_IP>:8080';
const JENKINS_USER = process.env.JENKINS_USER || 'admin';
const JENKINS_TOKEN = process.env.JENKINS_TOKEN; // API Token from Jenkins User Config

const SONAR_URL = process.env.SONAR_URL || 'http://<SONAR_IP>:9000';
const SONAR_TOKEN = process.env.SONAR_TOKEN;

// --- API Route ---
app.get('/api/system-health', async (req, res) => {
    try {
        const healthData = {
            jenkins: { status: 'Unknown', duration: 0 },
            sonar: { status: 'Unknown', gate: 'Unknown' },
            k8s: [],
            trivy: 'No Data' 
        };

        // 1. Get Jenkins Status
        try {
            const jenkinsRes = await axios.get(`${JENKINS_URL}/job/DevopsSEE/lastBuild/api/json`, {
                auth: { username: JENKINS_USER, password: JENKINS_TOKEN }
            });
            healthData.jenkins.status = jenkinsRes.data.result;
            healthData.jenkins.duration = jenkinsRes.data.duration;
        } catch (e) { console.error("Jenkins Error:", e.message); }

        // 2. Get SonarQube Status
        try {
            const sonarRes = await axios.get(`${SONAR_URL}/api/qualitygates/project_status?projectKey=banking-app`, {
                auth: { username: SONAR_TOKEN, password: '' }
            });
            healthData.sonar.status = sonarRes.data.projectStatus.status; // OK or ERROR
        } catch (e) { console.error("Sonar Error:", e.message); }

        // 3. Get K8s Nodes
        try {
            const kc = new k8s.KubeConfig();
            kc.loadFromDefault(); 
            const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
            const nodeRes = await k8sApi.listNode();
            healthData.k8s = nodeRes.body.items.map(node => ({
                name: node.metadata.name,
                status: node.status.conditions.find(c => c.type === 'Ready').status
            }));
        } catch (e) { console.error("K8s Error:", e.message); }

        res.json(healthData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});