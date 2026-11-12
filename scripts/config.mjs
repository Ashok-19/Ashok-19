// Everything you are likely to want to change lives here.
export default {
  user: 'Ashok-19',
  name: 'ASHOK',
  tagline: 'AI + COMPUTER VISION + RL',

  // Tech stack, in order. Keys come from scripts/data/icons*.json.
  // 'fly' logos drift past in the air in the header; the dino runs under them.
  stack: [
    ['python', 'PYTHON'], ['pytorch', 'PYTORCH'], ['opencv', 'OPENCV'],
    ['docker', 'DOCKER'], ['aws', 'AWS', 'fly'], ['git', 'GIT'], ['linux', 'LINUX'],
    ['ubuntu', 'UBUNTU'], ['react', 'REACT', 'fly'], ['mongodb', 'MONGODB'],
    ['mysql', 'MYSQL'], ['firebase', 'FIREBASE', 'fly'], ['vercel', 'VERCEL', 'fly'],
  ],

  socials: [
    { id: 'linkedin', icon: 'linkedin', label: 'LINKEDIN', handle: 'ASHOK-19', url: 'https://linkedin.com/in/ashok-19' },
    { id: 'kaggle', icon: 'kaggle', label: 'KAGGLE', handle: 'ASHOK205', url: 'https://www.kaggle.com/ashok205' },
    { id: 'email', icon: 'gmail', label: 'EMAIL', handle: 'SAY HI', url: 'mailto:ashokraja1910@gmail.com' },
  ],

  // Contribution-graph hopping: the dino visits every active day, nearest first.
  hop: {
    airtime: 0.5,     // seconds in the air for a hop to a neighbouring tile
    extraAir: 0.4,    // up to this much extra air time for long hops over gaps
    land: 0.35,       // seconds standing on a tile before the next hop
    endPause: 1.5,    // pause after the last tile before the graph resets
  },
};
