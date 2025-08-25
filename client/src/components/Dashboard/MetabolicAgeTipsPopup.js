import React from 'react';
import { motion } from 'framer-motion';

const MetabolicAgeTipsPopup = ({ onClose, userProfile: profileData }) => {
  const getPersonalizedTips = () => {
    const tips = {
      general: [
        "🏃‍♂️ Increase your daily physical activity - aim for 150 minutes of moderate exercise per week",
        "💪 Add strength training 2-3 times per week to build lean muscle mass",
        "🥗 Focus on whole foods: lean proteins, vegetables, fruits, and whole grains",
        "💧 Stay hydrated - drink at least 8 glasses of water daily",
        "😴 Get 7-9 hours of quality sleep each night",
        "🧘‍♀️ Practice stress management through meditation or yoga",
        "🚭 Avoid smoking and limit alcohol consumption",
        "⏰ Try intermittent fasting (consult your doctor first)"
      ],
      younger: [
        "🎉 Congratulations! Your metabolism is younger than your age!",
        "✅ Keep up your current healthy lifestyle",
        "🔄 Maintain your exercise routine and healthy eating habits",
        "📈 Consider adding variety to your workouts to continue challenging your body",
        "🎯 Focus on maintaining your current weight and muscle mass",
        "🧠 Keep learning new skills to maintain cognitive health"
      ],
      older: [
        "⚠️ Your metabolic age is higher than your chronological age",
        "🚀 Don't worry - you can improve this with lifestyle changes!",
        "🏋️‍♀️ Prioritize strength training to build muscle and boost metabolism",
        "🥘 Focus on protein-rich foods to support muscle maintenance",
        "⚡ Try High-Intensity Interval Training (HIIT) 2-3 times per week",
        "🌱 Eat more fiber-rich foods to improve digestion and metabolism",
        "☕ Consider green tea or coffee before workouts for a metabolic boost",
        "📊 Track your progress and celebrate small improvements"
      ],
      same: [
        "✅ Your metabolic age matches your chronological age",
        "📈 There's room for improvement to make your metabolism younger!",
        "🎯 Set specific fitness goals to challenge your body",
        "🔄 Vary your exercise routine every 4-6 weeks",
        "🥗 Optimize your nutrition with more whole foods",
        "💤 Improve sleep quality for better recovery and metabolism"
      ]
    };

    const comparison = profileData?.metabolicComparison || 'same';
    const specificTips = tips[comparison] || tips.same;
    const generalTips = tips.general.slice(0, 4); // Get first 4 general tips

    return [...specificTips, ...generalTips];
  };

  const getMetabolicAgeAdvice = () => {
    const age = profileData?.age || 0;
    const metabolicAge = profileData?.metabolicAge || age;
    const difference = metabolicAge - age;

    if (difference < -5) {
      return {
        title: "Excellent Metabolic Health! 🌟",
        message: "Your metabolism is significantly younger than your age. You're doing great!",
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200"
      };
    } else if (difference < -2) {
      return {
        title: "Good Metabolic Health! 💚",
        message: "Your metabolism is younger than your age. Keep up the good work!",
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200"
      };
    } else if (difference <= 2) {
      return {
        title: "Average Metabolic Health 📊",
        message: "Your metabolic age is close to your chronological age. There's room for improvement!",
        color: "text-blue-600",
        bgColor: "bg-blue-50 border-blue-200"
      };
    } else if (difference <= 5) {
      return {
        title: "Needs Improvement ⚠️",
        message: "Your metabolism is older than your age. Focus on the tips below to improve it!",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 border-yellow-200"
      };
    } else {
      return {
        title: "Significant Improvement Needed 🚨",
        message: "Your metabolic age is much higher than your chronological age. Start with small changes!",
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200"
      };
    }
  };

  const advice = getMetabolicAgeAdvice();
  const tips = getPersonalizedTips();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              🧬 Metabolic Age Insights
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div className={`p-4 rounded-xl border-2 ${advice.bgColor}`}>
            <h3 className={`text-lg font-semibold ${advice.color} mb-2`}>
              {advice.title}
            </h3>
            <p className="text-gray-700 mb-3">{advice.message}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600">Your Age</p>
                <p className="text-xl font-bold text-gray-800">{profileData?.age || 'N/A'} years</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Metabolic Age</p>
                <p className={`text-xl font-bold ${advice.color}`}>
                  {profileData?.metabolicAge || 'N/A'} years
                </p>
              </div>
            </div>
          </div>

          {/* What is Metabolic Age */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              🤔 What is Metabolic Age?
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Metabolic age compares your basal metabolic rate (BMR) to the average BMR of people your chronological age. 
              It's calculated using factors like your BMR efficiency, body composition (BMI), activity level, and age-related 
              metabolic changes. A lower metabolic age indicates better metabolic health.
            </p>
          </div>

          {/* Calculation Factors */}
          <div className="bg-blue-50 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              📊 How We Calculate Your Metabolic Age
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>BMR Efficiency (40% weight)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Body Composition/BMI (30% weight)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span>Activity Level (20% weight)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Age-related Decline (10% weight)</span>
              </div>
            </div>
          </div>

          {/* Personalized Tips */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              💡 Personalized Tips to Improve Your Metabolic Age
            </h3>
            <div className="space-y-3">
              {tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <span className="text-blue-500 font-semibold text-sm mt-0.5">
                    {index + 1}.
                  </span>
                  <p className="text-gray-700 text-sm leading-relaxed flex-1">
                    {tip}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Plan */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              🎯 Your 30-Day Action Plan
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Week 1-2:</strong> Start with 20-30 minutes of daily walking and improve sleep schedule</p>
              <p><strong>Week 3-4:</strong> Add 2 strength training sessions and optimize nutrition</p>
              <p><strong>Ongoing:</strong> Track progress, stay consistent, and gradually increase intensity</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center">
            💡 Remember: Small, consistent changes lead to big improvements over time. 
            Consult with healthcare professionals before making significant lifestyle changes.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MetabolicAgeTipsPopup;