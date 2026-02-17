import { TagDatabase, OwnerTagProfileDatabase } from '../services/tagService';
import { Tag, OwnerTagProfile, TagSearchQuery, isValidTagId, PREDEFINED_TAGS } from '../types/tags';
import { Timestamp } from 'firebase/firestore';

// Initialize the tag system
export const initializeTagSystem = async (): Promise<void> => {
  try {
    console.log('Initializing tag system...');
    await TagDatabase.initializePredefinedTags();
    console.log('Tag system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize tag system:', error);
    throw error;
  }
};

// Search owners by tags using 6-digit IDs
export const searchOwnersByTags = async (query: TagSearchQuery): Promise<string[]> => {
  try {
    const allTagIds: string[] = [];
    
    // Collect all tag IDs from the query
    if (query.primaryTags) {
      allTagIds.push(...query.primaryTags.filter(isValidTagId));
    }
    if (query.subtags) {
      allTagIds.push(...query.subtags.filter(isValidTagId));
    }
    if (query.optionalTags) {
      allTagIds.push(...query.optionalTags.filter(isValidTagId));
    }
    
    if (allTagIds.length === 0) {
      return [];
    }
    
    // Get owners that have all the specified tags
    return await OwnerTagProfileDatabase.getOwnersByTags(allTagIds);
  } catch (error) {
    console.error('Failed to search owners by tags:', error);
    return [];
  }
};

// Get owner's tags by ID
export const getOwnerTags = async (ownerId: string): Promise<Tag[]> => {
  try {
    const profile = await OwnerTagProfileDatabase.getByOwnerId(ownerId);
    if (!profile || profile.tagIds.length === 0) {
      return [];
    }
    
    // Get the actual tag objects from the IDs
    return await TagDatabase.getByIds(profile.tagIds);
  } catch (error) {
    console.error('Failed to get owner tags:', error);
    return [];
  }
};

// Get owner's primary tags
export const getOwnerPrimaryTags = async (ownerId: string): Promise<Tag[]> => {
  try {
    const profile = await OwnerTagProfileDatabase.getByOwnerId(ownerId);
    if (!profile || profile.tagIds.length === 0) {
      return [];
    }
    
    // Get all tags and filter for primary ones
    const allTags = await TagDatabase.getByIds(profile.tagIds);
    return allTags.filter(tag => tag.type === 'primary');
  } catch (error) {
    console.error('Failed to get owner primary tags:', error);
    return [];
  }
};

// Add tag to owner
export const addTagToOwner = async (
  ownerId: string, 
  tagId: string, 
  isPrimary: boolean = false,
  customTitle?: string,
  customColor?: string
): Promise<void> => {
  try {
    if (!isValidTagId(tagId)) {
      throw new Error(`Invalid tag ID format: ${tagId}`);
    }
    
    const customization = {
      addedAt: Timestamp.now(),
      isPrimary,
      customTitle,
      customColor
    };
    
    await OwnerTagProfileDatabase.addTagToOwner(ownerId, tagId, customization);
  } catch (error) {
    console.error('Failed to add tag to owner:', error);
    throw error;
  }
};

// Remove tag from owner
export const removeTagFromOwner = async (ownerId: string, tagId: string): Promise<void> => {
  try {
    if (!isValidTagId(tagId)) {
      throw new Error(`Invalid tag ID format: ${tagId}`);
    }
    
    await OwnerTagProfileDatabase.removeTagFromOwner(ownerId, tagId);
  } catch (error) {
    console.error('Failed to remove tag from owner:', error);
    throw error;
  }
};

// Get tag customizations for an owner
export const getOwnerTagCustomizations = async (ownerId: string): Promise<{ [tagId: string]: any }> => {
  try {
    const profile = await OwnerTagProfileDatabase.getByOwnerId(ownerId);
    return profile?.tagCustomizations || {};
  } catch (error) {
    console.error('Failed to get owner tag customizations:', error);
    return {};
  }
};

// Validate tag IDs
export const validateTagIds = (tagIds: string[]): string[] => {
  return tagIds.filter(isValidTagId);
};

// Convert tag names to IDs (for backward compatibility)
export const getTagIdByName = (tagName: string): string | null => {
  const tag = PREDEFINED_TAGS.find(t => t.name === tagName);
  return tag?.id || null;
};

// Get tag by name (for backward compatibility)
export const getTagByName = async (tagName: string): Promise<Tag | null> => {
  const tagId = getTagIdByName(tagName);
  if (tagId) {
    return await TagDatabase.getById(tagId);
  }
  return null;
};

// Get all predefined tag IDs
export const getAllPredefinedTagIds = (): string[] => {
  return PREDEFINED_TAGS.map(tag => tag.id);
};

// Get tag IDs by type
export const getTagIdsByType = (type: string): string[] => {
  return PREDEFINED_TAGS
    .filter(tag => tag.type === type)
    .map(tag => tag.id);
};

// Get tag IDs by category
export const getTagIdsByCategory = (category: string): string[] => {
  return PREDEFINED_TAGS
    .filter(tag => tag.category === category)
    .map(tag => tag.id);
};

// Get primary tag IDs
export const getPrimaryTagIds = (): string[] => {
  return getTagIdsByType('primary');
};

// Get optional tag IDs
export const getOptionalTagIds = (): string[] => {
  return getTagIdsByType('optional');
};

// Get subtag IDs for a primary tag
export const getSubtagIdsForPrimary = (primaryTagId: string): string[] => {
  return PREDEFINED_TAGS
    .filter(tag => tag.parentTagId === primaryTagId)
    .map(tag => tag.id);
};

// Get subtags for specific primary tags
export const getSubtagsForPrimaryTags = (allTags: Tag[], primaryTagIds: string[]): Tag[] => {
  return allTags.filter(tag => 
    tag.type === 'subtag' && 
    tag.parentTagId && 
    primaryTagIds.includes(tag.parentTagId)
  );
};

// Get primary tags from a list of tags
export const getPrimaryTags = (tags: Tag[]): Tag[] => {
  return tags.filter(tag => tag.type === 'primary');
};

// Get subtags from a list of tags
export const getSubtags = (tags: Tag[]): Tag[] => {
  return tags.filter(tag => tag.type === 'subtag');
};

// Get optional tags from a list of tags
export const getOptionalTags = (tags: Tag[]): Tag[] => {
  return tags.filter(tag => tag.type === 'optional');
};

// Get tags by category
export const getTagsByCategory = (tags: Tag[], category: string): Tag[] => {
  return tags.filter(tag => tag.category === category);
};

// Get parent tag for a subtag
export const getParentTag = (allTags: Tag[], subtagId: string): Tag | undefined => {
  const subtag = allTags.find(tag => tag.id === subtagId);
  if (!subtag?.parentTagId) return undefined;
  return allTags.find(tag => tag.id === subtag.parentTagId);
};

// Get all child subtags for a primary tag
export const getChildSubtags = (allTags: Tag[], primaryTagId: string): Tag[] => {
  return allTags.filter(tag => 
    tag.type === 'subtag' && 
    tag.parentTagId === primaryTagId
  );
};

// Validate tag hierarchy (ensure subtags have valid parent tags)
export const validateTagHierarchy = (tags: Tag[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const primaryTagIds = new Set(tags.filter(t => t.type === 'primary').map(t => t.id));
  
  for (const tag of tags) {
    if (tag.type === 'subtag') {
      if (!tag.parentTagId) {
        errors.push(`Subtag "${tag.displayName}" (${tag.id}) has no parent tag`);
      } else if (!primaryTagIds.has(tag.parentTagId)) {
        errors.push(`Subtag "${tag.displayName}" (${tag.id}) has invalid parent tag ID: ${tag.parentTagId}`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Group tags by their primary parent
export const groupSubtagsByParent = (tags: Tag[]): Record<string, Tag[]> => {
  const groups: Record<string, Tag[]> = {};
  
  for (const tag of tags) {
    if (tag.type === 'subtag' && tag.parentTagId) {
      if (!groups[tag.parentTagId]) {
        groups[tag.parentTagId] = [];
      }
      groups[tag.parentTagId].push(tag);
    }
  }
  
  return groups;
};

// Check if a tag is a valid subtag for a given primary tag
export const isValidSubtagForPrimary = (subtag: Tag, primaryTagId: string): boolean => {
  return subtag.type === 'subtag' && subtag.parentTagId === primaryTagId;
};

// Get all related tags (primary + its subtags)
export const getRelatedTags = (allTags: Tag[], primaryTagId: string): Tag[] => {
  const primaryTag = allTags.find(tag => tag.id === primaryTagId);
  if (!primaryTag) return [];
  
  const subtags = getChildSubtags(allTags, primaryTagId);
  return [primaryTag, ...subtags];
}; 