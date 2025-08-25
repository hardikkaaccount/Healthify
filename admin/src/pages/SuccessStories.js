import React, { useState } from 'react';
import { Plus, Edit, Trash2, Trophy, Search, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const SuccessStories = () => {
  const [stories, setStories] = useState([
    {
      id: 1,
      title: 'Lost 30 pounds in 6 months',
      content: 'Amazing transformation journey with Rainscare...',
      userName: 'Sarah Johnson',
      beforeWeight: 180,
      afterWeight: 150,
      duration: '6 months',
      isApproved: true,
      isFeatured: false,
      createdAt: new Date().toISOString()
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    userName: '',
    beforeWeight: '',
    afterWeight: '',
    duration: '',
    isApproved: true,
    isFeatured: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingStory) {
      setStories(stories.map(story => 
        story.id === editingStory.id 
          ? { ...story, ...formData, updatedAt: new Date().toISOString() }
          : story
      ));
      toast.success('Success story updated!');
    } else {
      const newStory = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      setStories([newStory, ...stories]);
      toast.success('Success story created!');
    }
    
    setShowModal(false);
    setEditingStory(null);
    setFormData({
      title: '',
      content: '',
      userName: '',
      beforeWeight: '',
      afterWeight: '',
      duration: '',
      isApproved: true,
      isFeatured: false
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Success Stories</h1>
          <p className="text-gray-600">Manage user success stories and testimonials</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Story</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search success stories..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stories.map((story) => (
          <div key={story.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                {story.isFeatured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingStory(story);
                    setFormData(story);
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this story?')) {
                      setStories(stories.filter(s => s.id !== story.id));
                      toast.success('Story deleted!');
                    }
                  }}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{story.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{story.content}</p>
            
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">User:</span> {story.userName}</p>
              <p><span className="font-medium">Weight Loss:</span> {story.beforeWeight - story.afterWeight} lbs</p>
              <p><span className="font-medium">Duration:</span> {story.duration}</p>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                story.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {story.isApproved ? 'Approved' : 'Pending'}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(story.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingStory ? 'Edit Success Story' : 'New Success Story'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              
              <textarea
                placeholder="Story content"
                className="form-textarea"
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                required
              />
              
              <input
                type="text"
                placeholder="User name"
                className="form-input"
                value={formData.userName}
                onChange={(e) => setFormData({...formData, userName: e.target.value})}
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Before weight"
                  className="form-input"
                  value={formData.beforeWeight}
                  onChange={(e) => setFormData({...formData, beforeWeight: e.target.value})}
                />
                <input
                  type="number"
                  placeholder="After weight"
                  className="form-input"
                  value={formData.afterWeight}
                  onChange={(e) => setFormData({...formData, afterWeight: e.target.value})}
                />
              </div>
              
              <input
                type="text"
                placeholder="Duration (e.g., 6 months)"
                className="form-input"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              />
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.isApproved}
                    onChange={(e) => setFormData({...formData, isApproved: e.target.checked})}
                  />
                  <span className="text-sm">Approved</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                  />
                  <span className="text-sm">Featured</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingStory(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingStory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuccessStories;