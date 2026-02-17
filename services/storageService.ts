import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import * as ImageManipulator from 'expo-image-manipulator';

const PROFILE_MAX_PX = 1024;
const BANNER_MAX_WIDTH = 1920;
const JPEG_QUALITY = 0.8;

/**
 * Resize an image so its longest side does not exceed `maxPx`.
 * Returns the local URI of the resized JPEG.
 */
async function resizeImage(
  localUri: string,
  maxPx: number,
): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: maxPx } }],
    { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
  );
  return result.uri;
}

/**
 * Convert a local file URI to a Blob suitable for Firebase Storage upload.
 */
async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}

/**
 * Upload a profile picture for the given owner.
 * Resizes to max 1024px, uploads to `owners/{ownerId}/profile.jpg`,
 * and returns the public download URL.
 */
export async function uploadProfileImage(
  ownerId: string,
  localUri: string,
): Promise<string> {
  if (!storage) throw new Error('Firebase Storage is not initialised');

  const resizedUri = await resizeImage(localUri, PROFILE_MAX_PX);
  const blob = await uriToBlob(resizedUri);

  const storageRef = ref(storage, `owners/${ownerId}/profile.jpg`);
  await uploadBytes(storageRef, blob);

  return getDownloadURL(storageRef);
}

/**
 * Upload a banner image for the given owner.
 * Resizes to max 1920px wide, uploads to `owners/{ownerId}/banner.jpg`,
 * and returns the public download URL.
 */
export async function uploadBannerImage(
  ownerId: string,
  localUri: string,
): Promise<string> {
  if (!storage) throw new Error('Firebase Storage is not initialised');

  const resizedUri = await resizeImage(localUri, BANNER_MAX_WIDTH);
  const blob = await uriToBlob(resizedUri);

  const storageRef = ref(storage, `owners/${ownerId}/banner.jpg`);
  await uploadBytes(storageRef, blob);

  return getDownloadURL(storageRef);
}
