import { OwnerSettingsDatabase, OwnerSettings } from './databaseService';
import { TagDatabase } from './tagService';
import { Tag } from '../types/tags';

export interface OwnerWithTags extends OwnerSettings {
  tagNames?: string[];
}

export class OwnerService {
  // Get all owners from database with their tag names
  static async getAllOwnersWithTags(): Promise<OwnerWithTags[]> {
    try {
      const owners = await OwnerSettingsDatabase.getAllOwners();
      const allTags = await TagDatabase.getAll();
      
      return owners.map(owner => ({
        ...owner,
        tagNames: owner.tagIds ? 
          owner.tagIds
            .map(tagId => allTags.find(tag => tag.id === tagId)?.displayName)
            .filter(Boolean) as string[] : 
          []
      }));
    } catch (error) {
      console.error('Failed to get owners with tags:', error);
      return [];
    }
  }

  // Search owners by name, business, or ID
  static async searchOwners(query: string): Promise<OwnerWithTags[]> {
    try {
      const owners = await this.getAllOwnersWithTags();
      const searchTerm = query.toLowerCase();
      
      return owners.filter(owner => {
        const businessName = owner.businessProfile?.businessName?.toLowerCase() || '';
        const firstName = owner.businessProfile?.firstName?.toLowerCase() || '';
        const lastName = owner.businessProfile?.lastName?.toLowerCase() || '';
        const businessAddress = owner.businessProfile?.businessAddress?.toLowerCase() || '';
        const ownerId = owner.id.toLowerCase();
        
        return businessName.includes(searchTerm) || 
               firstName.includes(searchTerm) || 
               lastName.includes(searchTerm) || 
               businessAddress.includes(searchTerm) || 
               ownerId.includes(searchTerm);
      });
    } catch (error) {
      console.error('Failed to search owners:', error);
      return [];
    }
  }

  // Get owners by tag IDs
  static async getOwnersByTagIds(tagIds: string[]): Promise<OwnerWithTags[]> {
    try {
      const owners = await this.getAllOwnersWithTags();
      
      if (tagIds.length === 0) {
        return owners;
      }
      
      return owners.filter(owner => {
        const ownerTagIds = owner.tagIds || [];
        return tagIds.some(tagId => ownerTagIds.includes(tagId));
      });
    } catch (error) {
      console.error('Failed to get owners by tag IDs:', error);
      return [];
    }
  }

  // Get owners within distance
  static async getOwnersByDistance(
    originLat: number, 
    originLong: number, 
    maxDistance: number
  ): Promise<OwnerWithTags[]> {
    try {
      const owners = await this.getAllOwnersWithTags();
      
      return owners.filter(owner => {
        if (!owner.businessProfile?.businessLat || !owner.businessProfile?.businessLong) {
          return false;
        }
        
        const distance = this.haversineDistance(
          originLat,
          originLong,
          owner.businessProfile.businessLat,
          owner.businessProfile.businessLong
        );
        
        return distance <= maxDistance;
      });
    } catch (error) {
      console.error('Failed to get owners by distance:', error);
      return [];
    }
  }

  // Combined search with all filters
  static async searchOwnersWithFilters({
    nameQuery = '',
    selectedPrimaryTags = [],
    selectedSubtags = [],
    selectedOptionalTags = [],
    maxDistance = 10,
    originLat,
    originLong
  }: {
    nameQuery?: string;
    selectedPrimaryTags?: string[];
    selectedSubtags?: string[];
    selectedOptionalTags?: string[];
    maxDistance?: number;
    originLat: number;
    originLong: number;
  }): Promise<OwnerWithTags[]> {
    try {
      let owners = await this.getAllOwnersWithTags();
      
      // Filter by name query
      if (nameQuery.trim()) {
        const searchTerm = nameQuery.toLowerCase();
        owners = owners.filter(owner => {
          const businessName = owner.businessProfile?.businessName?.toLowerCase() || '';
          const firstName = owner.businessProfile?.firstName?.toLowerCase() || '';
          const lastName = owner.businessProfile?.lastName?.toLowerCase() || '';
          const businessAddress = owner.businessProfile?.businessAddress?.toLowerCase() || '';
          
          return businessName.includes(searchTerm) || 
                 firstName.includes(searchTerm) || 
                 lastName.includes(searchTerm) || 
                 businessAddress.includes(searchTerm);
        });
      }
      
      // Filter by tags
      const allSelectedTags = [...selectedPrimaryTags, ...selectedSubtags, ...selectedOptionalTags];
      if (allSelectedTags.length > 0) {
        owners = owners.filter(owner => {
          const ownerTagIds = owner.tagIds || [];
          return allSelectedTags.some(tagId => ownerTagIds.includes(tagId));
        });
      }
      
      // Filter by distance
      owners = owners.filter(owner => {
        if (!owner.businessProfile?.businessLat || !owner.businessProfile?.businessLong) {
          return false;
        }
        
        const distance = this.haversineDistance(
          originLat,
          originLong,
          owner.businessProfile.businessLat,
          owner.businessProfile.businessLong
        );
        
        return distance <= maxDistance;
      });
      
      return owners;
    } catch (error) {
      console.error('Failed to search owners with filters:', error);
      return [];
    }
  }

  // Helper function: Haversine formula to calculate distance (in miles)
  private static haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 3959; // Earth radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
} 