import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';

const base64Encode = (str: string): string => {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const generateNonce = async () => {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  // Convert the bytes to a string
  const array = Array.from(randomBytes);
  const byteString = array.map(byte => String.fromCharCode(byte)).join('');
  return base64Encode(byteString);
};

const getExpoProxyRedirectUri = () => {
  const cfg: any = (Constants as any).expoConfig || {};
  const owner: string | undefined = cfg.owner;
  const slug: string | undefined = cfg.slug;
  if (owner && slug) {
    return `https://auth.expo.io/@${owner}/${slug}`;
  }
  // Fallback using only slug; you must add the exact URL to Google console
  if (slug) {
    return `https://auth.expo.io/${slug}`;
  }
  // Absolute fallback
  return 'https://auth.expo.io';
};

export const makeRedirectUri = () => {
  // Use Expo AuthSession proxy URL
  return getExpoProxyRedirectUri();
};

const REDIRECTMETO_PREFIX = 'https://redirectmeto.com/';

// Redirect URI for Google OAuth. In Expo Go uses redirectmeto + exp://... for testing.
// Add the exact URI shown in logs to Google Cloud Console → Authorized redirect URIs.
export const makeAuthRedirectForGoogle = () => {
  const isExpoGo = (Constants as any).appOwnership === 'expo';
  const baseUri = isExpoGo
    ? Linking.createURL('/oauth2redirect')
    : Linking.createURL('/oauth2redirect', { scheme: 'com.catdiehl.styladev' });

  if (baseUri.startsWith('exp://')) {
    return REDIRECTMETO_PREFIX + baseUri;
  }
  return baseUri;
};

// Return URL for closing the browser and handing control back to the app.
export const makeReturnToAppUri = () => {
  if (__DEV__) {
    return Linking.createURL('/oauth2redirect');
  }
  return Linking.createURL('/oauth2redirect', { scheme: 'com.catdiehl.styladev' });
}; 