# DevSecOps Health Dashboard - Setup Guide

## Overview

The Health Dashboard provides **real-time visibility** into your CI/CD pipeline status, displaying live data from:

- **Jenkins** - Build status, duration, build number
- **SonarQube** - Quality gate, bugs, vulnerabilities, code smells, coverage
- **Trivy** - Container vulnerability scan results (CRITICAL, HIGH, MEDIUM, LOW)
- **Kubernetes** - Cluster health, node status, pod counts
- **Docker** - Container registry images
- **Ansible** - Automation playbooks

---

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐
│   GitHub    │───▶│   Jenkins   │───▶│ SonarQube (SAST)        │
│   (Push)    │    │   Pipeline  │    │ Trivy (Container Scan)  │
└─────────────┘    └──────┬──────┘    └───────────┬─────────────┘
                          │                       │
                          ▼                       ▼
                   ┌─────────────┐    ┌─────────────────────────┐
                   │   Docker    │───▶│   Kubernetes Cluster    │
                   │   Hub       │    │   (AWS EC2 Nodes)       │
                   └─────────────┘    └───────────┬─────────────┘
                                                  │
                          ┌───────────────────────┘
                          ▼
              ┌───────────────────────────────────────────┐
              │         Backend API (Node.js)             │
              │  GET  /api/system-health                  │
              │  POST /api/trivy-webhook                  │
              └─────────────────────┬─────────────────────┘
                                    │
                                    ▼
              ┌───────────────────────────────────────────┐
              │         Frontend Dashboard (React)        │
              │         Real-time Pipeline Visualization  │
              └───────────────────────────────────────────┘
```

---

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit with your actual values
nano .env
```

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `JENKINS_URL` | Jenkins server URL | `http://10.0.0.5:8080` |
| `JENKINS_USER` | Jenkins username | `admin` |
| `JENKINS_TOKEN` | Jenkins API token | `xxxxxxxxxxxx` |
| `JENKINS_JOB_NAME` | Your pipeline job name | `DevopsSEE` |
| `SONAR_URL` | SonarQube server URL | `http://10.0.0.6:9000` |
| `SONAR_TOKEN` | SonarQube token | `sqp_xxxxxx` |
| `SONAR_PROJECT_KEY` | SonarQube project key | `banking-app` |

### 3. Start the Backend

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
yarn install  # or npm install
```

### 2. Start Development Server

```bash
yarn start  # or npm start
```

The React app will proxy API requests to the backend on port 5000.

---

## Jenkins Pipeline Integration

The Jenkinsfile is already configured to:

1. **Run SonarQube analysis** → Results available via `/api/system-health`
2. **Run Trivy scan** → Sends JSON report to `/api/trivy-webhook`
3. **Build & push Docker images** → Via Ansible playbook
4. **Deploy to Kubernetes** → Via Ansible playbook

### Trivy Webhook

The Jenkins pipeline sends Trivy scan results to the backend:

```groovy
stage('Vulnerability Scan (Trivy)') {
    steps {
        // Generate JSON report
        sh 'trivy image --format json --output trivy-report.json jeevanc370/banking-app:latest'
        
        // Send to Dashboard backend
        sh "curl -X POST -H 'Content-Type: application/json' -d @trivy-report.json http://<BACKEND_IP>:5000/api/trivy-webhook"
    }
}
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Backend health check |
| `/api/system-health` | GET | Full pipeline status (Jenkins, SonarQube, K8s, Trivy) |
| `/api/trivy-details` | GET | Detailed Trivy vulnerability report |
| `/api/trivy-webhook` | POST | Receive Trivy scan results from Jenkins |

---

## Kubernetes Deployment

The backend needs access to the Kubernetes API. Ensure:

1. **For local development**: `~/.kube/config` is properly configured
2. **For in-cluster deployment**: ServiceAccount with appropriate RBAC

### Update Backend NodePort Service

Ensure the backend is exposed on a NodePort (e.g., 30007) for Jenkins to send Trivy webhooks:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: banking-backend
spec:
  type: NodePort
  ports:
    - port: 5000
      targetPort: 5000
      nodePort: 30007
  selector:
    app: banking-backend
```

---

## What the Dashboard Shows

### Quick Stats (Top Row)
- Jenkins build status (SUCCESS/BUILDING/FAILED)
- SonarQube quality gate (Passed/Failed)
- Trivy scan status (Secure/Issues Found)
- Kubernetes cluster health
- Overall pipeline health

### Detailed Cards

1. **Jenkins CI/CD**
   - Build number (#42)
   - Duration (3m 45s)
   - Last build timestamp
   - Building indicator (spinner)

2. **SonarQube**
   - Quality gate status
   - Bugs count
   - Vulnerabilities count
   - Code smells count
   - Coverage percentage
   - Security rating (A-E)

3. **Trivy Security**
   - CRITICAL vulnerabilities count
   - HIGH vulnerabilities count
   - MEDIUM vulnerabilities count
   - LOW vulnerabilities count
   - Image scanned
   - Last scan timestamp

4. **Kubernetes**
   - Cluster status (Healthy/Degraded)
   - Node count & status
   - Pod count
   - Node details (CPU, Memory, Kubelet version)

5. **Docker & Ansible**
   - Docker Hub images
   - Ansible playbooks

6. **Pipeline Flow Diagram**
   - Visual representation of CI/CD stages
   - Color-coded status for each stage

---

## Troubleshooting

### Backend can't connect to Jenkins
- Verify `JENKINS_URL` and `JENKINS_TOKEN`
- Ensure Jenkins API is accessible from backend network
- Check firewall rules

### SonarQube data not showing
- Verify `SONAR_URL` and `SONAR_TOKEN`
- Ensure project key matches: `banking-app`
- Run a SonarQube analysis first

### Trivy data not updating
- Check Jenkins pipeline includes the webhook stage
- Verify backend IP in Jenkinsfile webhook URL
- Check backend logs for incoming webhook data

### Kubernetes data not showing
- Verify `~/.kube/config` exists and is valid
- Test with: `kubectl get nodes`
- For in-cluster: check ServiceAccount permissions

---

## Demo Guide (For External Presentation)

1. **Show the Dashboard** - Navigate to the System Health page
2. **Trigger a Build** - Push code to GitHub or manually run Jenkins job
3. **Watch Real-time Updates** - Dashboard refreshes every 15 seconds
4. **Explain Pipeline Flow** - Use the visual pipeline diagram
5. **Deep Dive into Tools** - Click through each card to explain metrics
6. **Demonstrate Security** - Show Trivy vulnerability counts and SonarQube ratings

---

## Files Modified

| File | Changes |
|------|---------|
| `backend/server.js` | Complete rewrite with all API endpoints |
| `backend/package.json` | Added express, cors dependencies |
| `backend/.env.example` | Configuration template |
| `frontend/src/components/HealthDashboard.js` | Enhanced real-time dashboard |
| `frontend/package.json` | Added proxy configuration |
