import React, { useState } from 'react';
import { analyzeFoodByName } from '../../services/geminiService';
import toast from 'react-hot-toast';
import GoogleGenAITest from './GoogleGenAITest';

const TestAI = () => {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testAPI = async () => {
    setIsLoading(true);
    try {
      console.log('Testing Gemini API via backend...');
      
      const result = await analyzeFoodByName('banana', ['diabetes']);
      console.log('Test result:', result);
      
      setTestResult(result);
      toast.success('API test successful!');
    } catch (error) {
      console.error('API test failed:', error);
      toast.error(`API test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-4">
      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Gemini AI Test (Backend)</h3>
        <button 
          onClick={testAPI}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test API'}
        </button>
        
        {testResult && (
          <div className="mt-4 p-3 bg-white rounded border">
            <h4 className="font-semibold">Test Result:</h4>
            <pre className="text-sm mt-2 overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      {/* New Google GenAI Test Component */}
      <GoogleGenAITest />
    </div>
  );
};

export default TestAI;