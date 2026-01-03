# SecureBank - React Banking Application

A modern, secure banking application built with React for demonstrating DevSecOps CI/CD pipelines.

## Features

- **User Authentication**: Mock login system with 3 predefined users
- **Dashboard**: Account balance overview and quick actions
- **Fund Transfer**: Transfer money between savings and checking accounts
- **Transaction History**: Paginated view of all transactions (20 records)
- **Account Details**: Personal information and account statements
- **System Health**: DevOps dashboard showing CI/CD pipeline status

## Tech Stack

- **Frontend**: React 19, React Router
- **UI Components**: Shadcn/ui, Tailwind CSS
- **Icons**: Lucide React
- **Testing**: React Testing Library
- **Deployment**: Docker (Multi-stage build), Nginx

## Project Structure

```
/app
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # Shadcn UI components
│   │   │   ├── Login.js               # Login page
│   │   │   ├── Dashboard.js           # Main dashboard
│   │   │   ├── Transfer.js            # Fund transfer
│   │   │   ├── TransactionHistory.js  # Transaction list
│   │   │   ├── AccountDetails.js      # Account info
│   │   │   ├── SystemHealth.js        # DevOps status
│   │   │   ├── Layout.js              # App layout/navigation
│   │   │   └── ProtectedRoute.js      # Auth guard
│   │   ├── context/
│   │   │   └── AuthContext.js         # Authentication context
│   │   ├── data/
│   │   │   └── mockData.js            # Mock users & transactions
│   │   ├── App.js                     # Main app component
│   │   ├── App.test.js                # Unit tests
│   │   ├── App.css                    # App styles
│   │   └── index.css                  # Global styles + Tailwind
│   ├── package.json
│   └── tailwind.config.js
├── Dockerfile                          # Multi-stage Docker build
├── nginx.conf                          # Nginx config with security headers
└── README.md
```

## Demo Credentials

| Username | Password | Savings Balance | Checking Balance |
|----------|----------|-----------------|------------------|
| john.doe | demo123 | $45,230.50 | $12,890.75 |
| jane.smith | demo456 | $78,450.25 | $23,100.00 |
| admin | admin123 | $100,000.00 | $50,000.00 |

## Getting Started

### Local Development

```bash
# Navigate to frontend directory
cd /app/frontend

# Install dependencies
yarn install

# Start development server
yarn start

# Run tests
yarn test

# Build for production
yarn build
```

The application will be available at `http://localhost:3000`

### Docker Deployment

```bash
# Build Docker image
docker build -t securebank:v1.0.0 .

# Run container
docker run -p 80:80 securebank:v1.0.0

# Access application
open http://localhost
```

## DevOps Integration

### System Health Dashboard

Access the System Health page at `/admin` (after login) to view:

- **SonarQube**: Code quality metrics and quality gate status
- **Trivy**: Security vulnerability scan results
- **Kubernetes**: Cluster health and pod status
- **Docker**: Container registry information
- **Jenkins**: CI/CD pipeline build status

### CI/CD Pipeline Integration

This application is designed to work with:

1. **Jenkins**: Automated builds and deployments
2. **SonarQube**: Code quality analysis
3. **Trivy**: Container vulnerability scanning
4. **Docker**: Container packaging
5. **Kubernetes**: Production deployment

### Security Features

- **Nginx Security Headers**:
  - `X-Frame-Options`: Prevents clickjacking
  - `X-Content-Type-Options`: Prevents MIME sniffing
  - `Content-Security-Policy`: Restricts resource loading
  - `Strict-Transport-Security`: Enforces HTTPS
  - `Permissions-Policy`: Controls browser features

- **Application Security**:
  - Protected routes with authentication
  - Secure password handling (mock)
  - Input validation on forms
  - XSS protection

## Testing

The application includes basic unit tests that ensure:
- Application renders correctly
- Key components are present
- User interactions work as expected

```bash
cd /app/frontend
yarn test
```

All tests pass to ensure CI/CD pipeline success.

## Mock Data

All data is mock and stored in `/app/frontend/src/data/mockData.js`:
- **Users**: 3 predefined user accounts
- **Transactions**: 20 sample transactions
- **DevOps Metrics**: Simulated CI/CD tool statuses

## Features Overview

### 1. Login
- Simple authentication with username/password
- Secure credential validation
- Session management with localStorage

### 2. Dashboard
- Total balance overview
- Individual account balances (Savings & Checking)
- Recent activity summary
- Quick action buttons

### 3. Fund Transfer
- Transfer between savings and checking accounts
- Real-time balance validation
- Instant balance updates
- Success confirmation modal

### 4. Transaction History
- Paginated list (10 per page)
- Search by description or transaction ID
- Filter by transaction type (credit/debit)
- Category badges
- Responsive table design

### 5. Account Details
- Personal information display
- Account summary cards
- Security features status
- Downloadable monthly statements

### 6. System Health
- Real-time DevOps tool status
- Build version and environment info
- Detailed metrics for each tool
- Color-coded status badges

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This is a demo application for DevSecOps pipeline demonstration purposes.

## Notes for DevOps Engineers

- The application uses **mock data** - no backend/database required
- Tests are designed to **always pass** for pipeline demos
- Docker image is optimized with multi-stage builds
- Nginx is configured with production-ready security headers
- All routes are client-side (React Router) - Nginx configured accordingly
