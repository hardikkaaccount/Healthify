import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import dataService from '../services/dataService';

const HealthDataContext = createContext();

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};

export const HealthDataProvider = ({ children }) => {
  const { user, isAuthenticated } = useUser();
  const [dailyData, setDailyData] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0,
    steps: 0,
    sleep: 0,
    mood: 'neutral',
    foodEntries: [],
    date: new Date().toISOString().split('T')[0],
  });
  
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load today's data on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      loadTodayDataFromFirebase();
    } else {
      loadTodayData();
    }
  }, [user, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTodayDataFromFirebase = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Load food entries and health metrics in parallel
      const [foodEntries, healthMetrics] = await Promise.all([
        dataService.getFoodEntriesByDate(user.uid, today),
        dataService.getDailyHealthMetrics(user.uid, today)
      ]);
      
      // Calculate totals from food entries
      const totals = foodEntries.reduce((acc, entry) => ({
        calories: acc.calories + (entry.calories || 0),
        protein: acc.protein + (entry.protein || 0),
        carbs: acc.carbs + (entry.carbs || 0),
        fat: acc.fat + (entry.fat || 0)
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      const dailyData = {
        ...totals,
        water: healthMetrics?.water || 0,
        steps: healthMetrics?.steps || 0,
        sleep: healthMetrics?.sleep || 0,
        mood: healthMetrics?.mood || 'neutral',
        foodEntries,
        date: today,
      };

      setDailyData(dailyData);
    } catch (error) {
      console.error('Error loading Firebase data:', error);
      // Fallback to localStorage
      loadTodayData();
    } finally {
      setLoading(false);
    }
  };

  const loadTodayData = () => {
    const today = new Date().toISOString().split('T')[0];
    const savedData = localStorage.getItem(`healthData_${today}`);
    
    if (savedData) {
      setDailyData(JSON.parse(savedData));
    } else {
      // Initialize with default values
      const defaultData = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        water: 0,
        steps: 0,
        sleep: 0,
        mood: 'neutral',
        foodEntries: [],
        date: today,
      };
      setDailyData(defaultData);
      localStorage.setItem(`healthData_${today}`, JSON.stringify(defaultData));
    }
  };

  const addFoodEntry = async (foodData) => {
    try {
      let newEntry;
      
      if (isAuthenticated && user) {
        // Save to Firebase
        newEntry = await dataService.addFoodEntry(user.uid, foodData);
      } else {
        throw new Error('Authentication required to add food entries');
      }

      const updatedData = {
        ...dailyData,
        calories: dailyData.calories + (foodData.calories || 0),
        protein: dailyData.protein + (foodData.protein || 0),
        carbs: dailyData.carbs + (foodData.carbs || 0),
        fat: dailyData.fat + (foodData.fat || 0),
        foodEntries: [...dailyData.foodEntries, newEntry],
      };

      setDailyData(updatedData);
      
      if (!isAuthenticated) {
        localStorage.setItem(`healthData_${updatedData.date}`, JSON.stringify(updatedData));
      }

      return newEntry;
    } catch (error) {
      console.error('Error adding food entry:', error);
      throw error;
    }
  };

  const updateDailyMetric = async (metric, value) => {
    try {
      const updatedData = {
        ...dailyData,
        [metric]: value,
      };

      setDailyData(updatedData);

      // Save to database if authenticated
      if (isAuthenticated && user) {
        await dataService.updateDailyHealthMetric(user.uid, updatedData.date, metric, value);
      } else {
        // Fallback to localStorage for non-authenticated users
        localStorage.setItem(`healthData_${updatedData.date}`, JSON.stringify(updatedData));
      }

      return updatedData;
    } catch (error) {
      console.error('Error updating daily metric:', error);
      // If database update fails, still save to localStorage as backup
      localStorage.setItem(`healthData_${dailyData.date}`, JSON.stringify({
        ...dailyData,
        [metric]: value,
      }));
      throw error;
    }
  };

  const getWeeklyData = async () => {
    try {
      const today = new Date();
      const weekData = [];
      
      if (isAuthenticated && user) {
        // Calculate date range for the week
        const endDate = today.toISOString().split('T')[0];
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        const startDateString = startDate.toISOString().split('T')[0];
        
        // Get data from database
        const [healthMetricsData] = await Promise.all([
          dataService.getDailyHealthMetricsRange(user.uid, startDateString, endDate)
        ]);
        
        // Create a map for quick lookup
        const healthMetricsMap = {};
        healthMetricsData.forEach(metric => {
          healthMetricsMap[metric.date] = metric;
        });
        
        // Build week data
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          
          // Get food entries for this date
          let foodEntries = [];
          let foodTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
          
          try {
            foodEntries = await dataService.getFoodEntriesByDate(user.uid, dateString);
            foodTotals = foodEntries.reduce((acc, entry) => ({
              calories: acc.calories + (entry.calories || 0),
              protein: acc.protein + (entry.protein || 0),
              carbs: acc.carbs + (entry.carbs || 0),
              fat: acc.fat + (entry.fat || 0)
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
          } catch (error) {
            console.error(`Error loading food entries for ${dateString}:`, error);
          }
          
          const healthMetrics = healthMetricsMap[dateString] || {};
          
          weekData.push({
            date: dateString,
            ...foodTotals,
            water: healthMetrics.water || 0,
            steps: healthMetrics.steps || 0,
            sleep: healthMetrics.sleep || 0,
            mood: healthMetrics.mood || 'neutral',
            foodEntries,
          });
        }
      } else {
        // Fallback to localStorage for non-authenticated users
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          
          const dayData = localStorage.getItem(`healthData_${dateString}`);
          if (dayData) {
            weekData.push(JSON.parse(dayData));
          } else {
            weekData.push({
              date: dateString,
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              water: 0,
              steps: 0,
              sleep: 0,
              foodEntries: [],
            });
          }
        }
      }
      
      setWeeklyData(weekData);
      return weekData;
    } catch (error) {
      console.error('Error getting weekly data:', error);
      // Fallback to localStorage
      const weekData = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const dayData = localStorage.getItem(`healthData_${dateString}`);
        if (dayData) {
          weekData.push(JSON.parse(dayData));
        } else {
          weekData.push({
            date: dateString,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            water: 0,
            steps: 0,
            sleep: 0,
            foodEntries: [],
          });
        }
      }
      
      setWeeklyData(weekData);
      return weekData;
    }
  };

  const getMonthlyData = async () => {
    try {
      const today = new Date();
      const monthData = [];
      
      if (isAuthenticated && user) {
        // Calculate date range for the month
        const endDate = today.toISOString().split('T')[0];
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 29);
        const startDateString = startDate.toISOString().split('T')[0];
        
        // Get data from database
        const [healthMetricsData] = await Promise.all([
          dataService.getDailyHealthMetricsRange(user.uid, startDateString, endDate)
        ]);
        
        // Create a map for quick lookup
        const healthMetricsMap = {};
        healthMetricsData.forEach(metric => {
          healthMetricsMap[metric.date] = metric;
        });
        
        // Build month data
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          
          // Get food entries for this date
          let foodEntries = [];
          let foodTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
          
          try {
            foodEntries = await dataService.getFoodEntriesByDate(user.uid, dateString);
            foodTotals = foodEntries.reduce((acc, entry) => ({
              calories: acc.calories + (entry.calories || 0),
              protein: acc.protein + (entry.protein || 0),
              carbs: acc.carbs + (entry.carbs || 0),
              fat: acc.fat + (entry.fat || 0)
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
          } catch (error) {
            console.error(`Error loading food entries for ${dateString}:`, error);
          }
          
          const healthMetrics = healthMetricsMap[dateString] || {};
          
          monthData.push({
            date: dateString,
            ...foodTotals,
            water: healthMetrics.water || 0,
            steps: healthMetrics.steps || 0,
            sleep: healthMetrics.sleep || 0,
            mood: healthMetrics.mood || 'neutral',
            foodEntries,
          });
        }
      } else {
        // Fallback to localStorage for non-authenticated users
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          
          const dayData = localStorage.getItem(`healthData_${dateString}`);
          if (dayData) {
            monthData.push(JSON.parse(dayData));
          } else {
            monthData.push({
              date: dateString,
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              water: 0,
              steps: 0,
              sleep: 0,
              foodEntries: [],
            });
          }
        }
      }
      
      setMonthlyData(monthData);
      return monthData;
    } catch (error) {
      console.error('Error getting monthly data:', error);
      // Fallback to localStorage
      const monthData = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const dayData = localStorage.getItem(`healthData_${dateString}`);
        if (dayData) {
          monthData.push(JSON.parse(dayData));
        } else {
          monthData.push({
            date: dateString,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            water: 0,
            steps: 0,
            sleep: 0,
            foodEntries: [],
          });
        }
      }
      
      setMonthlyData(monthData);
      return monthData;
    }
  };

  const removeFoodEntry = async (entryId) => {
    const entryToRemove = dailyData.foodEntries.find(entry => entry.id === entryId);
    if (!entryToRemove) return;

    try {
      if (isAuthenticated && user) {
        // Remove from Firebase
        await dataService.deleteFoodEntry(entryId);
      }

      const updatedData = {
        ...dailyData,
        calories: dailyData.calories - (entryToRemove.calories || 0),
        protein: dailyData.protein - (entryToRemove.protein || 0),
        carbs: dailyData.carbs - (entryToRemove.carbs || 0),
        fat: dailyData.fat - (entryToRemove.fat || 0),
        foodEntries: dailyData.foodEntries.filter(entry => entry.id !== entryId),
      };

      setDailyData(updatedData);
      
      if (!isAuthenticated) {
        localStorage.setItem(`healthData_${updatedData.date}`, JSON.stringify(updatedData));
      }
    } catch (error) {
      console.error('Error removing food entry:', error);
      throw error;
    }
  };

  const clearAllData = () => {
    // Clear all health data from localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('healthData_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Reset state
    loadTodayData();
    setWeeklyData([]);
    setMonthlyData([]);
  };

  const value = {
    dailyData,
    weeklyData,
    monthlyData,
    loading,
    addFoodEntry,
    updateDailyMetric,
    removeFoodEntry,
    getWeeklyData,
    getMonthlyData,
    clearAllData,
  };

  return (
    <HealthDataContext.Provider value={value}>
      {children}
    </HealthDataContext.Provider>
  );
};