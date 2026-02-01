import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CreditCard, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, transactions } = useAuth();
  const navigate = useNavigate();

  const totalBalance = user.savingsBalance + user.checkingBalance;
  const recentTransactions = transactions.slice(0, 5); // Get 5 most recent

  const quickActions = [
    { label: 'Transfer Funds', path: '/transfer', icon: ArrowUpRight, color: 'blue' },
    { label: 'Transactions', path: '/transactions', icon: TrendingUp, color: 'green' },
    { label: 'Account Details', path: '/account', icon: CreditCard, color: 'purple' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
        <p className="text-gray-600 mt-1">Here's your financial overview</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Total Balance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Savings Account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${user.savingsBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-gray-500 mt-1">{user.accountNumber}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Checking Account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              ${user.checkingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-gray-500 mt-1">{user.accountNumber}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your accounts efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 hover:border-blue-600 hover:bg-blue-50 transition-colors"
                  onClick={() => navigate(action.path)}
                >
                  <Icon className={`w-6 h-6 text-${action.color}-600`} />
                  <span className="font-medium">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Activity</span>
            <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
              View All
              <Eye className="w-4 h-4 ml-2" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent transactions</p>
            ) : (
              recentTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    transaction.type === 'credit' ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'credit' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {transaction.type === 'credit' ? (
                        <ArrowDownRight className="w-5 h-5 text-white" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;