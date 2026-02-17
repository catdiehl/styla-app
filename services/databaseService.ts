import { collection, doc, setDoc, getDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection names
export const COLLECTIONS = {
  OWNER_SETTINGS: 'ownerSettings'
} as const;

// Database error handling
class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Owner Settings for business logic configuration
export interface OwnerSettings {
  id: string; // Owner ID
  businessLogic: {
    autoConfirmBookings: boolean;
    advanceBookingDays: number;
    lastMinuteCancellationHours: number;
    sameDayBooking: boolean;
    maxBookingsPerDay: number;
    bufferTime: number; // minutes between appointments
    requireDeposit: boolean;
    depositPercentage: number;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    bookingConfirmationEmail: boolean;
    reminderHours: number[];
  };
  paymentSettings: {
    acceptCash: boolean;
    acceptCard: boolean;
    acceptOnline: boolean;
    currency: string;
  };
  profileCustomization: {
    profilePic?: string;
    profileBackground?: string | [string, string]; // Solid color or gradient
    textColor?: string;
    fontFamily?: string;
    markerColor?: string;
    galleryImages?: string[];
    // Optional banner image shown at top of profile page
    bannerImage?: string;
    socialLinks?: {
      instagram?: { enabled: boolean; url?: string; stream?: boolean; };
      tiktok?: { enabled: boolean; url?: string; stream?: boolean; };
      website?: { enabled: boolean; url?: string; };
    };
  };
  businessProfile: {
    businessName?: string;
    firstName?: string;
    lastName?: string;
    // Optional bio/about text for the owner
    bio?: string;
    businessAddress?: string;
    businessLat?: number;
    businessLong?: number;
  };
  // New tag system - array of 6-digit tag IDs
  tagIds?: string[];
  // Additional fields from original data
  favs?: number[]; // Array of favorite owner IDs
  serviceTypes?: any[]; // Service types for booking
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class OwnerSettingsDatabase {
  private static getCollection() {
    if (!db) throw new DatabaseError('Firestore not initialized');
    return collection(db, COLLECTIONS.OWNER_SETTINGS);
  }

  // Recursively remove undefined values from objects/arrays so Firestore accepts the payload
  private static removeUndefinedDeep(value: any): any {
    if (Array.isArray(value)) {
      return value.map(v => this.removeUndefinedDeep(v));
    }
    if (value && typeof value === 'object') {
      const entries = Object.entries(value)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, this.removeUndefinedDeep(v)]);
      return Object.fromEntries(entries);
    }
    return value;
  }

  static async createOrUpdate(settings: OwnerSettings): Promise<void> {
    try {
      console.log('DatabaseService.createOrUpdate called with settings ID:', settings.id);
      console.log('Database reference (db):', db ? 'initialized' : 'not initialized');
      
      if (!db) throw new DatabaseError('Firestore not initialized');
      
      console.log('Creating document reference for collection:', COLLECTIONS.OWNER_SETTINGS);
      const docRef = doc(db, COLLECTIONS.OWNER_SETTINGS, settings.id);
      console.log('Document reference created:', docRef.path);
      
      console.log('About to call setDoc with merge: true');
      // Use setDoc to create or update the document with the specific ID
      const payload = this.removeUndefinedDeep({
        ...settings,
        updatedAt: Timestamp.now()
      });
      await setDoc(docRef, payload, { merge: true });
      
      console.log('setDoc completed successfully');
    } catch (error) {
      console.error('DatabaseService.createOrUpdate error details:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      throw new DatabaseError('Failed to save owner settings', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  static async getById(ownerId: string): Promise<OwnerSettings | null> {
    try {
      if (!db) throw new DatabaseError('Firestore not initialized');
      const docRef = doc(db, COLLECTIONS.OWNER_SETTINGS, ownerId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as OwnerSettings;
      }
      return null;
    } catch (error) {
      throw new DatabaseError('Failed to get owner settings', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  static async getAllOwners(): Promise<OwnerSettings[]> {
    try {
      if (!db) throw new DatabaseError('Firestore not initialized');
      const querySnapshot = await getDocs(this.getCollection());
      return querySnapshot.docs.map(doc => doc.data() as OwnerSettings);
    } catch (error) {
      throw new DatabaseError('Failed to get all owners', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  static async getDefaults(ownerId: string): Promise<OwnerSettings> {
    return {
      id: ownerId,
      businessLogic: {
        autoConfirmBookings: false, // Default: require stylist approval
        advanceBookingDays: 30,
        lastMinuteCancellationHours: 24,
        sameDayBooking: false,
        maxBookingsPerDay: 8,
        bufferTime: 15,
        requireDeposit: true,
        depositPercentage: 50
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        bookingConfirmationEmail: true,
        reminderHours: [24, 2]
      },
      paymentSettings: {
        acceptCash: true,
        acceptCard: true,
        acceptOnline: true,
        currency: 'USD'
      },
      profileCustomization: {
        profilePic: 'default.png',
        profileBackground: '#ffffff',
        textColor: '#000000',
        fontFamily: 'System',
        markerColor: '#007AFF',
        galleryImages: []
      },
      businessProfile: {
        businessName: 'My Business',
        businessAddress: '',
        businessLat: 0,
        businessLong: 0
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
  }

  // Initialize owner settings with data from hardcoded UserData
  static async initializeWithUserData(ownerId: string, userData: {
    businessName: string;
    firstName: string;
    lastName: string;
    businessAddress: string;
    businessLat: number;
    businessLong: number;
    profilePic: string;
    galleryImages: string[];
    profileBackground: string | [string, string];
    textColor?: string;
    fontFamily?: string;
    markerColor?: string;
  }): Promise<OwnerSettings> {
    return {
      id: ownerId,
      businessLogic: {
        autoConfirmBookings: false,
        advanceBookingDays: 30,
        lastMinuteCancellationHours: 24,
        sameDayBooking: false,
        maxBookingsPerDay: 8,
        bufferTime: 15,
        requireDeposit: true,
        depositPercentage: 50
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        bookingConfirmationEmail: true,
        reminderHours: [24, 2]
      },
      paymentSettings: {
        acceptCash: true,
        acceptCard: true,
        acceptOnline: true,
        currency: 'USD'
      },
      profileCustomization: {
        profilePic: userData.profilePic,
        profileBackground: userData.profileBackground,
        textColor: userData.textColor || '#000000',
        fontFamily: userData.fontFamily || 'System',
        markerColor: userData.markerColor || '#007AFF',
        galleryImages: userData.galleryImages || []
      },
      businessProfile: {
        businessName: userData.businessName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        businessAddress: userData.businessAddress,
        businessLat: userData.businessLat,
        businessLong: userData.businessLong
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
  }
}

// Add method to search owners by name or business name
export class OwnerSearchService {
  static async searchOwners(query: string): Promise<OwnerSettings[]> {
    try {
      if (!db) throw new DatabaseError('Firestore not initialized');
      
      // Get all owner settings to search through
      const settingsSnapshot = await getDocs(collection(db, COLLECTIONS.OWNER_SETTINGS));
      const matchingOwners: OwnerSettings[] = [];
      
      for (const doc of settingsSnapshot.docs) {
        const settings = doc.data() as OwnerSettings;
        const businessName = settings.businessProfile?.businessName?.toLowerCase() || '';
        const firstName = settings.businessProfile?.firstName?.toLowerCase() || '';
        const lastName = settings.businessProfile?.lastName?.toLowerCase() || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        const queryLower = query.toLowerCase();
        
        if (businessName.includes(queryLower) || 
            firstName.includes(queryLower) || 
            lastName.includes(queryLower) ||
            fullName.includes(queryLower)) {
          
          matchingOwners.push({ ...settings, id: doc.id });
        }
      }
      
      return matchingOwners;
    } catch (error) {
      console.error('Failed to search owners:', error);
      return [];
    }
  }
}

export { DatabaseError }; 