import { Timestamp } from 'firebase/firestore';

// Tag categories based on the styla tags document
export enum TagCategory {
  HAIR_STYLIST = 'hair_stylist',
  MAKEUP_ARTIST = 'makeup_artist',
  BRIDAL = 'bridal',
  BARBER = 'barber',
  NAILS = 'nails',
  LASHES = 'lashes',
  AESTHETICIAN = 'aesthetician',
  OPTIONAL = 'optional'
}

// Tag types for UI organization
export enum TagType {
  PRIMARY = 'primary',    // Main stylist types
  SUBTAG = 'subtag',      // Specific services
  OPTIONAL = 'optional'   // Cross-category tags
}

// Main tag interface with 6-digit ID
export interface Tag {
  id: string; // 6-digit unique ID (e.g., "001234")
  name: string;
  displayName: string;
  category: TagCategory;
  type: TagType;
  color?: string; // Reserved for future use
  parentTagId?: string; // 6-digit ID for subtags
  usageCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Owner's tag assignment with customization options
export interface OwnerTag {
  tagId: string; // 6-digit ID
  addedAt: Timestamp;
  isPrimary: boolean;
  customTitle?: string;
  customColor?: string;
}

// Owner's complete tag profile - now stores array of 6-digit IDs
export interface OwnerTagProfile {
  ownerId: string;
  tagIds: string[]; // Array of 6-digit tag IDs
  tagCustomizations?: { [tagId: string]: Omit<OwnerTag, 'tagId'> }; // Optional customizations
  updatedAt: Timestamp;
}

// Tag search query
export interface TagSearchQuery {
  primaryTags?: string[]; // Array of 6-digit IDs
  subtags?: string[]; // Array of 6-digit IDs
  optionalTags?: string[]; // Array of 6-digit IDs
  maxDistance?: number;
  nameQuery?: string;
}

// Predefined tags with 6-digit IDs - following exact text file structure
export const PREDEFINED_TAGS: Omit<Tag, 'usageCount' | 'createdAt' | 'updatedAt'>[] = [
  // Hair Stylist (001xxx)
  { id: '001001', name: 'hair_stylist', displayName: 'Hair Stylist', category: TagCategory.HAIR_STYLIST, type: TagType.PRIMARY },
  { id: '001002', name: 'haircut', displayName: 'Haircut', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },
  { id: '001003', name: 'hair_color', displayName: 'Hair Color', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },
  { id: '001004', name: 'blowout', displayName: 'Blowout', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },
  { id: '001005', name: 'balayage', displayName: 'Balayage', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },
  { id: '001006', name: 'highlights', displayName: 'Highlights', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },
  { id: '001007', name: 'color_correction', displayName: 'Color Correction', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },
  { id: '001008', name: 'root_touch_up', displayName: 'Root Touch-Up', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },
  { id: '001009', name: 'toner_gloss', displayName: 'Toner/Gloss', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },
  { id: '001010', name: 'curly_hair_specialist', displayName: 'Curly Hair Specialist', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },
  { id: '001011', name: 'textured_hair', displayName: 'Textured Hair', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },
  { id: '001012', name: 'short_haircuts', displayName: 'Short Haircuts', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },
  { id: '001013', name: 'long_haircuts', displayName: 'Long Haircuts', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },
  { id: '001014', name: 'hair_transformation', displayName: 'Hair Transformation', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },
  { id: '001015', name: 'healthy_hair_focused', displayName: 'Healthy Hair Focused', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },
  { id: '001016', name: 'bridal_hair', displayName: 'Bridal Hair', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },
  { id: '001017', name: 'updos_event_hair', displayName: 'Updos / Event Hair', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },
  { id: '001018', name: 'precision_cutting', displayName: 'Precision Cutting', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },
  { id: '001019', name: 'mens_haircuts', displayName: 'Men\'s Haircuts', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },
  { id: '001020', name: 'kids_haircuts', displayName: 'Kid\'s Haircuts', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },
  { id: '001021', name: 'extensions', displayName: 'Extensions', category: TagCategory.HAIR_STYLIST, type: TagType.SUBTAG, parentTagId: '001001' },

  // Makeup Artist (002xxx)
  { id: '002001', name: 'makeup_artist', displayName: 'Makeup Artist', category: TagCategory.MAKEUP_ARTIST, type: TagType.PRIMARY },
  { id: '002002', name: 'soft_glam', displayName: 'Soft Glam', category: TagCategory.MAKEUP_ARTIST, type: TagType.SUBTAG, parentTagId: '002001' },
  { id: '002003', name: 'full_glam', displayName: 'Full Glam', category: TagCategory.MAKEUP_ARTIST, type: TagType.SUBTAG, parentTagId: '002001' },
  { id: '002004', name: 'natural_makeup', displayName: 'Natural Makeup', category: TagCategory.MAKEUP_ARTIST, type: TagType.SUBTAG, parentTagId: '002001' },
  { id: '002005', name: 'bridal_makeup', displayName: 'Bridal Makeup', category: TagCategory.MAKEUP_ARTIST, type: TagType.SUBTAG, parentTagId: '002001' },
  { id: '002006', name: 'editorial_makeup', displayName: 'Editorial Makeup', category: TagCategory.MAKEUP_ARTIST, type: TagType.SUBTAG, parentTagId: '002001' },
  { id: '002007', name: 'photoshoot_makeup', displayName: 'Photoshoot Makeup', category: TagCategory.MAKEUP_ARTIST, type: TagType.SUBTAG, parentTagId: '002001' },
  { id: '002008', name: 'airbrush_makeup', displayName: 'Airbrush Makeup', category: TagCategory.MAKEUP_ARTIST, type: TagType.SUBTAG, parentTagId: '002001' },
  { id: '002009', name: 'event_makeup', displayName: 'Event Makeup', category: TagCategory.MAKEUP_ARTIST, type: TagType.SUBTAG, parentTagId: '002001' },
  { id: '002010', name: 'prom_makeup', displayName: 'Prom Makeup', category: TagCategory.MAKEUP_ARTIST, type: TagType.SUBTAG, parentTagId: '002001' },
  { id: '002011', name: 'makeup_lessons', displayName: 'Makeup Lessons', category: TagCategory.MAKEUP_ARTIST, type: TagType.SUBTAG, parentTagId: '002001' },
  { id: '002012', name: 'mature_skin', displayName: 'Mature Skin', category: TagCategory.MAKEUP_ARTIST, type: TagType.SUBTAG, parentTagId: '002001' },
  { id: '002013', name: 'makeup_for_photos_video', displayName: 'Makeup for Photos / Video', category: TagCategory.MAKEUP_ARTIST, type: TagType.SUBTAG, parentTagId: '002001' },
  { id: '002014', name: 'on_location_services', displayName: 'On-Location Services', category: TagCategory.MAKEUP_ARTIST, type: TagType.SUBTAG, parentTagId: '002001' },
  { id: '002015', name: 'strip_lashes_included', displayName: 'Strip Lashes Included', category: TagCategory.MAKEUP_ARTIST, type: TagType.SUBTAG, parentTagId: '002001' },
  { id: '002016', name: 'touch_up_kits_provided', displayName: 'Touch-Up Kits Provided', category: TagCategory.MAKEUP_ARTIST, type: TagType.SUBTAG, parentTagId: '002001' },

  // Bridal (003xxx)
  { id: '003001', name: 'bridal', displayName: 'Bridal', category: TagCategory.BRIDAL, type: TagType.PRIMARY },
  { id: '003002', name: 'bridal_hair', displayName: 'Bridal Hair', category: TagCategory.BRIDAL, type: TagType.SUBTAG, parentTagId: '003001' },
  { id: '003003', name: 'bridal_makeup', displayName: 'Bridal Makeup', category: TagCategory.BRIDAL, type: TagType.SUBTAG, parentTagId: '003001' },
  { id: '003004', name: 'bridal_trial', displayName: 'Bridal Trial', category: TagCategory.BRIDAL, type: TagType.SUBTAG, parentTagId: '003001' },
  { id: '003005', name: 'wedding_party_hair', displayName: 'Wedding Party Hair', category: TagCategory.BRIDAL, type: TagType.SUBTAG, parentTagId: '003001' },
  { id: '003006', name: 'wedding_party_makeup', displayName: 'Wedding Party Makeup', category: TagCategory.BRIDAL, type: TagType.SUBTAG, parentTagId: '003001' },
  { id: '003007', name: 'on_site_services', displayName: 'On-Site Services', category: TagCategory.BRIDAL, type: TagType.SUBTAG, parentTagId: '003001' },
  { id: '003008', name: 'destination_weddings', displayName: 'Destination Weddings', category: TagCategory.BRIDAL, type: TagType.SUBTAG, parentTagId: '003001' },
  { id: '003009', name: 'elopements', displayName: 'Elopements', category: TagCategory.BRIDAL, type: TagType.SUBTAG, parentTagId: '003001' },
  { id: '003010', name: 'morning_of_coordination', displayName: 'Morning-Of Coordination', category: TagCategory.BRIDAL, type: TagType.SUBTAG, parentTagId: '003001' },
  { id: '003011', name: 'luxury_bridal_packages', displayName: 'Luxury Bridal Packages', category: TagCategory.BRIDAL, type: TagType.SUBTAG, parentTagId: '003001' },
  { id: '003012', name: 'male_grooming_for_wedding', displayName: 'Male Grooming for Wedding', category: TagCategory.BRIDAL, type: TagType.SUBTAG, parentTagId: '003001' },
  { id: '003013', name: 'touch_ups_or_full_day_rate', displayName: 'Touch-Ups or Full Day Rate', category: TagCategory.BRIDAL, type: TagType.SUBTAG, parentTagId: '003001' },
  { id: '003014', name: 'group_pricing_options', displayName: 'Group Pricing Options', category: TagCategory.BRIDAL, type: TagType.SUBTAG, parentTagId: '003001' },

  // Barber (004xxx)
  { id: '004001', name: 'barber', displayName: 'Barber', category: TagCategory.BARBER, type: TagType.PRIMARY },
  { id: '004002', name: 'taper_fade', displayName: 'Taper Fade', category: TagCategory.BARBER, type: TagType.SUBTAG, parentTagId: '004001' },
  { id: '004003', name: 'skin_fade', displayName: 'Skin Fade', category: TagCategory.BARBER, type: TagType.SUBTAG, parentTagId: '004001' },
  { id: '004004', name: 'beard_trim', displayName: 'Beard Trim', category: TagCategory.BARBER, type: TagType.SUBTAG, parentTagId: '004001' },
  { id: '004005', name: 'razor_line_up', displayName: 'Razor Line-Up', category: TagCategory.BARBER, type: TagType.SUBTAG, parentTagId: '004001' },
  { id: '004006', name: 'hot_towel_shave', displayName: 'Hot Towel Shave', category: TagCategory.BARBER, type: TagType.SUBTAG, parentTagId: '004001' },
  { id: '004007', name: 'buzz_cut', displayName: 'Buzz Cut', category: TagCategory.BARBER, type: TagType.SUBTAG, parentTagId: '004001' },
  { id: '004008', name: 'classic_scissor_cut', displayName: 'Classic Scissor Cut', category: TagCategory.BARBER, type: TagType.SUBTAG, parentTagId: '004001' },
  { id: '004009', name: 'neck_cleanup', displayName: 'Neck Cleanup', category: TagCategory.BARBER, type: TagType.SUBTAG, parentTagId: '004001' },
  { id: '004010', name: 'mens_haircuts', displayName: 'Men\'s Haircuts', category: TagCategory.BARBER, type: TagType.SUBTAG, parentTagId: '004001' },
  { id: '004011', name: 'kids_cuts', displayName: 'Kid\'s Cuts', category: TagCategory.BARBER, type: TagType.SUBTAG, parentTagId: '004001' },
  { id: '004012', name: 'walk_ins_welcome', displayName: 'Walk-Ins Welcome', category: TagCategory.BARBER, type: TagType.SUBTAG, parentTagId: '004001' },
  { id: '004013', name: 'appointments_only', displayName: 'Appointments Only', category: TagCategory.BARBER, type: TagType.SUBTAG, parentTagId: '004001' },
  { id: '004014', name: 'barbershop_vibe', displayName: 'Barbershop Vibe', category: TagCategory.BARBER, type: TagType.SUBTAG, parentTagId: '004001' },
  { id: '004015', name: 'modern_barbering', displayName: 'Modern Barbering', category: TagCategory.BARBER, type: TagType.SUBTAG, parentTagId: '004001' },

  // Nails (005xxx)
  { id: '005001', name: 'nails', displayName: 'Nails', category: TagCategory.NAILS, type: TagType.PRIMARY },
  { id: '005002', name: 'gel_manicure', displayName: 'Gel Manicure', category: TagCategory.NAILS, type: TagType.SUBTAG, parentTagId: '005001' },
  { id: '005003', name: 'regular_polish', displayName: 'Regular Polish', category: TagCategory.NAILS, type: TagType.SUBTAG, parentTagId: '005001' },
  { id: '005004', name: 'biab_nails', displayName: 'BIAB Nails', category: TagCategory.NAILS, type: TagType.SUBTAG, parentTagId: '005001' },
  { id: '005005', name: 'acrylic_nails', displayName: 'Acrylic Nails', category: TagCategory.NAILS, type: TagType.SUBTAG, parentTagId: '005001' },
  { id: '005006', name: 'dip_powder', displayName: 'Dip Powder', category: TagCategory.NAILS, type: TagType.SUBTAG, parentTagId: '005001' },
  { id: '005007', name: 'structured_gel', displayName: 'Structured Gel', category: TagCategory.NAILS, type: TagType.SUBTAG, parentTagId: '005001' },
  { id: '005008', name: 'nail_art', displayName: 'Nail Art', category: TagCategory.NAILS, type: TagType.SUBTAG, parentTagId: '005001' },
  { id: '005009', name: 'minimal_nails', displayName: 'Minimal Nails', category: TagCategory.NAILS, type: TagType.SUBTAG, parentTagId: '005001' },
  { id: '005010', name: 'press_ons', displayName: 'Press-Ons', category: TagCategory.NAILS, type: TagType.SUBTAG, parentTagId: '005001' },
  { id: '005011', name: 'french_tips', displayName: 'French Tips', category: TagCategory.NAILS, type: TagType.SUBTAG, parentTagId: '005001' },
  { id: '005012', name: 'bridal_nails', displayName: 'Bridal Nails', category: TagCategory.NAILS, type: TagType.SUBTAG, parentTagId: '005001' },
  { id: '005013', name: 'short_nails', displayName: 'Short Nails', category: TagCategory.NAILS, type: TagType.SUBTAG, parentTagId: '005001' },
  { id: '005014', name: 'long_nails', displayName: 'Long Nails', category: TagCategory.NAILS, type: TagType.SUBTAG, parentTagId: '005001' },
  { id: '005015', name: 'nail_repair', displayName: 'Nail Repair', category: TagCategory.NAILS, type: TagType.SUBTAG, parentTagId: '005001' },
  { id: '005016', name: 'manicure_pedicure_packages', displayName: 'Manicure + Pedicure Packages', category: TagCategory.NAILS, type: TagType.SUBTAG, parentTagId: '005001' },
  { id: '005017', name: 'mobile_services_available', displayName: 'Mobile Services Available', category: TagCategory.NAILS, type: TagType.SUBTAG, parentTagId: '005001' },

  // Lashes (006xxx)
  { id: '006001', name: 'lashes', displayName: 'Lashes', category: TagCategory.LASHES, type: TagType.PRIMARY },
  { id: '006002', name: 'classic', displayName: 'Classic', category: TagCategory.LASHES, type: TagType.SUBTAG, parentTagId: '006001' },
  { id: '006003', name: 'hybrid', displayName: 'Hybrid', category: TagCategory.LASHES, type: TagType.SUBTAG, parentTagId: '006001' },
  { id: '006004', name: 'volume', displayName: 'Volume', category: TagCategory.LASHES, type: TagType.SUBTAG, parentTagId: '006001' },
  { id: '006005', name: 'mega_volume', displayName: 'Mega Volume', category: TagCategory.LASHES, type: TagType.SUBTAG, parentTagId: '006001' },
  { id: '006006', name: 'lash_lift', displayName: 'Lash Lift', category: TagCategory.LASHES, type: TagType.SUBTAG, parentTagId: '006001' },
  { id: '006007', name: 'lash_tint', displayName: 'Lash Tint', category: TagCategory.LASHES, type: TagType.SUBTAG, parentTagId: '006001' },
  { id: '006008', name: 'bottom_lashes', displayName: 'Bottom Lashes', category: TagCategory.LASHES, type: TagType.SUBTAG, parentTagId: '006001' },
  { id: '006009', name: 'wispy_strip_look', displayName: 'Wispy / Strip-Look', category: TagCategory.LASHES, type: TagType.SUBTAG, parentTagId: '006001' },
  { id: '006010', name: 'natural_style', displayName: 'Natural Style', category: TagCategory.LASHES, type: TagType.SUBTAG, parentTagId: '006001' },
  { id: '006011', name: 'dramatic_style', displayName: 'Dramatic Style', category: TagCategory.LASHES, type: TagType.SUBTAG, parentTagId: '006001' },
  { id: '006012', name: 'color_lashes', displayName: 'Color Lashes', category: TagCategory.LASHES, type: TagType.SUBTAG, parentTagId: '006001' },
  { id: '006013', name: 'patch_test_required', displayName: 'Patch Test Required', category: TagCategory.LASHES, type: TagType.SUBTAG, parentTagId: '006001' },
  { id: '006014', name: 'sensitive_adhesive', displayName: 'Sensitive Adhesive', category: TagCategory.LASHES, type: TagType.SUBTAG, parentTagId: '006001' },
  { id: '006015', name: 'lash_aftercare_kits', displayName: 'Lash Aftercare Kits', category: TagCategory.LASHES, type: TagType.SUBTAG, parentTagId: '006001' },
  { id: '006016', name: 'bridal_lashes', displayName: 'Bridal Lashes', category: TagCategory.LASHES, type: TagType.SUBTAG, parentTagId: '006001' },

  // Aesthetician (007xxx)
  { id: '007001', name: 'aesthetician', displayName: 'Aesthetician / Skin', category: TagCategory.AESTHETICIAN, type: TagType.PRIMARY },
  { id: '007002', name: 'custom_facials', displayName: 'Custom Facials', category: TagCategory.AESTHETICIAN, type: TagType.SUBTAG, parentTagId: '007001' },
  { id: '007003', name: 'acne_treatments', displayName: 'Acne Treatments', category: TagCategory.AESTHETICIAN, type: TagType.SUBTAG, parentTagId: '007001' },
  { id: '007004', name: 'anti_aging', displayName: 'Anti-Aging', category: TagCategory.AESTHETICIAN, type: TagType.SUBTAG, parentTagId: '007001' },
  { id: '007005', name: 'dermaplane', displayName: 'Dermaplane', category: TagCategory.AESTHETICIAN, type: TagType.SUBTAG, parentTagId: '007001' },
  { id: '007006', name: 'hydrafacial', displayName: 'Hydrafacial', category: TagCategory.AESTHETICIAN, type: TagType.SUBTAG, parentTagId: '007001' },
  { id: '007007', name: 'microneedling', displayName: 'Microneedling', category: TagCategory.AESTHETICIAN, type: TagType.SUBTAG, parentTagId: '007001' },
  { id: '007008', name: 'led_therapy', displayName: 'LED Therapy', category: TagCategory.AESTHETICIAN, type: TagType.SUBTAG, parentTagId: '007001' },
  { id: '007009', name: 'extractions', displayName: 'Extractions', category: TagCategory.AESTHETICIAN, type: TagType.SUBTAG, parentTagId: '007001' },
  { id: '007010', name: 'high_frequency', displayName: 'High Frequency', category: TagCategory.AESTHETICIAN, type: TagType.SUBTAG, parentTagId: '007001' },
  { id: '007011', name: 'chemical_peels', displayName: 'Chemical Peels', category: TagCategory.AESTHETICIAN, type: TagType.SUBTAG, parentTagId: '007001' },
  { id: '007012', name: 'brow_wax_tint', displayName: 'Brow Wax & Tint', category: TagCategory.AESTHETICIAN, type: TagType.SUBTAG, parentTagId: '007001' },
  { id: '007013', name: 'lash_lift_tint', displayName: 'Lash Lift & Tint', category: TagCategory.AESTHETICIAN, type: TagType.SUBTAG, parentTagId: '007001' },
  { id: '007014', name: 'skin_consultations', displayName: 'Skin Consultations', category: TagCategory.AESTHETICIAN, type: TagType.SUBTAG, parentTagId: '007001' },
  { id: '007015', name: 'sensitive_skin_friendly', displayName: 'Sensitive Skin Friendly', category: TagCategory.AESTHETICIAN, type: TagType.SUBTAG, parentTagId: '007001' },
  { id: '007016', name: 'natural_organic_products', displayName: 'Natural/Organic Products', category: TagCategory.AESTHETICIAN, type: TagType.SUBTAG, parentTagId: '007001' },
  { id: '007017', name: 'mens_skincare_services', displayName: 'Men\'s Skincare Services', category: TagCategory.AESTHETICIAN, type: TagType.SUBTAG, parentTagId: '007001' },

  // Optional Tags (008xxx) - More Filters
  { id: '008001', name: 'on_location_available', displayName: 'On-Location Available', category: TagCategory.OPTIONAL, type: TagType.OPTIONAL },
  { id: '008002', name: 'in_studio_only', displayName: 'In-Studio Only', category: TagCategory.OPTIONAL, type: TagType.OPTIONAL },
  { id: '008003', name: 'mobile_services', displayName: 'Mobile Services', category: TagCategory.OPTIONAL, type: TagType.OPTIONAL },
  { id: '008004', name: 'kid_friendly', displayName: 'Kid-Friendly', category: TagCategory.OPTIONAL, type: TagType.OPTIONAL },
  { id: '008005', name: 'lgbtq_friendly', displayName: 'LGBTQ+ Friendly', category: TagCategory.OPTIONAL, type: TagType.OPTIONAL },
  { id: '008006', name: 'multilingual', displayName: 'Multilingual', category: TagCategory.OPTIONAL, type: TagType.OPTIONAL },
  { id: '008007', name: 'same_day_appointments', displayName: 'Same-Day Appointments', category: TagCategory.OPTIONAL, type: TagType.OPTIONAL },
  { id: '008008', name: 'luxury_pricing', displayName: 'Luxury Pricing', category: TagCategory.OPTIONAL, type: TagType.OPTIONAL },
  { id: '008009', name: 'budget_friendly', displayName: 'Budget-Friendly', category: TagCategory.OPTIONAL, type: TagType.OPTIONAL },
  { id: '008010', name: 'accepts_walk_ins', displayName: 'Accepts Walk-Ins', category: TagCategory.OPTIONAL, type: TagType.OPTIONAL },
  { id: '008011', name: 'group_rates', displayName: 'Group Rates', category: TagCategory.OPTIONAL, type: TagType.OPTIONAL },
  { id: '008012', name: 'packages_available', displayName: 'Packages Available', category: TagCategory.OPTIONAL, type: TagType.OPTIONAL },
  { id: '008013', name: 'trial_services_offered', displayName: 'Trial Services Offered', category: TagCategory.OPTIONAL, type: TagType.OPTIONAL },
  { id: '008014', name: 'travel_fees_may_apply', displayName: 'Travel Fees May Apply', category: TagCategory.OPTIONAL, type: TagType.OPTIONAL },
];

// Helper function to generate unique 6-digit IDs
export const generateTagId = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to validate 6-digit ID format
export const isValidTagId = (id: string): boolean => {
  return /^\d{6}$/.test(id);
}; 