// Test data for demonstration
export const addSampleCard = () => {
  const sampleCard = {
    id: Date.now(),
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@rainscare.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    description: "Join our upcoming Health & Wellness Workshop! Learn about nutrition, exercise, and mental health from certified professionals. This comprehensive session will cover meal planning, workout routines, and stress management techniques.",
    category: "event",
    date: new Date().toISOString().split('T')[0],
    photo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%234F46E5'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='white' font-size='20' font-family='Arial'%3ESJ%3C/text%3E%3C/svg%3E",
    createdAt: new Date().toISOString(),
    isActive: true
  };

  const existingCards = JSON.parse(localStorage.getItem('adminCards') || '[]');
  existingCards.push(sampleCard);
  localStorage.setItem('adminCards', JSON.stringify(existingCards));
  
  console.log('Sample card added for demonstration');
  return sampleCard;
};

export const clearAllCards = () => {
  localStorage.removeItem('adminCards');
  console.log('All cards cleared');
};