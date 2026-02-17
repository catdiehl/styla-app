import { ImageSourcePropType } from 'react-native';

/**
 * Resolve a profile/banner image value to an ImageSourcePropType.
 *
 * - If `pic` is an http(s) URL (Firebase Storage download URL), return { uri }.
 * - Otherwise return null — callers should render a placeholder when null.
 */
export const resolveProfileImage = (
  pic: string | undefined | null,
): ImageSourcePropType | null => {
  if (!pic) return null;

  if (pic.startsWith('http://') || pic.startsWith('https://')) {
    return { uri: pic };
  }

  // Legacy local-asset filenames (e.g. 'default.png', 'maren-prof.png') are no
  // longer bundled.  Return null so the caller renders a placeholder.
  return null;
};
