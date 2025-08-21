// Mock data for the Rewarded Offers System

export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  badge: string;
  joinDate: string;
  submissionsCount: number;
  monthlySubmissions: number;
}

export interface SubmittedOffer {
  id: string;
  userId: string;
  userName: string;
  productName: string;
  currentPrice: number;
  submittedPrice: number;
  savings: number;
  storeName: string;
  status: 'pending' | 'verified' | 'rejected' | 'duplicate';
  submittedAt: string;
  verifiedAt?: string;
  proofImages: string[];
  adminNotes?: string;
  category: string;
  points?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  pointsRequired: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  type: 'submission' | 'verification' | 'badge_earned' | 'points_earned';
  title: string;
  description: string;
  timestamp: string;
  points?: number;
  badgeId?: string;
}

// Mock current user
export const currentUser: User = {
  id: 'user-1',
  name: 'Ana Popescu',
  email: 'ana.popescu@email.com',
  points: 1250,
  badge: 'gold',
  joinDate: '2024-01-15',
  submissionsCount: 47,
  monthlySubmissions: 12
};

// Mock badges
export const badges: Badge[] = [
  {
    id: 'bronze',
    name: 'Bronze Hunter',
    description: 'Submit 5 verified offers',
    icon: '🥉',
    pointsRequired: 100,
    color: 'amber'
  },
  {
    id: 'silver',
    name: 'Silver Sleuth',
    description: 'Submit 15 verified offers',
    icon: '🥈',
    pointsRequired: 500,
    color: 'slate'
  },
  {
    id: 'gold',
    name: 'Gold Guardian',
    description: 'Submit 30 verified offers',
    icon: '🥇',
    pointsRequired: 1000,
    color: 'yellow'
  },
  {
    id: 'diamond',
    name: 'Diamond Detective',
    description: 'Submit 75 verified offers',
    icon: '💎',
    pointsRequired: 2500,
    color: 'blue'
  }
];

// Mock submitted offers
export const submittedOffers: SubmittedOffer[] = [
  {
    id: 'offer-1',
    userId: 'user-1',
    userName: 'Ana Popescu',
    productName: 'Laptele Zuzu 1.5% 1L',
    currentPrice: 4.99,
    submittedPrice: 3.99,
    savings: 1.00,
    storeName: 'Kaufland Baneasa',
    status: 'verified',
    submittedAt: '2024-01-20T10:30:00Z',
    verifiedAt: '2024-01-20T14:15:00Z',
    proofImages: ['/api/placeholder/300/400', '/api/placeholder/300/400'],
    category: 'Lactate',
    points: 25,
    adminNotes: 'Valid offer, good proof quality'
  },
  {
    id: 'offer-2',
    userId: 'user-2',
    userName: 'Mihai Ionescu',
    productName: 'Pâine integrală Vel Pitar 500g',
    currentPrice: 5.49,
    submittedPrice: 4.29,
    savings: 1.20,
    storeName: 'Carrefour Orhideea',
    status: 'pending',
    submittedAt: '2024-01-21T16:45:00Z',
    proofImages: ['/api/placeholder/300/400'],
    category: 'Panificație'
  },
  {
    id: 'offer-3',
    userId: 'user-3',
    userName: 'Elena Stancu',
    productName: 'Detergent Ariel Mountain Spring 2.2L',
    currentPrice: 32.99,
    submittedPrice: 24.99,
    savings: 8.00,
    storeName: 'Auchan Titan',
    status: 'rejected',
    submittedAt: '2024-01-19T09:15:00Z',
    proofImages: ['/api/placeholder/300/400'],
    category: 'Curățenie',
    adminNotes: 'Price appears to be from old promotion, not current'
  },
  {
    id: 'offer-4',
    userId: 'user-1',
    userName: 'Ana Popescu',
    productName: 'Iaurt Danone cu fructe 125g',
    currentPrice: 2.29,
    submittedPrice: 1.89,
    savings: 0.40,
    storeName: 'Mega Image Floreasca',
    status: 'duplicate',
    submittedAt: '2024-01-18T13:20:00Z',
    proofImages: ['/api/placeholder/300/400'],
    category: 'Lactate',
    adminNotes: 'Similar offer already exists for this product'
  },
  {
    id: 'offer-5',
    userId: 'user-4',
    userName: 'Cristian Popescu',
    productName: 'Carne tocată vită/porc 500g',
    currentPrice: 18.99,
    submittedPrice: 15.99,
    savings: 3.00,
    storeName: 'Lidl Pipera',
    status: 'pending',
    submittedAt: '2024-01-21T11:30:00Z',
    proofImages: ['/api/placeholder/300/400', '/api/placeholder/300/400'],
    category: 'Carne'
  }
];

// Mock leaderboard users
export const leaderboardUsers: User[] = [
  {
    id: 'user-5',
    name: 'Maria Georgescu',
    email: 'maria.g@email.com',
    points: 3480,
    badge: 'diamond',
    joinDate: '2023-11-10',
    submissionsCount: 134,
    monthlySubmissions: 18
  },
  {
    id: 'user-6', 
    name: 'Andrei Munteanu',
    email: 'andrei.m@email.com',
    points: 2890,
    badge: 'diamond',
    joinDate: '2023-12-05',
    submissionsCount: 98,
    monthlySubmissions: 15
  },
  {
    id: 'user-1',
    name: 'Ana Popescu',
    email: 'ana.popescu@email.com',
    points: 1250,
    badge: 'gold',
    joinDate: '2024-01-15',
    submissionsCount: 47,
    monthlySubmissions: 12
  },
  {
    id: 'user-7',
    name: 'Radu Constantinescu',
    email: 'radu.c@email.com',
    points: 980,
    badge: 'silver',
    joinDate: '2024-01-08',
    submissionsCount: 32,
    monthlySubmissions: 8
  },
  {
    id: 'user-8',
    name: 'Ioana Vlad',
    email: 'ioana.v@email.com',
    points: 750,
    badge: 'silver',
    joinDate: '2024-01-22',
    submissionsCount: 28,
    monthlySubmissions: 6
  }
];

// Mock activity timeline
export const userActivity: ActivityItem[] = [
  {
    id: 'activity-1',
    type: 'verification',
    title: 'Offer Verified',
    description: 'Your offer for Laptele Zuzu was verified and earned 25 points',
    timestamp: '2024-01-20T14:15:00Z',
    points: 25
  },
  {
    id: 'activity-2',
    type: 'submission',
    title: 'New Offer Submitted',
    description: 'Submitted offer for Iaurt Danone at Mega Image',
    timestamp: '2024-01-18T13:20:00Z'
  },
  {
    id: 'activity-3',
    type: 'badge_earned',
    title: 'Badge Earned!',
    description: 'Congratulations! You earned the Gold Guardian badge',
    timestamp: '2024-01-15T16:30:00Z',
    badgeId: 'gold'
  },
  {
    id: 'activity-4',
    type: 'points_earned',
    title: 'Points Earned',
    description: 'Earned 30 points from verified offer',
    timestamp: '2024-01-12T11:45:00Z',
    points: 30
  }
];

// Helper functions
export const getOffersByStatus = (status: SubmittedOffer['status']) => {
  return submittedOffers.filter(offer => offer.status === status);
};

export const getPendingOffersCount = () => {
  return submittedOffers.filter(offer => offer.status === 'pending').length;
};

export const getUserBadge = (userId: string) => {
  const user = leaderboardUsers.find(u => u.id === userId) || currentUser;
  return badges.find(badge => badge.id === user.badge);
};

export const getNextBadge = (currentBadgeId: string) => {
  const currentIndex = badges.findIndex(badge => badge.id === currentBadgeId);
  return currentIndex < badges.length - 1 ? badges[currentIndex + 1] : null;
};

export const getStatusColor = (status: SubmittedOffer['status']) => {
  switch (status) {
    case 'pending': return 'amber';
    case 'verified': return 'green';
    case 'rejected': return 'red';
    case 'duplicate': return 'orange';
    default: return 'gray';
  }
};

// Demo data reset function
export const resetDemoData = () => {
  // In a real app, this would reset localStorage or call an API
  console.log('Demo data reset (mocked)');
};