import { GitHubData } from './github';

export interface TerrariumAsset {
  weekIdx:    number;
  height:     number;      // asset scale height
  assetType:  'grass' | 'flower' | 'mushroom' | 'empty';
  color:      string;
}

export interface ToyData {
  type:     'ball' | 'bowl' | 'yarn';
  x:        number;
}

export interface PetData {
  assets:             TerrariumAsset[];
  toys:               ToyData[];
  petType:            'fox' | 'dragon' | 'snake' | 'gopher' | 'golem';
  evolutionStage:     'egg' | 'child' | 'teen' | 'legendary';
  accessory:          'none' | 'partyhat' | 'wizardhat' | 'crown';
  emotion:            'happy' | 'neutral' | 'sad' | 'sweat';
  messyCount:         number;   // open issues dust bunnies
  bgColorTop:         string;
  bgColorBottom:      string;
  groundColor:        string;
  petColor1:          string;
  petColor2:          string;
  totalStars:         number;
  totalContributions: number;
  streak:             number;
  username:           string;
}

const PET_THEMES: Record<string, { bgTop: string, bgBottom: string, ground: string, petType: PetData['petType'], c1: string, c2: string }> = {
  JavaScript: {
    bgTop: '#2c3e50', bgBottom: '#1a252f', ground: '#8c7e5a', petType: 'fox', c1: '#ff9f43', c2: '#ff6b6b'
  },
  TypeScript: {
    bgTop: '#1b324f', bgBottom: '#0c1a2b', ground: '#566573', petType: 'dragon', c1: '#54a0ff', c2: '#5f27cd'
  },
  Python: {
    bgTop: '#1e3825', bgBottom: '#0e1d13', ground: '#5a7856', petType: 'snake', c1: '#10ac84', c2: '#1dd1a1'
  },
  Go: {
    bgTop: '#112d36', bgBottom: '#07161b', ground: '#5a6b5c', petType: 'gopher', c1: '#00afdb', c2: '#8395a7'
  },
  Rust: {
    bgTop: '#3a2016', bgBottom: '#1a0e0a', ground: '#78564a', petType: 'golem', c1: '#ee5253', c2: '#57606f'
  }
};

const DEFAULT_THEME = {
  bgTop: '#2d3436', bgBottom: '#1e272e', ground: '#57606f', petType: 'fox' as PetData['petType'], c1: '#ffeaa7', c2: '#fdcb6e'
};

export function buildPet(data: GitHubData): PetData {
  const theme = PET_THEMES[data.topLanguage] || DEFAULT_THEME;
  const allMax = Math.max(...data.weeks.flatMap(w => w.map(d => d.count)), 1);

  // 1. Build background plants / terrarium assets from weekly commits
  const assets: TerrariumAsset[] = data.weeks.map((week, i) => {
    const maxCount = Math.max(...week.map(d => d.count), 0);
    let height = 0;
    let assetType: TerrariumAsset['assetType'] = 'empty';

    if (maxCount > 0) {
      const norm = Math.log(maxCount + 1) / Math.log(allMax + 1);
      height = Math.round(5 + norm * 35);
      assetType = maxCount > 8 ? 'mushroom' : maxCount > 4 ? 'flower' : 'grass';
    }

    const colPalette = ['#2ecc71', '#27ae60', '#f1c40f', '#e67e22', '#e74c3c', '#9b59b6'];
    const color = colPalette[(maxCount + i) % colPalette.length];

    return {
      weekIdx: i,
      height,
      assetType,
      color,
    };
  });

  // 2. Evolution Stage from Active Streak
  let evolutionStage: PetData['evolutionStage'] = 'egg';
  if (data.streak >= 15) evolutionStage = 'legendary';
  else if (data.streak >= 8) evolutionStage = 'teen';
  else if (data.streak >= 3) evolutionStage = 'child';

  // 3. Accessory based on Stars
  let accessory: PetData['accessory'] = 'none';
  if (data.totalStars >= 500) accessory = 'crown';
  else if (data.totalStars >= 100) accessory = 'wizardhat';
  else if (data.totalStars >= 10) accessory = 'partyhat';

  // 4. Emotion based on Open Issues
  let emotion: PetData['emotion'] = 'happy';
  if (data.openIssues > 40) emotion = 'sad';
  else if (data.openIssues > 20) emotion = 'sweat';
  else if (data.openIssues > 5) emotion = 'neutral';

  // 5. Toys from closed issues / PRs
  const toys: ToyData[] = [];
  const seed = data.username.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  if (data.closedIssues > 0) {
    const toyCount = Math.min(3, Math.ceil(data.closedIssues / 15));
    const types: ToyData['type'][] = ['ball', 'bowl', 'yarn'];
    for (let i = 0; i < toyCount; i++) {
      toys.push({
        type: types[(seed + i) % types.length],
        x: 150 + ((seed * (i + 1) * 29) % 600),
      });
    }
  }

  // 6. Dust bunnies representing messy unresolved issues
  const messyCount = Math.min(10, Math.floor(data.openIssues / 5));

  return {
    assets,
    toys,
    petType: theme.petType,
    evolutionStage,
    accessory,
    emotion,
    messyCount,
    bgColorTop: theme.bgTop,
    bgColorBottom: theme.bgBottom,
    groundColor: theme.ground,
    petColor1: theme.c1,
    petColor2: theme.c2,
    totalStars: data.totalStars,
    totalContributions: data.totalContributions,
    streak: data.streak,
    username: data.username,
  };
}
