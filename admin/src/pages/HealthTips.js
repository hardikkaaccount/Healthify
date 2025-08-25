import React, { useState } from 'react';
import { Plus, Edit, Trash2, Heart, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const HealthTips = () => {
  const [tips, setTips] = useState([
    {
      id: 1,
      title: 'Stay Hydrated',
      content: 'Drink at least 8 glasses of water daily to maintain proper hydration.',
      category: 'nutrition',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Regular Exercise',
      content: 'Aim for at least 30 minutes of moderate exercise 5 days a week.',
      category: 'fitness',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingTip, setEditingTip] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'nutrition',
    isActive: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingTip) {
      setTips(tips.map(tip => 
        tip.id === editingTip.id 
          ? { ...tip, ...formData, updatedAt: new Date().toISOString() }
          : tip
      ));
      toast.success('Health tip updated!');
    } else {
      const newTip = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      setTips([newTip, ...tips]);
      toast.success('Health tip created!');
    }
    
    setShowModal(false);
    setEditingTip(null);
    setFormData({
      title: '',
      content: '',
      category: 'nutrition',
      isActive: true
    });
  };

  const handleEdit = (tip) => {
    setEditingTip(tip);
    setFormData({
      title: tip.title,
      content: tip.content,
      category: tip.category,
      isActive: tip.isActive
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this health tip?')) {
      setTips(tips.filter(tip => tip.id !== id));
      toast.success('Health tip deleted!');
    }
  };

  const filteredTips = tips.filter(tip =>
    tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tip.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Tips</h1>
          <p className="text-gray-600">Manage health tips and wellness advice</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Health Tip</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search health tips..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTips.map((tip) => (
          <div key={tip.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  tip.category === 'nutrition' ? 'bg-green-100 text-green-800' :
                  tip.category === 'fitness' ? 'bg-blue-100 text-blue-800' :
                  tip.category === 'mental-health' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {tip.category}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(tip)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(tip.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{tip.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{tip.content}</p>
            
            <div className="flex items-center justify-between">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                tip.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {tip.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(tip.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredTips.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No health tips found</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingTip ? 'Edit Health Tip' : 'New Health Tip'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="nutrition">Nutrition</option>
                  <option value="fitness">Fitness</option>
                  <option value="mental-health">Mental Health</option>
                  <option value="general">General</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  className="mr-2"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTip(null);
                    setFormData({
                      title: '',
                      content: '',
                      category: 'nutrition',
                      isActive: true
                    });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTip ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthTips;