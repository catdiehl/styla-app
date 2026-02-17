import { OwnerTagProfile } from "../types/tags";

export enum Availability {
    Unavailable = 0,
    Available = 1,
    Busy = 2,
  }
  
  export interface OwnerAccount {
    id: number;
    firstName: string;
    lastName: string;
    businessName: string;
    businessLat: number;
    businessLong: number;
    businessAddress: string;
    email: string;
    availability: Availability;
    profilePic: string;
    favs: number[];
    galleryImages: string[];
    profileBackground: string | [string, string];
    textColor?: string;
    fontFamily?: string;  
    socialLinks?: {
      instagram?: { enabled: boolean; url?: string; };
      tiktok?: { enabled: boolean; url?: string; };
      website?: { enabled: boolean; url?: string; };
    };
    tagProfile?: OwnerTagProfile;
    markerColor?: string;
  }
  

  export const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 3959; // Earth radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };