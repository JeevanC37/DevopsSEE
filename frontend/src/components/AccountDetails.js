import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { User, Mail, CreditCard, Calendar, Shield, Award, Download, FileText } from 'lucide-react';

const AccountDetails = () => {
  const { user, transactions } = useAuth();

  const accountInfo = [
    { label: 'Account Holder', value: user.name, icon: User },
    { label: 'Email Address', value: user.email, icon: Mail },
    { label: 'Account Number', value: user.accountNumber, icon: CreditCard },
    { label: 'Member Since', value: 'January 2020', icon: Calendar },
    { label: 'Account Status', value: 'Active', icon: Shield, badge: true },
    { label: 'Account Type', value: 'Premium', icon: Award, badge: true }
  ];

  // Generate and download PDF statement
  const downloadStatement = (month) => {
    // Get random transactions for the month
    const statementTransactions = transactions.slice(0, 10).map(t => ({
      ...t,
      date: month.includes('January') ? '2025-01-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0') :
            month.includes('December') ? '2024-12-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0') :
            '2024-11-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
    }));

    const totalCredits = statementTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const totalDebits = statementTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);

    // Create PDF content as HTML
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SecureBank Statement - ${month}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #2563eb; margin: 0; }
          .header p { color: #666; margin: 5px 0; }
          .account-info { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; }
          .account-info div { flex: 1; }
          .account-info h3 { margin: 0 0 5px 0; color: #374151; font-size: 14px; }
          .account-info p { margin: 0; font-weight: bold; font-size: 16px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #2563eb; color: white; padding: 12px; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          tr:hover { background: #f8fafc; }
          .credit { color: #16a34a; font-weight: bold; }
          .debit { color: #dc2626; font-weight: bold; }
          .summary { background: #f8fafc; padding: 20px; border-radius: 8px; margin-top: 20px; }
          .summary-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .summary-row.total { font-size: 18px; font-weight: bold; border-top: 2px solid #2563eb; padding-top: 15px; margin-top: 15px; }
          .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏦 SecureBank</h1>
          <p>Monthly Account Statement</p>
          <p><strong>${month}</strong></p>
        </div>
        
        <div class="account-info">
          <div>
            <h3>Account Holder</h3>
            <p>${user.name}</p>
          </div>
          <div>
            <h3>Account Number</h3>
            <p>${user.accountNumber}</p>
          </div>
          <div>
            <h3>Statement Period</h3>
            <p>${month}</p>
          </div>
        </div>

        <h2>Transaction Details</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${statementTransactions.map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>${t.description}</td>
                <td>${t.category}</td>
                <td class="${t.type}">${t.type === 'credit' ? '+' : '-'}$${t.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary">
          <h3>Account Summary</h3>
          <div class="summary-row">
            <span>Total Credits:</span>
            <span class="credit">+$${totalCredits.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Total Debits:</span>
            <span class="debit">-$${totalDebits.toFixed(2)}</span>
          </div>
          <div class="summary-row total">
            <span>Closing Balance:</span>
            <span>$${(user.savingsBalance + user.checkingBalance).toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>This is an auto-generated statement from SecureBank.</p>
          <p>For any queries, contact support@securebank.com | 1-800-SECURE</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    // Create a blob and download
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SecureBank_Statement_${month.replace(' ', '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Details</h1>
        <p className="text-gray-600 mt-1">View your account information and statements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Account Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your account details and contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accountInfo.map((info) => {
                const Icon = info.icon;
                return (
                  <div key={info.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{info.label}</p>
                        <p className="font-medium text-gray-900">{info.value}</p>
                      </div>
                    </div>
                    {info.badge && (
                      <Badge className="bg-green-100 text-green-800">
                        {info.value}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Account Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Savings Account</p>
                <p className="text-2xl font-bold text-green-600">
                  ${user.savingsBalance.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{user.accountNumber}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Checking Account</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${user.checkingBalance.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{user.accountNumber}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${(user.savingsBalance + user.checkingBalance).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Two-Factor Auth</span>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">SMS Alerts</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Fraud Protection</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Account Statements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recent Statements
          </CardTitle>
          <CardDescription>Download your monthly account statements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['January 2025', 'December 2024', 'November 2024'].map((month) => (
              <div key={month} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{month} Statement</p>
                  <p className="text-sm text-gray-500">HTML Document (Printable)</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadStatement(month)}
                  className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountDetails;