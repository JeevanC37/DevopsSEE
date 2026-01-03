import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { User, Mail, CreditCard, Calendar, Shield, Award } from 'lucide-react';

const AccountDetails = () => {
  const { user } = useAuth();

  const accountInfo = [
    { label: 'Account Holder', value: user.name, icon: User },
    { label: 'Email Address', value: user.email, icon: Mail },
    { label: 'Account Number', value: user.accountNumber, icon: CreditCard },
    { label: 'Member Since', value: 'January 2020', icon: Calendar },
    { label: 'Account Status', value: 'Active', icon: Shield, badge: true },
    { label: 'Account Type', value: 'Premium', icon: Award, badge: true }
  ];

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
          <CardTitle>Recent Statements</CardTitle>
          <CardDescription>Download your monthly account statements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['January 2025', 'December 2024', 'November 2024'].map((month) => (
              <div key={month} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{month} Statement</p>
                  <p className="text-sm text-gray-500">PDF Document</p>
                </div>
                <Badge variant="outline" className="cursor-pointer hover:bg-blue-50">
                  Download
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountDetails;