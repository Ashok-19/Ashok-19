// Everything you are likely to want to change lives here.
export default {
  user: 'Ashok-19',
  name: 'ASHOK',
  tagline: 'AI + COMPUTER VISION + RL',

  // Tech stack, left to right. Keys come from scripts/data/icons*.json.
  stack: [
    ['python', 'PYTHON'], ['pytorch', 'PYTORCH'], ['opencv', 'OPENCV'],
    ['docker', 'DOCKER'], ['aws', 'AWS'], ['git', 'GIT'], ['linux', 'LINUX'],
    ['ubuntu', 'UBUNTU'], ['react', 'REACT'], ['mongodb', 'MONGODB'],
    ['mysql', 'MYSQL'], ['firebase', 'FIREBASE'], ['vercel', 'VERCEL'],
  ],

  socials: [
    { id: 'linkedin', icon: 'linkedin', label: 'LINKEDIN', handle: 'ASHOK-19', url: 'https://linkedin.com/in/ashok-19' },
    { id: 'kaggle', icon: 'kaggle', label: 'KAGGLE', handle: 'ASHOK205', url: 'https://www.kaggle.com/ashok205' },
    { id: 'email', icon: 'gmail', label: 'EMAIL', handle: 'SAY HI', url: 'mailto:ashokraja1910@gmail.com' },
  ],

  // Contribution-graph hopping.
  hop: {
    count: 50,        // hops per loop
    airtime: 0.45,    // seconds in the air for a short hop
    extraAir: 0.12,   // extra seconds for the longest possible hop
    land: 0.2,        // seconds standing on a tile before the next hop
    endPause: 1.5,    // pause before the graph resets
  },
};
