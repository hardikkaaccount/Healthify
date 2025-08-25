import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn,
  AlertCircle,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';
import '../styles/Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // For demo purposes, use hardcoded admin credentials
      // In production, this should authenticate against your backend
      if (formData.email === 'admin@rainscare.com' && formData.password === 'admin123') {
        const mockToken = 'admin-token-' + Date.now();
        onLogin(mockToken);
        toast.success('Welcome back, Admin!');
      } else {
        // Try to authenticate with the backend
        try {
          const response = await adminService.login(formData);
          onLogin(response.token);
          toast.success('Login successful!');
        } catch (error) {
          // Fallback to demo credentials
          if (formData.email === 'admin@rainscare.com' && formData.password === 'admin123') {
            const mockToken = 'admin-token-' + Date.now();
            onLogin(mockToken);
            toast.success('Welcome back, Admin! (Demo Mode)');
          } else {
            throw new Error('Invalid credentials');
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
      setErrors({
        general: 'Invalid email or password. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'admin@rainscare.com',
      password: 'admin123'
    });
    toast.success('Demo credentials filled!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100, -20],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Login Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="login-card bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden"
        >
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
          <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 float-animation pulse-glow"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2 shimmer-text login-text"
            >
              Admin Portal
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-200 login-text"
            >
              Sign in to access the admin dashboard
            </motion.p>
          </div>

          {/* Demo Credentials Banner */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/40 rounded-xl p-4 mb-6 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2 mb-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <AlertCircle className="w-5 h-5 text-blue-300" />
              </motion.div>
              <span className="text-blue-200 text-sm font-semibold">Demo Access Available</span>
            </div>
            <p className="text-blue-100 text-sm mb-3 leading-relaxed">
              Use demo credentials to explore the admin panel features
            </p>
            <motion.button
              onClick={handleDemoLogin}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="demo-button bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Fill Demo Credentials
            </motion.button>
          </motion.div>

          {/* Login Form */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {/* General Error */}
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-400/30 rounded-lg p-3"
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-300 text-sm">{errors.general}</span>
                </div>
              </motion.div>
            )}

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
              className="form-field"
            >
              <label className="block text-gray-200 text-sm font-semibold mb-2 login-text">
                Email Address
              </label>
              <div className="relative">
                <motion.div
                  animate={{ x: [0, 2, -2, 0] }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
                </motion.div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`login-input w-full pl-10 pr-4 py-3 bg-white/15 backdrop-blur-sm border-2 ${
                    errors.email ? 'border-red-400 bg-red-500/10' : 'border-white/30 hover:border-white/50 focus:border-blue-400'
                  } rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 shadow-lg`}
                  placeholder="Enter your email address"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-red-300 text-sm font-medium error-message"
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
              className="form-field"
            >
              <label className="block text-gray-200 text-sm font-semibold mb-2 login-text">
                Password
              </label>
              <div className="relative">
                <motion.div
                  animate={{ x: [0, 2, -2, 0] }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
                </motion.div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`login-input w-full pl-10 pr-12 py-3 bg-white/15 backdrop-blur-sm border-2 ${
                    errors.password ? 'border-red-400 bg-red-500/10' : 'border-white/30 hover:border-white/50 focus:border-blue-400'
                  } rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 shadow-lg`}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors duration-200 p-1 rounded-md hover:bg-white/10"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-red-300 text-sm font-medium error-message"
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="login-button pulse-glow w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3 relative overflow-hidden group"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader className="w-5 h-5" />
                  </motion.div>
                  <span className="text-lg">Signing in...</span>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <LogIn className="w-5 h-5" />
                  </motion.div>
                  <span className="text-lg">Sign In to Dashboard</span>
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Demo Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, type: "spring", stiffness: 100 }}
            className="mt-8 pt-6 border-t border-white/20"
          >
            <div className="text-center">
              <motion.p
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-gray-200 text-sm font-medium mb-3"
              >
                Quick Access Credentials:
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="demo-credentials bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-sm rounded-xl p-4 border border-gray-600/30 shadow-lg"
              >
                <div className="space-y-2">
                  <p className="text-gray-200 text-sm">
                    <span className="text-gray-400">Email:</span> 
                    <span className="text-blue-300 font-mono ml-2 bg-blue-900/30 px-2 py-1 rounded">admin@rainscare.com</span>
                  </p>
                  <p className="text-gray-200 text-sm">
                    <span className="text-gray-400">Password:</span> 
                    <span className="text-purple-300 font-mono ml-2 bg-purple-900/30 px-2 py-1 rounded">admin123</span>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-8"
        >
          <p className="text-gray-400 text-sm">
            © 2024 Rainscare Admin Portal. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;