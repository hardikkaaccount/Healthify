const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// Get Firestore instance
const db = admin.firestore();

// Handle preflight requests for all admin routes
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-admin-api-key, Authorization');
  res.sendStatus(200);
});

// Collections
const COLLECTIONS = {
  ANNOUNCEMENTS: 'announcements',
  HEALTH_TIPS: 'healthTips',
  SUCCESS_STORIES: 'successStories',
  DOCTORS: 'doctors',
  UPDATES: 'updates'
};

// ==================== ANNOUNCEMENTS ====================

// Get all announcements
router.get('/announcements', async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTIONS.ANNOUNCEMENTS)
      .orderBy('createdAt', 'desc')
      .get();
    
    const announcements = [];
    snapshot.forEach(doc => {
      announcements.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Get active announcements for frontend
router.get('/announcements/active', async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTIONS.ANNOUNCEMENTS)
      .where('isActive', '==', true)
      .orderBy('priority', 'desc')
      .orderBy('createdAt', 'desc')
      .get();
    
    const announcements = [];
    snapshot.forEach(doc => {
      announcements.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching active announcements:', error);
    res.status(500).json({ error: 'Failed to fetch active announcements' });
  }
});

// Create announcement
router.post('/announcements', async (req, res) => {
  try {
    const announcementData = {
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      views: 0
    };
    
    const docRef = await db.collection(COLLECTIONS.ANNOUNCEMENTS).add(announcementData);
    
    res.status(201).json({ 
      id: docRef.id, 
      message: 'Announcement created successfully' 
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// Update announcement
router.put('/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection(COLLECTIONS.ANNOUNCEMENTS).doc(id).update(updateData);
    
    res.json({ message: 'Announcement updated successfully' });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

// Delete announcement
router.delete('/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(COLLECTIONS.ANNOUNCEMENTS).doc(id).delete();
    
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

// Increment announcement views
router.post('/announcements/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(COLLECTIONS.ANNOUNCEMENTS).doc(id).update({
      views: admin.firestore.FieldValue.increment(1)
    });
    
    res.json({ message: 'View count updated' });
  } catch (error) {
    console.error('Error updating view count:', error);
    res.status(500).json({ error: 'Failed to update view count' });
  }
});

// ==================== HEALTH TIPS ====================

// Get active health tips for frontend
router.get('/health-tips/active', async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTIONS.HEALTH_TIPS)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    const tips = [];
    snapshot.forEach(doc => {
      tips.push({ id: doc.id, ...doc.data() });
    });

    res.json(tips);
  } catch (error) {
    console.error('Error fetching active health tips:', error);
    res.status(500).json({ error: 'Failed to fetch active health tips' });
  }
});

// ==================== SUCCESS STORIES ====================

// Get active success stories for frontend
router.get('/success-stories/active', async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTIONS.SUCCESS_STORIES)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    const stories = [];
    snapshot.forEach(doc => {
      stories.push({ id: doc.id, ...doc.data() });
    });

    res.json(stories);
  } catch (error) {
    console.error('Error fetching active success stories:', error);
    res.status(500).json({ error: 'Failed to fetch active success stories' });
  }
});

// ==================== UPDATES ====================

// Get all updates
router.get('/updates', async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTIONS.UPDATES)
      .orderBy('createdAt', 'desc')
      .get();
    
    const updates = [];
    snapshot.forEach(doc => {
      updates.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(updates);
  } catch (error) {
    console.error('Error fetching updates:', error);
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
});

// Get active updates for frontend
router.get('/updates/active', async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTIONS.UPDATES)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(10) // Limit to recent updates
      .get();
    
    const updates = [];
    snapshot.forEach(doc => {
      updates.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(updates);
  } catch (error) {
    console.error('Error fetching active updates:', error);
    res.status(500).json({ error: 'Failed to fetch active updates' });
  }
});

// Create update
router.post('/updates', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection(COLLECTIONS.UPDATES).add(updateData);
    
    res.status(201).json({ 
      id: docRef.id, 
      message: 'Update created successfully' 
    });
  } catch (error) {
    console.error('Error creating update:', error);
    res.status(500).json({ error: 'Failed to create update' });
  }
});

// Update update
router.put('/updates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection(COLLECTIONS.UPDATES).doc(id).update(updateData);
    
    res.json({ message: 'Update updated successfully' });
  } catch (error) {
    console.error('Error updating update:', error);
    res.status(500).json({ error: 'Failed to update update' });
  }
});

// Delete update
router.delete('/updates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(COLLECTIONS.UPDATES).doc(id).delete();
    
    res.json({ message: 'Update deleted successfully' });
  } catch (error) {
    console.error('Error deleting update:', error);
    res.status(500).json({ error: 'Failed to delete update' });
  }
});

// ==================== DASHBOARD STATS ====================

// Get dashboard statistics
router.get('/dashboard/stats', asyncHandler(async (req, res) => {
  try {
    // Get user count
    const usersSnapshot = await admin.auth().listUsers();
    const totalUsers = usersSnapshot.users.length;
    
    // Get active users (users who logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = usersSnapshot.users.filter(user => 
      user.metadata.lastSignInTime && 
      new Date(user.metadata.lastSignInTime) > thirtyDaysAgo
    ).length;

    // Get content counts
    const [announcementsSnapshot, updatesSnapshot, healthTipsSnapshot, successStoriesSnapshot] = await Promise.all([
      db.collection(COLLECTIONS.ANNOUNCEMENTS).get(),
      db.collection(COLLECTIONS.UPDATES).get(),
      db.collection('healthTips').get(),
      db.collection('successStories').get()
    ]);

    const totalContent = announcementsSnapshot.size + updatesSnapshot.size + 
                        healthTipsSnapshot.size + successStoriesSnapshot.size;

    // Calculate content views
    let totalViews = 0;
    announcementsSnapshot.forEach(doc => {
      totalViews += doc.data().views || 0;
    });

    // Get daily active users (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const dailyActiveUsers = usersSnapshot.users.filter(user => 
      user.metadata.lastSignInTime && 
      new Date(user.metadata.lastSignInTime) > oneDayAgo
    ).length;

    // Calculate weekly growth
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyNewUsers = usersSnapshot.users.filter(user => 
      new Date(user.metadata.creationTime) > oneWeekAgo
    ).length;
    
    const weeklyGrowth = totalUsers > 0 ? (weeklyNewUsers / totalUsers) * 100 : 0;

    const stats = {
      totalUsers,
      activeUsers,
      totalContent,
      systemUptime: '99.9%', // This would come from monitoring service
      dailyActiveUsers,
      weeklyGrowth: Math.round(weeklyGrowth * 10) / 10,
      contentViews: totalViews,
      errorRate: 0.1 // This would come from error monitoring
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
}));

// ==================== USER MANAGEMENT ====================

// Get users with pagination and search
router.get('/users', asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const pageSize = Math.min(parseInt(limit), 100); // Max 100 users per page
    
    // Get all users from Firebase Auth
    const listUsersResult = await admin.auth().listUsers();
    let users = listUsersResult.users;

    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => 
        (user.displayName && user.displayName.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
      );
    }

    // Calculate pagination
    const totalUsers = users.length;
    const totalPages = Math.ceil(totalUsers / pageSize);
    const startIndex = (parseInt(page) - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    // Get paginated users
    const paginatedUsers = users.slice(startIndex, endIndex);

    // Format user data
    const formattedUsers = paginatedUsers.map(user => ({
      id: user.uid,
      name: user.displayName || 'Unknown',
      email: user.email || 'No email',
      phone: user.phoneNumber || 'No phone',
      status: user.disabled ? 'suspended' : 'active',
      joinDate: new Date(user.metadata.creationTime).toISOString().split('T')[0],
      lastActive: user.metadata.lastSignInTime ? 
        new Date(user.metadata.lastSignInTime).toISOString().split('T')[0] : 'Never',
      emailVerified: user.emailVerified,
      provider: user.providerData.map(p => p.providerId).join(', ') || 'email'
    }));

    res.json({
      users: formattedUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}));

// Get user details
router.get('/users/:userId', asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user from Firebase Auth
    const userRecord = await admin.auth().getUser(userId);
    
    // Get user profile data from Firestore if exists
    let profileData = {};
    try {
      const profileDoc = await db.collection('users').doc(userId).get();
      if (profileDoc.exists) {
        profileData = profileDoc.data();
      }
    } catch (error) {
      console.log('No profile data found for user:', userId);
    }

    // Format user data
    const userData = {
      id: userRecord.uid,
      name: userRecord.displayName || profileData.name || 'Unknown',
      email: userRecord.email || 'No email',
      phone: userRecord.phoneNumber || profileData.phone || 'No phone',
      status: userRecord.disabled ? 'suspended' : 'active',
      joinDate: new Date(userRecord.metadata.creationTime).toISOString().split('T')[0],
      lastActive: userRecord.metadata.lastSignInTime ? 
        new Date(userRecord.metadata.lastSignInTime).toISOString().split('T')[0] : 'Never',
      emailVerified: userRecord.emailVerified,
      provider: userRecord.providerData.map(p => p.providerId).join(', ') || 'email',
      // Profile data
      age: profileData.age || null,
      location: profileData.location || 'Not specified',
      healthGoals: profileData.healthGoals || [],
      subscription: profileData.subscription || 'Free',
      profileComplete: profileData.profileComplete || 0,
      totalSessions: profileData.totalSessions || 0
    };

    res.json(userData);
  } catch (error) {
    console.error('Error fetching user details:', error);
    if (error.code === 'auth/user-not-found') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch user details' });
    }
  }
}));

// Update user status
router.put('/users/:userId/status', asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be active or suspended' });
    }

    // Update user in Firebase Auth
    await admin.auth().updateUser(userId, {
      disabled: status === 'suspended'
    });

    res.json({ 
      message: `User ${status === 'active' ? 'activated' : 'suspended'} successfully` 
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    if (error.code === 'auth/user-not-found') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Failed to update user status' });
    }
  }
}));

// Delete user
router.delete('/users/:userId', asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete user from Firebase Auth
    await admin.auth().deleteUser(userId);

    // Delete user profile data from Firestore
    try {
      await db.collection('users').doc(userId).delete();
    } catch (error) {
      console.log('No profile data to delete for user:', userId);
    }

    // Delete user's food diary entries
    try {
      const foodDiaryQuery = db.collection('foodDiary').where('userId', '==', userId);
      const foodDiarySnapshot = await foodDiaryQuery.get();
      
      const batch = db.batch();
      foodDiarySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      console.log('Error deleting user food diary:', error);
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error.code === 'auth/user-not-found') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
}));

// ==================== ANALYTICS ====================

// Get user growth statistics
router.get('/analytics/user-growth', asyncHandler(async (req, res) => {
  try {
    const users = await admin.auth().listUsers();
    
    // Group users by month for the last 6 months
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        year: date.getFullYear(),
        timestamp: date.getTime()
      });
    }

    const growthData = months.map(month => {
      const nextMonth = new Date(month.timestamp);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const newUsers = users.users.filter(user => {
        const creationTime = new Date(user.metadata.creationTime).getTime();
        return creationTime >= month.timestamp && creationTime < nextMonth.getTime();
      }).length;

      const activeUsers = users.users.filter(user => {
        if (!user.metadata.lastSignInTime) return false;
        const lastSignIn = new Date(user.metadata.lastSignInTime).getTime();
        return lastSignIn >= month.timestamp && lastSignIn < nextMonth.getTime();
      }).length;

      return {
        month: month.month,
        newUsers,
        activeUsers
      };
    });

    res.json({
      labels: growthData.map(d => d.month),
      datasets: [
        {
          label: 'New Users',
          data: growthData.map(d => d.newUsers),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Active Users',
          data: growthData.map(d => d.activeUsers),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching user growth stats:', error);
    res.status(500).json({ error: 'Failed to fetch user growth statistics' });
  }
}));

// Get content engagement statistics
router.get('/analytics/content-engagement', asyncHandler(async (req, res) => {
  try {
    const [announcementsSnapshot, updatesSnapshot, healthTipsSnapshot, successStoriesSnapshot] = await Promise.all([
      db.collection(COLLECTIONS.ANNOUNCEMENTS).get(),
      db.collection(COLLECTIONS.UPDATES).get(),
      db.collection('healthTips').get(),
      db.collection('successStories').get()
    ]);

    const engagementData = {
      labels: ['Announcements', 'Updates', 'Health Tips', 'Success Stories'],
      datasets: [
        {
          data: [
            announcementsSnapshot.size,
            updatesSnapshot.size,
            healthTipsSnapshot.size,
            successStoriesSnapshot.size
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderWidth: 0,
        },
      ],
    };

    res.json(engagementData);
  } catch (error) {
    console.error('Error fetching content engagement stats:', error);
    res.status(500).json({ error: 'Failed to fetch content engagement statistics' });
  }
}));

// ==================== SYSTEM MANAGEMENT ====================

// Get server statistics
router.get('/system/stats', asyncHandler(async (req, res) => {
  try {
    const stats = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString()
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching server stats:', error);
    res.status(500).json({ error: 'Failed to fetch server statistics' });
  }
}));

// Clear cache (placeholder - implement based on your caching strategy)
router.post('/system/clear-cache', asyncHandler(async (req, res) => {
  try {
    // Implement cache clearing logic here
    // This could clear Redis cache, memory cache, etc.
    
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
}));

module.exports = router;