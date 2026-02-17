import { initializeTagSystem } from './tagUtils';
import { TagDatabase } from '../services/tagService';

// Initialize the tag system when the app starts
export const initializeAppTags = async (): Promise<void> => {
  try {
    console.log('Initializing app tag system...');
    await initializeTagSystem();
    
    // Pre-load primary tags for better UX
    await TagDatabase.preloadPrimaryTags();
    
    console.log('App tag system ready');
  } catch (error) {
    console.error('Failed to initialize app tag system:', error);
    // Don't throw - let the app continue without tags
  }
};

// Call this function in your App.tsx or main entry point
export const setupTagSystem = () => {
  // Initialize tags when the app starts
  initializeAppTags().catch(error => {
    console.error('Tag system initialization failed:', error);
  });
}; 