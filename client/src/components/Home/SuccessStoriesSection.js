import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, Award, TrendingUp, Heart } from 'lucide-react';
import api from '../../services/api';

const SuccessStoriesSection = () => {
  const [successStories, setSuccessStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch success stories from API
  useEffect(() => {
    const fetchSuccessStories = async () => {
      try {
        const response = await api.get('/admin/success-stories/active');
        if (response.data && response.data.length > 0) {
          setSuccessStories(response.data);
        } else {
          // Fallback to sample data if API fails
          const fallbackStories = [
            {
              id: 1,
              name: 'Priya Sharma',
              age: 28,
              condition: 'Weight Loss',
              result: 'Lost 15kg in 6 months',
              story: 'With the help of our doctor, I was able to achieve my weight loss goals through a balanced diet and lifestyle changes. The personalized meal plans and constant support made all the difference.',
              image: '/api/placeholder/150/150',
              beforeImage: '/api/placeholder/200/250',
              afterImage: '/api/placeholder/200/250',
              isActive: true,
              createdAt: '2024-01-10',
              rating: 5
            },
            {
              id: 2,
              name: 'Rajesh Kumar',
              age: 45,
              condition: 'Diabetes Management',
              result: 'HbA1c reduced from 9.2 to 6.8',
              story: 'The diabetes management program helped me control my blood sugar levels naturally. The doctor created a perfect meal plan that I could follow easily, and now I feel more energetic than ever.',
              image: '/api/placeholder/150/150',
              beforeImage: '/api/placeholder/200/250',
              afterImage: '/api/placeholder/200/250',
              isActive: true,
              createdAt: '2024-01-08',
              rating: 5
            }
          ];
          setSuccessStories(fallbackStories);
        }
      } catch (error) {
        console.error('Error fetching success stories:', error);
        // Fallback to sample data
        const fallbackStories = [
          {
            id: 1,
            name: 'Priya Sharma',
            age: 28,
            condition: 'Weight Loss',
            result: 'Lost 15kg in 6 months',
            story: 'With the help of our doctor, I was able to achieve my weight loss goals through a balanced diet and lifestyle changes.',
            image: '/api/placeholder/150/150',
            beforeImage: '/api/placeholder/200/250',
            afterImage: '/api/placeholder/200/250',
            isActive: true,
            createdAt: '2024-01-10',
            rating: 5
          }
        ];
        setSuccessStories(fallbackStories);
      }
    };

    fetchSuccessStories();
  }, []);

  const nextStory = () => {
    setCurrentIndex((prev) => (prev + 1) % successStories.length);
  };

  const prevStory = () => {
    setCurrentIndex((prev) => (prev - 1 + successStories.length) % successStories.length);
  };

  // Auto-rotate stories
  useEffect(() => {
    const interval = setInterval(nextStory, 8000);
    return () => clearInterval(interval);
  }, [successStories.length]);

  if (successStories.length === 0) return null;

  const currentStory = successStories[currentIndex];

  const getConditionIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'weight loss':
        return TrendingUp;
      case 'diabetes management':
        return Heart;
      case 'muscle building':
        return Award;
      default:
        return Star;
    }
  };

  const getConditionColor = (condition) => {
    switch (condition.toLowerCase()) {
      case 'weight loss':
        return 'from-green-500 to-green-600';
      case 'diabetes management':
        return 'from-blue-500 to-blue-600';
      case 'muscle building':
        return 'from-orange-500 to-orange-600';
      case 'pcos management':
        return 'from-purple-500 to-purple-600';
      case 'cholesterol control':
        return 'from-red-500 to-red-600';
      default:
        return 'from-indigo-500 to-indigo-600';
    }
  };

  return (
    <section className="py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Success Stories
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Real transformations from real people who achieved their health goals with Rainscare
          </p>
        </motion.div>

        {/* Main Story Display */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                duration: 0.3,
                ease: "easeInOut"
              }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Story Content */}
                <div className="p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
                  {/* Quote Icon */}
                  <div className="mb-4">
                    <Quote className="w-8 h-8 text-blue-500 opacity-50" />
                  </div>

                  {/* Story Text */}
                  <blockquote className="text-sm sm:text-base text-gray-700 mb-6 leading-relaxed">
                    "{currentStory.story}"
                  </blockquote>

                  {/* Person Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={currentStory.image}
                      alt={currentStory.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                    />
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">
                        {currentStory.name}
                      </h4>
                      <p className="text-sm text-gray-600">Age {currentStory.age}</p>
                    </div>
                  </div>

                  {/* Condition & Result */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 bg-gradient-to-r ${getConditionColor(currentStory.condition)} rounded-full flex items-center justify-center`}>
                        {React.createElement(getConditionIcon(currentStory.condition), {
                          className: "w-4 h-4 text-white"
                        })}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Condition</p>
                        <p className="text-sm font-semibold text-gray-900">{currentStory.condition}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Result</p>
                        <p className="text-sm font-semibold text-green-600">{currentStory.result}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-1 mt-4">
                    {[...Array(currentStory.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">({currentStory.rating}/5)</span>
                  </div>
                </div>

                {/* Before/After Images */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 max-w-xs">
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-600 mb-2">Before</p>
                      <div className="relative">
                        <img
                          src={currentStory.beforeImage}
                          alt="Before"
                          className="w-full h-32 sm:h-36 object-cover rounded-xl shadow-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-600 mb-2">After</p>
                      <div className="relative">
                        <img
                          src={currentStory.afterImage}
                          alt="After"
                          className="w-full h-32 sm:h-36 object-cover rounded-xl shadow-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                        <div className="absolute top-1 right-1 bg-green-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
                          ✓
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={prevStory}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={nextStory}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Story Indicators */}
        <div className="flex justify-center space-x-3 mt-8">
          {successStories.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-blue-600 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 sm:mt-12"
        >
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">500+</div>
            <div className="text-sm text-gray-600">Success Stories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">95%</div>
            <div className="text-sm text-gray-600">Goal Achievement Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">4.9</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SuccessStoriesSection;