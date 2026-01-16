import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transfer from './components/Transfer';
import TransactionHistory from './components/TransactionHistory';
import AccountDetails from './components/AccountDetails';
import ProtectedRoute from './components/ProtectedRoute';
import HealthDashboard from './components/HealthDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transfer" element={<Transfer />} />
            <Route path="transactions" element={<TransactionHistory />} />
            <Route path="account" element={<AccountDetails />} />
            <Route path="system-health" element={<HealthDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
