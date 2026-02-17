import { 
  collection, 
  doc, 
  setDoc,
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  Tag, 
  TagCategory, 
  TagType, 
  OwnerTag, 
  OwnerTagProfile,
  PREDEFINED_TAGS,
  generateTagId,
  isValidTagId
} from '../types/tags';

// Collection names
export const TAG_COLLECTIONS = {
  TAGS: 'tags',
  OWNER_TAGS: 'ownerTags'
} as const;

// Database error class
export class TagDatabaseError extends Error {
  constructor(message: string, public originalError?: string) {
    super(message);
    this.name = 'TagDatabaseError';
  }
}

// Tag Database operations
export class TagDatabase {
  private static tagCache: Map<string, Tag[]> = new Map();
  
  private static getCollection() {
    if (!db) throw new TagDatabaseError('Firestore not initialized');
    return collection(db, TAG_COLLECTIONS.TAGS);
  }

  // Initialize predefined tags in the database
  static async initializePredefinedTags(): Promise<void> {
    try {
      if (!db) throw new TagDatabaseError('Firestore not initialized');
      
      const batch = writeBatch(db);
      const existingTags = await this.getAll();
      const existingTagIds = new Set(existingTags.map(tag => tag.id));
      
      for (const predefinedTag of PREDEFINED_TAGS) {
        if (!existingTagIds.has(predefinedTag.id)) {
          const tagData: Tag = {
            ...predefinedTag,
            usageCount: 0,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          };
          
          const docRef = doc(db, TAG_COLLECTIONS.TAGS, tagData.id);
          batch.set(docRef, tagData);
        }
      }
      
      await batch.commit();
      console.log('Predefined tags initialized successfully');
    } catch (error) {
      console.error('Failed to initialize predefined tags:', error);
      throw new TagDatabaseError('Failed to initialize predefined tags', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Get all tags
  static async getAll(): Promise<Tag[]> {
    try {
      const querySnapshot = await getDocs(this.getCollection());
      return querySnapshot.docs.map(doc => doc.data() as Tag);
    } catch (error) {
      throw new TagDatabaseError('Failed to get all tags', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Get tags by type
  static async getByType(type: TagType): Promise<Tag[]> {
    try {
      // First try to get from database
      const q = query(
        this.getCollection(),
        where('type', '==', type),
        orderBy('displayName')
      );
      const querySnapshot = await getDocs(q);
      const dbTags = querySnapshot.docs.map(doc => doc.data() as Tag);
      
      // If we have tags from database, return them
      if (dbTags.length > 0) {
        return dbTags;
      }
      
      // Fallback to predefined tags if database is empty
      console.log(`No tags found in database for type ${type}, using predefined tags`);
      return PREDEFINED_TAGS
        .filter(tag => tag.type === type)
        .map(tag => ({
          ...tag,
          usageCount: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }));
    } catch (error) {
      console.error(`Database error for type ${type}, using predefined tags:`, error);
      // Fallback to predefined tags on error
      return PREDEFINED_TAGS
        .filter(tag => tag.type === type)
        .map(tag => ({
          ...tag,
          usageCount: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }));
    }
  }

  // Get primary tags
  static async getPrimaryTags(): Promise<Tag[]> {
    return this.getByType(TagType.PRIMARY);
  }

  // Pre-load primary tags for better UX
  static async preloadPrimaryTags(): Promise<void> {
    try {
      console.log('Pre-loading primary tags...');
      const primaryTags = await this.getByType(TagType.PRIMARY);
      this.tagCache.set(TagType.PRIMARY, primaryTags);
      console.log(`Pre-loaded ${primaryTags.length} primary tags`);
    } catch (error) {
      console.error('Failed to pre-load primary tags:', error);
    }
  }

  // Get cached tags if available, otherwise load from database
  static async getCachedTags(type: TagType): Promise<Tag[]> {
    const cached = this.tagCache.get(type);
    if (cached) {
      return cached;
    }
    
    const tags = await this.getByType(type);
    this.tagCache.set(type, tags);
    return tags;
  }

  // Clear tag cache
  static clearCache(): void {
    this.tagCache.clear();
  }

  // Get tags by category
  static async getByCategory(category: TagCategory): Promise<Tag[]> {
    try {
      const q = query(
        this.getCollection(),
        where('category', '==', category),
        orderBy('displayName')
      );
      const querySnapshot = await getDocs(q);
      const dbTags = querySnapshot.docs.map(doc => doc.data() as Tag);
      
      // If we have tags from database, return them
      if (dbTags.length > 0) {
        return dbTags;
      }
      
      // Fallback to predefined tags if database is empty
      console.log(`No tags found in database for category ${category}, using predefined tags`);
      return PREDEFINED_TAGS
        .filter(tag => tag.category === category)
        .map(tag => ({
          ...tag,
          usageCount: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }));
    } catch (error) {
      console.error(`Database error for category ${category}, using predefined tags:`, error);
      // Fallback to predefined tags on error
      return PREDEFINED_TAGS
        .filter(tag => tag.category === category)
        .map(tag => ({
          ...tag,
          usageCount: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }));
    }
  }

  // Get subtags for a specific primary tag
  static async getSubtagsForPrimary(primaryTagId: string): Promise<Tag[]> {
    try {
      const q = query(
        this.getCollection(),
        where('parentTagId', '==', primaryTagId),
        orderBy('displayName')
      );
      const querySnapshot = await getDocs(q);
      const dbTags = querySnapshot.docs.map(doc => doc.data() as Tag);
      
      // If we have tags from database, return them
      if (dbTags.length > 0) {
        return dbTags;
      }
      
      // Fallback to predefined tags if database is empty
      console.log(`No subtags found in database for primary tag ${primaryTagId}, using predefined tags`);
      return PREDEFINED_TAGS
        .filter(tag => tag.parentTagId === primaryTagId)
        .map(tag => ({
          ...tag,
          usageCount: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }));
    } catch (error) {
      console.error(`Database error for subtags of primary tag ${primaryTagId}, using predefined tags:`, error);
      // Fallback to predefined tags on error
      return PREDEFINED_TAGS
        .filter(tag => tag.parentTagId === primaryTagId)
        .map(tag => ({
          ...tag,
          usageCount: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }));
    }
  }

  // Get optional tags
  static async getOptionalTags(): Promise<Tag[]> {
    return this.getByType(TagType.OPTIONAL);
  }

  // Get tag by ID
  static async getById(tagId: string): Promise<Tag | null> {
    try {
      if (!isValidTagId(tagId)) {
        throw new TagDatabaseError(`Invalid tag ID format: ${tagId}`);
      }
      
      const docRef = doc(db!, TAG_COLLECTIONS.TAGS, tagId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as Tag;
      }
      
      // Fallback to predefined tags
      const predefinedTag = PREDEFINED_TAGS.find(tag => tag.id === tagId);
      if (predefinedTag) {
        return {
          ...predefinedTag,
          usageCount: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
      }
      
      return null;
    } catch (error) {
      throw new TagDatabaseError(`Failed to get tag ${tagId}`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Get multiple tags by IDs
  static async getByIds(tagIds: string[]): Promise<Tag[]> {
    try {
      const validIds = tagIds.filter(isValidTagId);
      if (validIds.length === 0) {
        return [];
      }
      
      const tags: Tag[] = [];
      
      // Try to get from database first
      for (const tagId of validIds) {
        try {
          const tag = await this.getById(tagId);
          if (tag) {
            tags.push(tag);
          }
        } catch (error) {
          console.error(`Failed to get tag ${tagId}:`, error);
        }
      }
      
      return tags;
    } catch (error) {
      throw new TagDatabaseError(`Failed to get tags by IDs`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Update tag usage count
  static async updateUsageCount(tagId: string, increment: number = 1): Promise<void> {
    try {
      if (!isValidTagId(tagId)) {
        throw new TagDatabaseError(`Invalid tag ID format: ${tagId}`);
      }
      
      const docRef = doc(db!, TAG_COLLECTIONS.TAGS, tagId);
      await updateDoc(docRef, {
        usageCount: increment,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new TagDatabaseError(`Failed to update usage count for tag ${tagId}`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

// Owner Tag Profile Database operations
export class OwnerTagProfileDatabase {
  private static getCollection() {
    if (!db) throw new TagDatabaseError('Firestore not initialized');
    return collection(db, TAG_COLLECTIONS.OWNER_TAGS);
  }

  // Get owner tag profile
  static async getByOwnerId(ownerId: string): Promise<OwnerTagProfile | null> {
    try {
      if (!db) throw new TagDatabaseError('Firestore not initialized');
      const docRef = doc(db, TAG_COLLECTIONS.OWNER_TAGS, ownerId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as OwnerTagProfile;
      }
      return null;
    } catch (error) {
      throw new TagDatabaseError(`Failed to get owner tag profile for ${ownerId}`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Get owners by tag ID
  static async getOwnersByTag(tagId: string): Promise<string[]> {
    try {
      if (!isValidTagId(tagId)) {
        throw new TagDatabaseError(`Invalid tag ID format: ${tagId}`);
      }
      
      const q = query(
        this.getCollection(),
        where('tagIds', 'array-contains', tagId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.id);
    } catch (error) {
      throw new TagDatabaseError(`Failed to get owners by tag ${tagId}`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Get owners by multiple tag IDs (AND logic)
  static async getOwnersByTags(tagIds: string[]): Promise<string[]> {
    try {
      const validIds = tagIds.filter(isValidTagId);
      if (validIds.length === 0) {
        return [];
      }
      
      const allProfiles = await getDocs(this.getCollection());
      const ownerIds: string[] = [];
      
      allProfiles.docs.forEach(doc => {
        const profile = doc.data() as OwnerTagProfile;
        const hasAllTags = validIds.every(tagId => profile.tagIds.includes(tagId));
        if (hasAllTags) {
          ownerIds.push(doc.id);
        }
      });
      
      return ownerIds;
    } catch (error) {
      throw new TagDatabaseError(`Failed to get owners by tags ${tagIds.join(', ')}`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Add tag to owner
  static async addTagToOwner(ownerId: string, tagId: string, customization?: Omit<OwnerTag, 'tagId'>): Promise<void> {
    try {
      if (!isValidTagId(tagId)) {
        throw new TagDatabaseError(`Invalid tag ID format: ${tagId}`);
      }
      
      // Import OwnerSettingsDatabase here to avoid circular dependency
      const { OwnerSettingsDatabase } = await import('./databaseService');
      
      // Get current owner settings
      const ownerSettings = await OwnerSettingsDatabase.getById(ownerId);
      if (!ownerSettings) {
        throw new TagDatabaseError(`Owner ${ownerId} not found`);
      }
      
      // Check if tag is already added
      const currentTagIds = ownerSettings.tagIds || [];
      if (currentTagIds.includes(tagId)) {
        throw new TagDatabaseError(`Tag ${tagId} is already assigned to owner ${ownerId}`);
      }
      
      // Add tag to owner settings
      const updatedTagIds = [...currentTagIds, tagId];
      await OwnerSettingsDatabase.createOrUpdate({
        ...ownerSettings,
        tagIds: updatedTagIds
      });
      
      // Update tag usage count
      await TagDatabase.updateUsageCount(tagId, 1);
    } catch (error) {
      throw new TagDatabaseError(`Failed to add tag ${tagId} to owner ${ownerId}`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Remove tag from owner
  static async removeTagFromOwner(ownerId: string, tagId: string): Promise<void> {
    try {
      if (!isValidTagId(tagId)) {
        throw new TagDatabaseError(`Invalid tag ID format: ${tagId}`);
      }
      
      // Import OwnerSettingsDatabase here to avoid circular dependency
      const { OwnerSettingsDatabase } = await import('./databaseService');
      
      // Get current owner settings
      const ownerSettings = await OwnerSettingsDatabase.getById(ownerId);
      if (!ownerSettings) {
        throw new TagDatabaseError(`Owner ${ownerId} not found`);
      }
      
      // Remove tag from owner settings
      const currentTagIds = ownerSettings.tagIds || [];
      const updatedTagIds = currentTagIds.filter(id => id !== tagId);
      
      await OwnerSettingsDatabase.createOrUpdate({
        ...ownerSettings,
        tagIds: updatedTagIds
      });
      
      // Update tag usage count
      await TagDatabase.updateUsageCount(tagId, -1);
    } catch (error) {
      throw new TagDatabaseError(`Failed to remove tag ${tagId} from owner ${ownerId}`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
} 