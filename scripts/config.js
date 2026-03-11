const categoryColors = {
  'village': '#4caf50',
  'wolfpack': '#f44336',
  'coven': '#9c27b0',
  'undead': '#795548',
  'vampires': '#e91e63',
  'neutral': '#ffeb3b',
  'bloodmoon-cult': '#ff9800',
  'holiday-roles': '#00bcd4'
};

const categoryLabels = {
  'village': 'The Village',
  'wolfpack': 'The Wolfpack',
  'coven': 'The Coven',
  'undead': 'The Undead',
  'vampires': 'The Vampires',
  'neutral': 'Neutral Roles',
  'bloodmoon-cult': 'Bloodmoon Cult',
  'holiday-roles': 'Holiday Roles'
};

const categories = [
  'village',
  'wolfpack',
  'coven',
  'undead',
  'vampires',
  'neutral',
  'bloodmoon-cult',
  'holiday-roles'
];

const memberToCategory = {
  'village': 'village',
  'wolfpack': 'wolfpack',
  'coven': 'coven',
  'undead': 'undead',
  'vampires': 'vampires',
  'vampire': 'vampires',
  'neutral': 'neutral',
  'bloodmoon cult': 'bloodmoon-cult',
  'bloodmoon-cult': 'bloodmoon-cult',
  'holiday roles': 'holiday-roles',
  'holiday-roles': 'holiday-roles'
};

function getRoleColor(member, category) {
  if (member) {
    const key = member.toLowerCase().replace(/ /g, '-');
    if (categoryColors[key]) return categoryColors[key];
    if (memberToCategory[key] && categoryColors[memberToCategory[key]]) {
      return categoryColors[memberToCategory[key]];
    }
  }
  return categoryColors[category] || '#fff';
}

module.exports = {
  categoryColors,
  categoryLabels,
  categories,
  memberToCategory,
  getRoleColor
};
