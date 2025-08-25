import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Droplets, 
  Activity, 
  // Clock, 
  Trash2, 
  Eye, 
  Calendar,
  Archive,
  RefreshCw,
  Info,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import tempIntakeService from '../../services/tempIntakeService';
import { fadeInUp, scaleIn, staggerContainer } from '../../utils/animations';

const TempDailyIntake = () => {
  const [intakeData, setIntakeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [archiveDates, setArchiveDates] = useState([]);
  const [selectedArchiveDate, setSelectedArchiveDate] = useState('');
  const [archivedData, setArchivedData] = useState(null);

  useEffect(() => {
    loadTodayIntake();
    loadArchiveDates();
  }, []);

  const loadTodayIntake = async () => {
    try {
      setLoading(true);
      const data = await tempIntakeService.getTodayIntake();
      setIntakeData(data);
    } catch (error) {
      console.error('Error loading today\'s intake:', error);
      // Don't show error toast for empty data
      if (!error.message.includes('not found')) {
        toast.error('Failed to load daily intake');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadArchiveDates = async () => {
    try {
      const dates = await tempIntakeService.getAvailableArchiveDates();
      setArchiveDates(dates);
    } catch (error) {
      console.error('Error loading archive dates:', error);
    }
  };

  const loadArchivedData = async (date) => {
    try {
      const data = await tempIntakeService.getArchivedIntake(date);
      setArchivedData(data);
    } catch (error) {
      console.error('Error loading archived data:', error);
      toast.error('Failed to load archived data');
    }
  };

  const removeFoodEntry = async (entryId) => {
    try {
      await tempIntakeService.removeFoodEntry(entryId);
      toast.success('Food entry removed');
      loadTodayIntake(); // Refresh data
    } catch (error) {
      console.error('Error removing food entry:', error);
      toast.error('Failed to remove food entry');
    }
  };

  const handleArchiveDateChange = (date) => {
    setSelectedArchiveDate(date);
    if (date) {
      loadArchivedData(date);
    } else {
      setArchivedData(null);
    }
  };

  const summary = intakeData ? tempIntakeService.getIntakeSummary(intakeData) : null;

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Today's Intake Summary */}
      <motion.div variants={fadeInUp} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Flame className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-bold text-gray-800">Today's Intake</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadTodayIntake}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Toggle Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {summary && summary.totalEntries > 0 ? (
          <div className="space-y-4">
            {/* Nutrition Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm text-red-700 font-medium">Calories</p>
                    <p className="text-lg font-bold text-red-800">{summary.totalCalories}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Protein</p>
                    <p className="text-lg font-bold text-blue-800">{summary.totalProtein}g</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-green-700 font-medium">Carbs</p>
                    <p className="text-lg font-bold text-green-800">{summary.totalCarbs}g</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-yellow-700 font-medium">Fat</p>
                    <p className="text-lg font-bold text-yellow-800">{summary.totalFat}g</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Food Entries */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                    <Info className="w-4 h-4" />
                    <span>Food Entries ({summary.totalEntries})</span>
                  </h4>
                  
                  {summary.entries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      variants={scaleIn}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 }}
                      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {entry.image && (
                            <img
                              src={entry.image}
                              alt={entry.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h5 className="font-medium text-gray-800">{entry.name}</h5>
                            <p className="text-sm text-gray-600">
                              {entry.calories} cal • {entry.servingSize}
                            </p>
                            <p className="text-xs text-gray-500">
                              Added: {new Date(entry.addedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {entry.healthScore && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              entry.healthScore >= 7 ? 'bg-green-100 text-green-800' :
                              entry.healthScore >= 5 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              Score: {entry.healthScore}/10
                            </span>
                          )}
                          
                          <button
                            onClick={() => removeFoodEntry(entry.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-8">
            <Flame className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No food entries for today</p>
            <p className="text-sm text-gray-500 mt-1">
              Use the Food Analysis feature to add items
            </p>
          </div>
        )}
      </motion.div>

      {/* Archive Section */}
      {archiveDates.length > 0 && (
        <motion.div variants={fadeInUp} className="glass-card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Archive className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-800">Previous Days</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-600" />
              <select
                value={selectedArchiveDate}
                onChange={(e) => handleArchiveDateChange(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select a date to view</option>
                {archiveDates.map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </option>
                ))}
              </select>
            </div>

            {archivedData && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-3">
                  {new Date(archivedData.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-purple-700">Calories</p>
                    <p className="font-bold text-purple-800">{archivedData.totals.calories}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-purple-700">Protein</p>
                    <p className="font-bold text-purple-800">{archivedData.totals.protein}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-purple-700">Carbs</p>
                    <p className="font-bold text-purple-800">{archivedData.totals.carbs}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-purple-700">Fat</p>
                    <p className="font-bold text-purple-800">{archivedData.totals.fat}g</p>
                  </div>
                </div>

                <p className="text-sm text-purple-600">
                  {archivedData.entries.length} food entries recorded
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

    </motion.div>
  );
};

export default TempDailyIntake;