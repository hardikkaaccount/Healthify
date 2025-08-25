import React, { useState } from 'react';
import { generateContent, generateStructuredContent } from '../../services/googleGenAIService';
import toast from 'react-hot-toast';

const GoogleGenAITest = () => {
  const [prompt, setPrompt] = useState('Explain the benefits of a balanced diet in 3 bullet points');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('simple');
  
  // Structured prompt state
  const [structuredPrompt, setStructuredPrompt] = useState({
    topic: 'Nutrition',
    format: 'Bullet points',
    length: 'Short',
    tone: 'Informative',
    prompt: 'List 3 benefits of eating vegetables daily'
  });

  const handleGenerateContent = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateContent(prompt);
      setResponse(result);
      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error(`Failed to generate content: ${error.message}`);
      setResponse('Error generating content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateStructuredContent = async () => {
    setIsLoading(true);
    try {
      const result = await generateStructuredContent(structuredPrompt);
      setResponse(result);
      toast.success('Structured content generated successfully!');
    } catch (error) {
      console.error('Error generating structured content:', error);
      toast.error(`Failed to generate content: ${error.message}`);
      setResponse('Error generating structured content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStructuredPromptChange = (field, value) => {
    setStructuredPrompt(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Google GenAI Test (Gemini 1.5 Pro)</h3>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 ${activeTab === 'simple' ? 'border-b-2 border-emerald-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('simple')}
        >
          Simple Prompt
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'structured' ? 'border-b-2 border-emerald-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('structured')}
        >
          Structured Prompt
        </button>
      </div>
      
      {/* Simple Prompt Tab */}
      {activeTab === 'simple' && (
        <div>
          <div className="mb-4">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="3"
              placeholder="Enter your prompt here..."
            />
          </div>
          
          <button 
            onClick={handleGenerateContent}
            disabled={isLoading}
            className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-emerald-700 transition-colors"
          >
            {isLoading ? 'Generating...' : 'Generate Content'}
          </button>
        </div>
      )}
      
      {/* Structured Prompt Tab */}
      {activeTab === 'structured' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                Topic
              </label>
              <input
                id="topic"
                value={structuredPrompt.topic}
                onChange={(e) => handleStructuredPromptChange('topic', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., Nutrition, Exercise, Mental Health"
              />
            </div>
            
            <div>
              <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                id="format"
                value={structuredPrompt.format}
                onChange={(e) => handleStructuredPromptChange('format', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Bullet points">Bullet points</option>
                <option value="Paragraph">Paragraph</option>
                <option value="Table">Table</option>
                <option value="List">List</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">
                Length
              </label>
              <select
                id="length"
                value={structuredPrompt.length}
                onChange={(e) => handleStructuredPromptChange('length', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Short">Short</option>
                <option value="Medium">Medium</option>
                <option value="Long">Long</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
                Tone
              </label>
              <select
                id="tone"
                value={structuredPrompt.tone}
                onChange={(e) => handleStructuredPromptChange('tone', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Informative">Informative</option>
                <option value="Friendly">Friendly</option>
                <option value="Professional">Professional</option>
                <option value="Casual">Casual</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="structuredPrompt" className="block text-sm font-medium text-gray-700 mb-1">
              Prompt
            </label>
            <textarea
              id="structuredPrompt"
              value={structuredPrompt.prompt}
              onChange={(e) => handleStructuredPromptChange('prompt', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="3"
              placeholder="Enter your specific request here..."
            />
          </div>
          
          <button 
            onClick={handleGenerateStructuredContent}
            disabled={isLoading}
            className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-emerald-700 transition-colors"
          >
            {isLoading ? 'Generating...' : 'Generate Structured Content'}
          </button>
        </div>
      )}
      
      {/* Response Section */}
      {response && (
        <div className="mt-4 p-3 bg-white rounded border">
          <h4 className="font-semibold">Response:</h4>
          <div className="mt-2 text-gray-700 whitespace-pre-wrap">
            {response}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleGenAITest;