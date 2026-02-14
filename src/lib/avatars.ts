// Avatar options for user onboarding
export interface AvatarOption {
  id: string;
  emoji: string;
  label: string;
  category: 'animals' | 'nature' | 'objects' | 'symbols';
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  // Animals
  { id: 'cat', emoji: '🐱', label: 'Chat', category: 'animals' },
  { id: 'dog', emoji: '🐶', label: 'Chien', category: 'animals' },
  { id: 'panda', emoji: '🐼', label: 'Panda', category: 'animals' },
  { id: 'fox', emoji: '🦊', label: 'Renard', category: 'animals' },
  { id: 'tiger', emoji: '🐯', label: 'Tigre', category: 'animals' },
  { id: 'koala', emoji: '🐨', label: 'Koala', category: 'animals' },
  { id: 'monkey', emoji: '🐵', label: 'Singe', category: 'animals' },
  { id: 'penguin', emoji: '🐧', label: 'Pingouin', category: 'animals' },
  
  // Nature
  { id: 'cherry', emoji: '🌸', label: 'Fleur de cerisier', category: 'nature' },
  { id: 'sunflower', emoji: '🌻', label: 'Tournesol', category: 'nature' },
  { id: 'tree', emoji: '🌳', label: 'Arbre', category: 'nature' },
  { id: 'moon', emoji: '🌙', label: 'Lune', category: 'nature' },
  { id: 'star', emoji: '⭐', label: 'Étoile', category: 'nature' },
  { id: 'rainbow', emoji: '🌈', label: 'Arc-en-ciel', category: 'nature' },
  { id: 'fire', emoji: '🔥', label: 'Feu', category: 'nature' },
  { id: 'lightning', emoji: '⚡', label: 'Éclair', category: 'nature' },
  
  // Objects
  { id: 'book', emoji: '📚', label: 'Livres', category: 'objects' },
  { id: 'rocket', emoji: '🚀', label: 'Fusée', category: 'objects' },
  { id: 'crown', emoji: '👑', label: 'Couronne', category: 'objects' },
  { id: 'gem', emoji: '💎', label: 'Diamant', category: 'objects' },
  { id: 'trophy', emoji: '🏆', label: 'Trophée', category: 'objects' },
  { id: 'ninja', emoji: '🥷', label: 'Ninja', category: 'objects' },
  { id: 'samurai', emoji: '⚔️', label: 'Samouraï', category: 'objects' },
  { id: 'origami', emoji: '📄', label: 'Origami', category: 'objects' },
  
  // Symbols
  { id: 'heart', emoji: '❤️', label: 'Cœur', category: 'symbols' },
  { id: 'sparkles', emoji: '✨', label: 'Étincelles', category: 'symbols' },
  { id: 'peace', emoji: '☮️', label: 'Paix', category: 'symbols' },
  { id: 'yin-yang', emoji: '☯️', label: 'Yin Yang', category: 'symbols' },
  { id: 'infinity', emoji: '♾️', label: 'Infini', category: 'symbols' },
  { id: 'music', emoji: '🎵', label: 'Musique', category: 'symbols' },
  { id: 'art', emoji: '🎨', label: 'Art', category: 'symbols' },
  { id: 'magic', emoji: '🪄', label: 'Magie', category: 'symbols' },
];

// Helper function to get avatar by ID
export function getAvatarById(id: string): AvatarOption | undefined {
  return AVATAR_OPTIONS.find(avatar => avatar.id === id);
}

// Helper function to get avatar emoji by ID
export function getAvatarEmoji(id: string): string {
  const avatar = getAvatarById(id);
  return avatar?.emoji || '🐱'; // Default to cat if not found
}

// Convert avatar ID to URL format for storage
export function avatarIdToUrl(id: string): string {
  return `emoji:${id}`;
}

// Convert stored URL back to avatar ID
export function avatarUrlToId(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('emoji:')) {
    return url.replace('emoji:', '');
  }
  return null;
}
