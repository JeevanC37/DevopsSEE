// Mock user data for authentication
export const mockUsers = [
  {
    id: '1',
    username: 'john.doe',
    password: 'demo123',
    name: 'John Doe',
    email: 'john.doe@bank.com',
    accountNumber: '****1234',
    savingsBalance: 45230.50,
    checkingBalance: 12890.75
  },
  {
    id: '2',
    username: 'jane.smith',
    password: 'demo456',
    name: 'Jane Smith',
    email: 'jane.smith@bank.com',
    accountNumber: '****5678',
    savingsBalance: 78450.25,
    checkingBalance: 23100.00
  },
  {
    id: '3',
    username: 'admin',
    password: 'admin123',
    name: 'Admin User',
    email: 'admin@bank.com',
    accountNumber: '****9999',
    savingsBalance: 100000.00,
    checkingBalance: 50000.00
  }
];

// Mock transaction data
export const mockTransactions = [
  {
    id: 'TXN001',
    date: '2025-01-15',
    description: 'Salary Deposit',
    type: 'credit',
    amount: 5500.00,
    balance: 45230.50,
    category: 'Income'
  },
  {
    id: 'TXN002',
    date: '2025-01-14',
    description: 'Electric Bill Payment',
    type: 'debit',
    amount: 125.50,
    balance: 39730.50,
    category: 'Utilities'
  },
  {
    id: 'TXN003',
    date: '2025-01-13',
    description: 'Online Shopping - Amazon',
    type: 'debit',
    amount: 89.99,
    balance: 39856.00,
    category: 'Shopping'
  },
  {
    id: 'TXN004',
    date: '2025-01-12',
    description: 'Restaurant - Le Gourmet',
    type: 'debit',
    amount: 145.75,
    balance: 39945.99,
    category: 'Dining'
  },
  {
    id: 'TXN005',
    date: '2025-01-11',
    description: 'ATM Withdrawal',
    type: 'debit',
    amount: 200.00,
    balance: 40091.74,
    category: 'Cash'
  },
  {
    id: 'TXN006',
    date: '2025-01-10',
    description: 'Refund - Store Credit',
    type: 'credit',
    amount: 65.00,
    balance: 40291.74,
    category: 'Refund'
  },
  {
    id: 'TXN007',
    date: '2025-01-09',
    description: 'Grocery Store',
    type: 'debit',
    amount: 234.50,
    balance: 40226.74,
    category: 'Groceries'
  },
  {
    id: 'TXN008',
    date: '2025-01-08',
    description: 'Gas Station',
    type: 'debit',
    amount: 55.00,
    balance: 40461.24,
    category: 'Transportation'
  },
  {
    id: 'TXN009',
    date: '2025-01-07',
    description: 'Gym Membership',
    type: 'debit',
    amount: 49.99,
    balance: 40516.24,
    category: 'Health'
  },
  {
    id: 'TXN010',
    date: '2025-01-06',
    description: 'Interest Credit',
    type: 'credit',
    amount: 12.50,
    balance: 40566.23,
    category: 'Interest'
  },
  {
    id: 'TXN011',
    date: '2025-01-05',
    description: 'Phone Bill',
    type: 'debit',
    amount: 75.00,
    balance: 40553.73,
    category: 'Utilities'
  },
  {
    id: 'TXN012',
    date: '2025-01-04',
    description: 'Coffee Shop',
    type: 'debit',
    amount: 12.50,
    balance: 40628.73,
    category: 'Dining'
  },
  {
    id: 'TXN013',
    date: '2025-01-03',
    description: 'Online Transfer - Received',
    type: 'credit',
    amount: 500.00,
    balance: 40641.23,
    category: 'Transfer'
  },
  {
    id: 'TXN014',
    date: '2025-01-02',
    description: 'Insurance Premium',
    type: 'debit',
    amount: 350.00,
    balance: 40141.23,
    category: 'Insurance'
  },
  {
    id: 'TXN015',
    date: '2025-01-01',
    description: 'Rent Payment',
    type: 'debit',
    amount: 1500.00,
    balance: 40491.23,
    category: 'Housing'
  },
  {
    id: 'TXN016',
    date: '2024-12-31',
    description: 'Year End Bonus',
    type: 'credit',
    amount: 2000.00,
    balance: 41991.23,
    category: 'Income'
  },
  {
    id: 'TXN017',
    date: '2024-12-30',
    description: 'Pharmacy',
    type: 'debit',
    amount: 45.25,
    balance: 39991.23,
    category: 'Health'
  },
  {
    id: 'TXN018',
    date: '2024-12-29',
    description: 'Bookstore',
    type: 'debit',
    amount: 67.99,
    balance: 40036.48,
    category: 'Shopping'
  },
  {
    id: 'TXN019',
    date: '2024-12-28',
    description: 'Movie Tickets',
    type: 'debit',
    amount: 32.00,
    balance: 40104.47,
    category: 'Entertainment'
  },
  {
    id: 'TXN020',
    date: '2024-12-27',
    description: 'Paycheck Deposit',
    type: 'credit',
    amount: 5500.00,
    balance: 40136.47,
    category: 'Income'
  }
];

// DevOps System Health Mock Data
export const systemHealthData = {
  buildVersion: 'v1.0.0',
  buildDate: '2025-01-15',
  environment: 'Production',
  tools: [
    {
      name: 'SonarQube',
      status: 'PASSED',
      description: 'Quality Gate',
      icon: 'check-circle',
      metrics: {
        coverage: '87%',
        bugs: 0,
        vulnerabilities: 0,
        codeSmells: 3
      }
    },
    {
      name: 'Trivy',
      status: 'PASSED',
      description: 'Vulnerabilities',
      icon: 'shield-check',
      metrics: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 2
      }
    },
    {
      name: 'Kubernetes',
      status: 'Healthy',
      description: 'Cluster Status',
      icon: 'server',
      metrics: {
        pods: '3/3 Running',
        nodes: '2/2 Ready',
        uptime: '15 days'
      }
    },
    {
      name: 'Docker',
      status: 'Active',
      description: 'Container Registry',
      icon: 'box',
      metrics: {
        images: 5,
        size: '1.2 GB',
        lastPush: '2 hours ago'
      }
    },
    {
      name: 'Jenkins',
      status: 'Success',
      description: 'CI/CD Pipeline',
      icon: 'workflow',
      metrics: {
        lastBuild: 'Build #142',
        duration: '3m 45s',
        status: 'Success'
      }
    }
  ]
};