import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: 'Espresso',
      price: 15000,
      category: 'Coffee',
      image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&h=200&fit=crop',
      stock: 50,
      ingredients: ['Coffee Beans', 'Water']
    },
    {
      id: 2,
      name: 'Cappuccino',
      price: 25000,
      category: 'Coffee',
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=200&fit=crop',
      stock: 45,
      ingredients: ['Coffee Beans', 'Milk', 'Water']
    },
    {
      id: 3,
      name: 'Latte',
      price: 28000,
      category: 'Coffee',
      image: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=300&h=200&fit=crop',
      stock: 40,
      ingredients: ['Coffee Beans', 'Milk', 'Water']
    },
    {
      id: 4,
      name: 'Americano',
      price: 20000,
      category: 'Coffee',
      image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=300&h=200&fit=crop',
      stock: 35,
      ingredients: ['Coffee Beans', 'Water']
    },
    {
      id: 5,
      name: 'Croissant',
      price: 18000,
      category: 'Food',
      image: 'https://images.unsplash.com/photo-1555507036-ab794f4ade7a?w=300&h=200&fit=crop',
      stock: 25,
      ingredients: ['Flour', 'Butter', 'Eggs']
    },
    {
      id: 6,
      name: 'Sandwich',
      price: 35000,
      category: 'Food',
      image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=300&h=200&fit=crop',
      stock: 20,
      ingredients: ['Bread', 'Cheese', 'Ham', 'Lettuce']
    }
  ]);

  const [stockItems, setStockItems] = useState([
    { id: 1, name: 'Coffee Beans', quantity: 500, unit: 'kg', minStock: 50 },
    { id: 2, name: 'Milk', quantity: 200, unit: 'liter', minStock: 30 },
    { id: 3, name: 'Water', quantity: 1000, unit: 'liter', minStock: 100 },
    { id: 4, name: 'Flour', quantity: 100, unit: 'kg', minStock: 20 },
    { id: 5, name: 'Butter', quantity: 50, unit: 'kg', minStock: 10 },
    { id: 6, name: 'Eggs', quantity: 200, unit: 'pcs', minStock: 50 },
    { id: 7, name: 'Bread', quantity: 100, unit: 'pcs', minStock: 20 },
    { id: 8, name: 'Cheese', quantity: 25, unit: 'kg', minStock: 5 },
    { id: 9, name: 'Ham', quantity: 15, unit: 'kg', minStock: 3 },
    { id: 10, name: 'Lettuce', quantity: 30, unit: 'kg', minStock: 5 }
  ]);

  const [transactions, setTransactions] = useState([]);
  const [cart, setCart] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedMenuItems = localStorage.getItem('kopibagus_menu');
    const savedStockItems = localStorage.getItem('kopibagus_stock');
    const savedTransactions = localStorage.getItem('kopibagus_transactions');

    if (savedMenuItems) {
      setMenuItems(JSON.parse(savedMenuItems));
    }
    if (savedStockItems) {
      setStockItems(JSON.parse(savedStockItems));
    }
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('kopibagus_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('kopibagus_stock', JSON.stringify(stockItems));
  }, [stockItems]);

  useEffect(() => {
    localStorage.setItem('kopibagus_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity === 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const processTransaction = (transactionData) => {
    const newTransaction = {
      id: Date.now(),
      ...transactionData,
      timestamp: new Date().toISOString()
    };
    setTransactions([...transactions, newTransaction]);
    clearCart();
    return newTransaction;
  };

  const addMenuItem = (item) => {
    const newItem = {
      ...item,
      id: Date.now()
    };
    setMenuItems([...menuItems, newItem]);
  };

  const updateMenuItem = (itemId, updatedItem) => {
    setMenuItems(menuItems.map(item =>
      item.id === itemId ? { ...item, ...updatedItem } : item
    ));
  };

  const deleteMenuItem = (itemId) => {
    setMenuItems(menuItems.filter(item => item.id !== itemId));
  };

  const updateStockItem = (itemId, updatedItem) => {
    setStockItems(stockItems.map(item =>
      item.id === itemId ? { ...item, ...updatedItem } : item
    ));
  };

  const addStockItem = (item) => {
    const newItem = {
      ...item,
      id: Date.now()
    };
    setStockItems([...stockItems, newItem]);
  };

  const value = {
    menuItems,
    stockItems,
    transactions,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    processTransaction,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    updateStockItem,
    addStockItem
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};