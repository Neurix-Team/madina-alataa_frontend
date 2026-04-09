import secureStorage from './secureStorage';

const AVATAR_PROFILE_KEY = 'madinaAvatarProfile';

const DEFAULT_AVATAR_PROFILE = {
  name: 'البطل',
  gender: 'boy',
  skinTone: 'medium',
  hairStyle: 'short',
  hairColor: 'black',
  accessories: [],
  clothes: 'tshirt',
  background: 'gradient1',
  seed: 'madina-default-avatar',
};

const SKIN_MAP = {
  light: 'fcd7b6',
  medium: 'e0ac69',
  tan: 'c68642',
  olive: 'a0764f',
  brown: '8d5524',
  dark: '5c3b1e',
};

const HAIR_MAP = {
  black: '1f2937',
  brown: '6b3f2a',
  blonde: 'f5d57a',
  red: 'b45309',
  blue: '2563eb',
  purple: '7c3aed',
  pink: 'db2777',
  green: '059669',
};


const BG_MAP = {
  gradient1: '3b82f6,b6e3f4',
  gradient2: 'ec4899,db2777',
  gradient3: '10b981,059669',
  gradient4: 'f59e0b,d97706',
  gradient5: '8b5cf6,7c3aed',
  stars: '1e293b,0f172a',
  rainbow: 'ec4899,8b5cf6,3b82f6',
};

const ACCESSORY_MAP = {
  glasses: 'variant01',
  sunglasses: 'variant02',
  hat: 'variant03',
  crown: 'variant04',
  mask: 'variant05',
  flower: 'variant06',
  bow: 'variant07',
  headband: 'variant08',
  earrings: 'variant09',
  bandana: 'variant10',
};

const CLOTHES_MAP = {
  tshirt: 'variant01',
  hoodie: 'variant02',
  jacket: 'variant03',
  dress: 'variant04',
  superhero: 'variant05',
  wizard: 'variant06',
};

export function getSavedAvatarProfile() {
  const raw = secureStorage.getItem(AVATAR_PROFILE_KEY, null);
  if (!raw) return { ...DEFAULT_AVATAR_PROFILE };
  return { ...DEFAULT_AVATAR_PROFILE, ...raw };
}

export function saveAvatarProfile(profile) {
  const payload = {
    ...DEFAULT_AVATAR_PROFILE,
    ...profile,
    seed: profile?.seed || profile?.name || 'madina-default-avatar',
    updatedAt: new Date().toISOString(),
  };
  secureStorage.setItem(AVATAR_PROFILE_KEY, payload);
  return payload;
}


export function buildAvatarUrlFromProfile(profile) {
  const p = { ...DEFAULT_AVATAR_PROFILE, ...profile };

  const skinColor = SKIN_MAP[p.skinTone] || SKIN_MAP.medium;
  const bgColors = BG_MAP[p.background] || BG_MAP.gradient1;

  const ACCESSORIES_MAP_OPENPEEPS = {
    glasses: 'glasses',
    sunglasses: 'sunglasses',
    hat: 'glasses2',
    crown: 'glasses3',
    mask: 'eyepatch',
    flower: 'glasses4',
    bow: 'glasses5',
    headband: 'sunglasses2',
  };

  const HEAD_MAP = {
    boy: {
      short: 'short1',
      medium: 'short2',
      long: 'mediumStraight',
      curly: 'afro',
      wavy: 'mediumStraight',
      braid: 'twists',
      bun: 'bun',
      ponytail: 'long',
    },
    girl: {
      short: 'short1',
      medium: 'mediumStraight',
      long: 'long',
      curly: 'afro',
      wavy: 'mediumStraight',
      braid: 'braids',
      bun: 'bun',
      ponytail: 'long',
    },
  };

  const FACE_MAP = {
    boy: 'smile',
    girl: 'smileBig',
  };

  const CLOTHING_COLOR_MAP = {
    tshirt: '8fa7df',
    hoodie: '4b5563',
    jacket: '1e40af',
    dress: 'ec4899',
    superhero: 'dc2626',
    wizard: '7c3aed',
  };

  const stableSeed = p.seed || p.name || 'madina-default-avatar';
  const visualSignature = [
    p.gender,
    p.skinTone,
    p.hairStyle,
    p.hairColor,
    p.clothes,
    p.background,
    ...(p.accessories || []),
  ].join('-');

  const head =
    HEAD_MAP[p.gender]?.[p.hairStyle] ||
    (p.gender === 'girl' ? 'long' : 'short1');

  const accessory = (p.accessories || [])
    .map((id) => ACCESSORIES_MAP_OPENPEEPS[id])
    .filter(Boolean)
    .slice(0, 1);

  const params = new URLSearchParams({
    seed: `${stableSeed}-${visualSignature}`,
    size: '256',
    backgroundColor: bgColors,
    backgroundType: 'gradientLinear',
    skinColor,
    head,
    face: FACE_MAP[p.gender] || 'smile',
    clothingColor: CLOTHING_COLOR_MAP[p.clothes] || '8fa7df',
    scale: '95',
  });

  if (accessory.length) {
    params.set('accessories', accessory.join(','));
    params.set('accessoriesProbability', '100');
  } else {
    params.set('accessoriesProbability', '0');
  }

  return `https://api.dicebear.com/9.x/open-peeps/svg?${params.toString()}`;
}
export function getAvatarImageUrl() {
  const saved = getSavedAvatarProfile();
  return buildAvatarUrlFromProfile(saved);
}

export { AVATAR_PROFILE_KEY, DEFAULT_AVATAR_PROFILE };
