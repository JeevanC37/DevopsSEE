import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { ArrowUpRight, ArrowDownRight, Search, Filter, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const TransactionHistory = () => {
  const { transactions, resetData } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getCategoryColor = (category) => {
    const colors = {
      Income: 'bg-green-100 text-green-800',
      Utilities: 'bg-blue-100 text-blue-800',
      Shopping: 'bg-purple-100 text-purple-800',
      Dining: 'bg-orange-100 text-orange-800',
      Cash: 'bg-gray-100 text-gray-800',
      Refund: 'bg-teal-100 text-teal-800',
      Groceries: 'bg-lime-100 text-lime-800',
      Transportation: 'bg-cyan-100 text-cyan-800',
      Health: 'bg-pink-100 text-pink-800',
      Interest: 'bg-emerald-100 text-emerald-800',
      Transfer: 'bg-indigo-100 text-indigo-800',
      Insurance: 'bg-amber-100 text-amber-800',
      Housing: 'bg-red-100 text-red-800',
      Entertainment: 'bg-fuchsia-100 text-fuchsia-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600 mt-1">View and manage all your transactions</p>
        </div>
        <Button 
          variant="outline" 
          onClick={resetData}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset Demo Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={filterType}
                onValueChange={(value) => {
                  setFilterType(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit">Credits</SelectItem>
                  <SelectItem value="debit">Debits</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-gray-600">{transaction.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.type === 'credit' ? (
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <ArrowDownRight className="w-4 h-4 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <ArrowUpRight className="w-4 h-4 text-red-600" />
                          </div>
                        )}
                        <span>{transaction.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(transaction.category)}>
                        {transaction.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={transaction.type === 'credit' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${transaction.balance.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                  })
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 py-1">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={currentPage === page ? 'bg-blue-600' : ''}
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionHistory;