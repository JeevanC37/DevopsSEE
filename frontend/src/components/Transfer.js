import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ArrowRightLeft, CheckCircle } from 'lucide-react';

const Transfer = () => {
  const { user, updateBalance, addTransaction } = useAuth();
  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    description: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [transferDetails, setTransferDetails] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(formData.amount);

    if (!formData.fromAccount || !formData.toAccount) {
      setError('Please select both accounts');
      return;
    }

    if (formData.fromAccount === formData.toAccount) {
      setError('Cannot transfer to the same account');
      return;
    }

    if (amount <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    const fromBalance = formData.fromAccount === 'savings' ? user.savingsBalance : user.checkingBalance;
    
    if (amount > fromBalance) {
      setError('Insufficient funds');
      return;
    }

    // Update both balances in a single call to avoid race condition
    updateBalance(formData.fromAccount, -amount, formData.toAccount, amount);

    // Add transaction to history
    const description = formData.description || 
      `Transfer from ${formData.fromAccount.charAt(0).toUpperCase() + formData.fromAccount.slice(1)} to ${formData.toAccount.charAt(0).toUpperCase() + formData.toAccount.slice(1)}`;
    
    addTransaction({
      description: description,
      type: 'debit',
      amount: amount,
      category: 'Transfer'
    });

    setTransferDetails({
      from: formData.fromAccount,
      to: formData.toAccount,
      amount: amount,
      description: description
    });

    setShowSuccess(true);
    setFormData({
      fromAccount: '',
      toAccount: '',
      amount: '',
      description: ''
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transfer Funds</h1>
        <p className="text-gray-600 mt-1">Move money between your accounts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" />
              Transfer Details
            </CardTitle>
            <CardDescription>Enter the transfer information below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromAccount">From Account</Label>
                  <Select
                    value={formData.fromAccount}
                    onValueChange={(value) => setFormData({ ...formData, fromAccount: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">
                        Savings - ${user.savingsBalance.toFixed(2)}
                      </SelectItem>
                      <SelectItem value="checking">
                        Checking - ${user.checkingBalance.toFixed(2)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toAccount">To Account</Label>
                  <Select
                    value={formData.toAccount}
                    onValueChange={(value) => setFormData({ ...formData, toAccount: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">
                        Savings - ${user.savingsBalance.toFixed(2)}
                      </SelectItem>
                      <SelectItem value="checking">
                        Checking - ${user.checkingBalance.toFixed(2)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="pl-7"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="e.g., Monthly savings transfer"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Transfer Funds
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Balances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Savings</p>
                <p className="text-xl font-bold text-green-600">
                  ${user.savingsBalance.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Checking</p>
                <p className="text-xl font-bold text-purple-600">
                  ${user.checkingBalance.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transfer Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Limit:</span>
                <span className="font-medium">$10,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Per Transfer:</span>
                <span className="font-medium">$5,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing:</span>
                <span className="font-medium">Instant</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">Transfer Successful!</DialogTitle>
            <DialogDescription className="text-center">
              Your transfer has been completed successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              {transferDetails && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold text-green-600">${transferDetails.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">From:</span>
                    <span className="font-semibold capitalize">{transferDetails.from}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">To:</span>
                    <span className="font-semibold capitalize">{transferDetails.to}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Balance:</span>
                    <span className="font-semibold text-blue-600">
                      ${(user.savingsBalance + user.checkingBalance).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>
            <Button
              onClick={() => setShowSuccess(false)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transfer;