import React, { createContext, useState, useContext, useEffect } from 'react';
import { mockUsers, mockTransactions } from '../data/mockData';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('bankUser');
    const storedTransactions = localStorage.getItem('bankTransactions');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    } else {
      setTransactions(mockTransactions);
      localStorage.setItem('bankTransactions', JSON.stringify(mockTransactions));
    }
    
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const foundUser = mockUsers.find(
      u => u.username === username && u.password === password
    );
    
    if (foundUser) {
      const userWithoutPassword = { ...foundUser };
      delete userWithoutPassword.password;
      setUser(userWithoutPassword);
      localStorage.setItem('bankUser', JSON.stringify(userWithoutPassword));
      return { success: true };
    }
    
    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bankUser');
  };

  const updateBalance = (accountType, amount, accountType2 = null, amount2 = null) => {
    if (user) {
      const updatedUser = { ...user };
      // First account update
      if (accountType === 'savings') {
        updatedUser.savingsBalance += amount;
      } else if (accountType === 'checking') {
        updatedUser.checkingBalance += amount;
      }
      // Second account update (for transfers between accounts)
      if (accountType2 && amount2 !== null) {
        if (accountType2 === 'savings') {
          updatedUser.savingsBalance += amount2;
        } else if (accountType2 === 'checking') {
          updatedUser.checkingBalance += amount2;
        }
      }
      setUser(updatedUser);
      localStorage.setItem('bankUser', JSON.stringify(updatedUser));
    }
  };

  const addTransaction = (transaction) => {
    const newTransaction = {
      id: `TXN${String(transactions.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      ...transaction,
      balance: user.savingsBalance + user.checkingBalance
    };
    
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem('bankTransactions', JSON.stringify(updatedTransactions));
    
    return newTransaction;
  };

  const resetData = () => {
    // Reset to original mock data
    const originalUser = mockUsers.find(u => u.id === user?.id);
    if (originalUser) {
      const userWithoutPassword = { ...originalUser };
      delete userWithoutPassword.password;
      setUser(userWithoutPassword);
      localStorage.setItem('bankUser', JSON.stringify(userWithoutPassword));
    }
    setTransactions(mockTransactions);
    localStorage.setItem('bankTransactions', JSON.stringify(mockTransactions));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      updateBalance, 
      transactions, 
      addTransaction,
      resetData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};