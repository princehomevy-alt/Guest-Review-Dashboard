import { getDatabase, handleFirebaseError } from './firebase.js';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  increment
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

export async function addProperty(propertyData) {
  try {
    const db = getDatabase();
    const propertiesRef = collection(db, 'properties');
    
    const data = {
      ...propertyData,
      totalReviews: 0,
      averageRating: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(propertiesRef, data);
    console.log('Property created:', docRef.id);
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, 'Failed to create property');
    throw error;
  }
}

export async function getProperties() {
  try {
    const db = getDatabase();
    const propertiesRef = collection(db, 'properties');
    const q = query(propertiesRef, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    const properties = [];
    
    snapshot.forEach(doc => {
      properties.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return properties;
  } catch (error) {
    handleFirebaseError(error, 'Failed to fetch properties');
    throw error;
  }
}

export async function getProperty(propertyId) {
  try {
    const db = getDatabase();
    const propertyRef = doc(db, 'properties', propertyId);
    const snapshot = await getDoc(propertyRef);
    
    if (!snapshot.exists()) {
      throw new Error('Property not found');
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data()
    };
  } catch (error) {
    handleFirebaseError(error, 'Failed to fetch property');
    throw error;
  }
}

export async function updateProperty(propertyId, updates) {
  try {
    const db = getDatabase();
    const propertyRef = doc(db, 'properties', propertyId);
    
    await updateDoc(propertyRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    console.log('Property updated:', propertyId);
  } catch (error) {
    handleFirebaseError(error, 'Failed to update property');
    throw error;
  }
}

export async function deleteProperty(propertyId) {
  try {
    const db = getDatabase();
    const propertyRef = doc(db, 'properties', propertyId);
    
    await deleteDoc(propertyRef);
    console.log('Property deleted:', propertyId);
  } catch (error) {
    handleFirebaseError(error, 'Failed to delete property');
    throw error;
  }
}

export async function addReview(reviewData) {
  try {
    const db = getDatabase();
    const reviewsRef = collection(db, 'reviews');
    
    const ratingCategory = reviewData.rating <= 2 ? 'Low' : 
                          reviewData.rating <= 4 ? 'Medium' : 'High';
    
    const data = {
      ...reviewData,
      ratingCategory,
      sentiment: reviewData.sentiment || 'Neutral',
      createdAt: Timestamp.now(),
      archived: false
    };
    
    const docRef = await addDoc(reviewsRef, data);
    
    if (reviewData.propertyId) {
      await updatePropertyReviewStats(reviewData.propertyId);
    }
    
    if (reviewData.guestId) {
      await incrementGuestBookings(reviewData.guestId);
    }
    
    console.log('Review created:', docRef.id);
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, 'Failed to create review');
    throw error;
  }
}

export async function getReviews(filters = {}) {
  try {
    const db = getDatabase();
    const reviewsRef = collection(db, 'reviews');
    
    let constraints = [
      where('archived', '==', false),
      orderBy('reviewDate', 'desc')
    ];
    
    if (filters.propertyId) {
      constraints.unshift(where('propertyId', '==', filters.propertyId));
    }
    
    if (filters.platform) {
      constraints.push(where('platform', '==', filters.platform));
    }
    
    if (filters.ratingCategory) {
      constraints.push(where('ratingCategory', '==', filters.ratingCategory));
    }
    
    if (filters.sentiment) {
      constraints.push(where('sentiment', '==', filters.sentiment));
    }
    
    const q = query(reviewsRef, ...constraints);
    const snapshot = await getDocs(q);
    const reviews = [];
    
    snapshot.forEach(doc => {
      reviews.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return reviews;
  } catch (error) {
    handleFirebaseError(error, 'Failed to fetch reviews');
    throw error;
  }
}

export async function getPropertyReviews(propertyId) {
  return getReviews({ propertyId });
}

export async function getRecentReviews(days = 7) {
  try {
    const db = getDatabase();
    const reviewsRef = collection(db, 'reviews');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const q = query(
      reviewsRef,
      where('archived', '==', false),
      where('reviewDate', '>=', Timestamp.fromDate(startDate)),
      orderBy('reviewDate', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const reviews = [];
    
    snapshot.forEach(doc => {
      reviews.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return reviews;
  } catch (error) {
    handleFirebaseError(error, 'Failed to fetch recent reviews');
    throw error;
  }
}

export async function updateReview(reviewId, updates) {
  try {
    const db = getDatabase();
    const reviewRef = doc(db, 'reviews', reviewId);
    
    await updateDoc(reviewRef, updates);
    console.log('Review updated:', reviewId);
  } catch (error) {
    handleFirebaseError(error, 'Failed to update review');
    throw error;
  }
}

export async function archiveReview(reviewId) {
  return updateReview(reviewId, { archived: true });
}

export async function addGuest(guestData) {
  try {
    const db = getDatabase();
    const guestsRef = collection(db, 'guests');
    
    const data = {
      ...guestData,
      totalBookings: 1,
      loyaltyLevel: 'New',
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(guestsRef, data);
    console.log('Guest created:', docRef.id);
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, 'Failed to create guest');
    throw error;
  }
}

export async function getGuests() {
  try {
    const db = getDatabase();
    const guestsRef = collection(db, 'guests');
    const q = query(guestsRef, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    const guests = [];
    
    snapshot.forEach(doc => {
      guests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return guests;
  } catch (error) {
    handleFirebaseError(error, 'Failed to fetch guests');
    throw error;
  }
}

export async function getRepeatGuests() {
  try {
    const db = getDatabase();
    const guestsRef = collection(db, 'guests');
    const q = query(guestsRef, where('totalBookings', '>', 1));
    
    const snapshot = await getDocs(q);
    const guests = [];
    
    snapshot.forEach(doc => {
      guests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return guests;
  } catch (error) {
    handleFirebaseError(error, 'Failed to fetch repeat guests');
    throw error;
  }
}

export async function updateGuest(guestId, updates) {
  try {
    const db = getDatabase();
    const guestRef = doc(db, 'guests', guestId);
    
    await updateDoc(guestRef, updates);
    console.log('Guest updated:', guestId);
  } catch (error) {
    handleFirebaseError(error, 'Failed to update guest');
    throw error;
  }
}

async function incrementGuestBookings(guestId) {
  try {
    const db = getDatabase();
    const guestRef = doc(db, 'guests', guestId);
    
    await updateDoc(guestRef, {
      totalBookings: increment(1),
      lastStay: Timestamp.now()
    });
  } catch (error) {
    console.warn('Failed to increment guest bookings:', error);
  }
}

export async function addActionPlan(actionData) {
  try {
    const db = getDatabase();
    const actionsRef = collection(db, 'actionPlans');
    
    const data = {
      ...actionData,
      status: actionData.status || 'Pending',
      createdAt: Timestamp.now(),
      resolvedAt: null
    };
    
    const docRef = await addDoc(actionsRef, data);
    console.log('Action plan created:', docRef.id);
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, 'Failed to create action plan');
    throw error;
  }
}

export async function getActionPlans(filters = {}) {
  try {
    const db = getDatabase();
    const actionsRef = collection(db, 'actionPlans');
    
    let constraints = [orderBy('createdAt', 'desc')];
    
    if (filters.status) {
      constraints.unshift(where('status', '==', filters.status));
    }
    
    if (filters.issueCategory) {
      constraints.push(where('issueCategory', '==', filters.issueCategory));
    }
    
    const q = query(actionsRef, ...constraints);
    const snapshot = await getDocs(q);
    const actions = [];
    
    snapshot.forEach(doc => {
      actions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return actions;
  } catch (error) {
    handleFirebaseError(error, 'Failed to fetch action plans');
    throw error;
  }
}

export async function getOpenActionPlans() {
  return getActionPlans({ status: 'Pending' });
}

export async function updateActionPlan(actionId, updates) {
  try {
    const db = getDatabase();
    const actionRef = doc(db, 'actionPlans', actionId);
    
    if (updates.status === 'Completed' && !updates.resolvedAt) {
      updates.resolvedAt = Timestamp.now();
    }
    
    await updateDoc(actionRef, updates);
    console.log('Action plan updated:', actionId);
  } catch (error) {
    handleFirebaseError(error, 'Failed to update action plan');
    throw error;
  }
}

export async function deleteActionPlan(actionId) {
  try {
    const db = getDatabase();
    const actionRef = doc(db, 'actionPlans', actionId);
    
    await deleteDoc(actionRef);
    console.log('Action plan deleted:', actionId);
  } catch (error) {
    handleFirebaseError(error, 'Failed to delete action plan');
    throw error;
  }
}

async function updatePropertyReviewStats(propertyId) {
  try {
    const db = getDatabase();
    const reviews = await getPropertyReviews(propertyId);
    
    if (reviews.length === 0) return;
    
    const ratings = reviews.map(r => r.rating);
    const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    
    const propertyRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyRef, {
      totalReviews: reviews.length,
      averageRating: Math.round(averageRating * 100) / 100,
      lastReviewDate: Timestamp.now()
    });
  } catch (error) {
    console.warn('Failed to update property stats:', error);
  }
}

export async function getDashboardStats(days = 7) {
  try {
    const allReviews = await getRecentReviews(days);
    const properties = await getProperties();
    const repeatGuests = await getRepeatGuests();
    const totalGuests = await getGuests();
    
    const lowRatings = allReviews.filter(r => r.rating <= 2).length;
    const mediumRatings = allReviews.filter(r => r.rating >= 3 && r.rating <= 4).length;
    const highRatings = allReviews.filter(r => r.rating === 5).length;
    
    const ratings = allReviews.map(r => r.rating);
    const avgRating = ratings.length > 0 
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 100) / 100
      : 0;
    
    const sentiments = allReviews.reduce((acc, r) => {
      acc[r.sentiment || 'Neutral'] = (acc[r.sentiment || 'Neutral'] || 0) + 1;
      return acc;
    }, {});
    
    const platforms = allReviews.reduce((acc, r) => {
      if (!acc[r.platform]) {
        acc[r.platform] = { count: 0, totalRating: 0 };
      }
      acc[r.platform].count += 1;
      acc[r.platform].totalRating += r.rating;
      return acc;
    }, {});
    
    const platformComparison = Object.entries(platforms).map(([name, data]) => ({
      name,
      avgRating: Math.round((data.totalRating / data.count) * 100) / 100,
      count: data.count
    }));
    
    const issueFrequency = {};
    allReviews.forEach(r => {
      if (r.issueCategory && Array.isArray(r.issueCategory)) {
        r.issueCategory.forEach(issue => {
          issueFrequency[issue] = (issueFrequency[issue] || 0) + 1;
        });
      }
    });
    
    const topIssues = Object.entries(issueFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue, frequency]) => ({ issue, frequency }));
    
    const repeatGuestRatio = totalGuests.length > 0
      ? Math.round((repeatGuests.length / totalGuests.length) * 100)
      : 0;
    
    const allActions = await getActionPlans();
    const openActions = allActions.filter(a => a.status !== 'Completed').length;
    const completedActions = allActions.filter(a => a.status === 'Completed').length;
    const resolutionRate = allActions.length > 0
      ? Math.round((completedActions / allActions.length) * 100)
      : 0;
    
    return {
      period: { days, startDate: new Date(new Date().setDate(new Date().getDate() - days)) },
      reviews: {
        total: allReviews.length,
        lowRating: lowRatings,
        mediumRating: mediumRatings,
        highRating: highRatings,
        avgRating
      },
      sentiment: sentiments,
      platforms: platformComparison,
      topIssues,
      properties: {
        total: properties.length,
        avgRating: Math.round((properties.reduce((a, p) => a + (p.averageRating || 0), 0) / properties.length) * 100) / 100
      },
      guests: {
        total: totalGuests.length,
        repeat: repeatGuests.length,
        repeatRatio: repeatGuestRatio
      },
      actions: {
        total: allActions.length,
        open: openActions,
        completed: completedActions,
        resolutionRate
      }
    };
  } catch (error) {
    handleFirebaseError(error, 'Failed to calculate dashboard stats');
    throw error;
  }
}

export async function loadSampleData() {
  try {
    const db = getDatabase();
    const batch = writeBatch(db);
    
    const sampleProperties = [
      {
        propertyName: 'Sunset Beach Villa',
        location: '123 Ocean Drive, Miami, FL',
        city: 'Miami',
        platform: 'Airbnb',
        owner: 'John Smith',
        status: 'Active',
        unitType: '3BR',
        totalReviews: 0,
        averageRating: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];
    
    for (const prop of sampleProperties) {
      const propRef = doc(collection(db, 'properties'));
      batch.set(propRef, prop);
    }
    
    await batch.commit();
    console.log('Sample data loaded');
  } catch (error) {
    handleFirebaseError(error, 'Failed to load sample data');
    throw error;
  }
}
