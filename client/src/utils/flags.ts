export const getFlagIcon = (flagValue: string): string => {
  const flagIcons: Record<string, string> = {
    'red-wine': '⚡',
    'white-wine': '🪿',
    'golden-chalice': '💃',
    'kitten-mittens': '🐱',
    'greenman': '💚',
    'aluminum-monster': '🤖',
    'cricket': '🦗',
    'rum-ham': '🍖',
    'fight-milk': '🥛',
  };

  return flagIcons[flagValue] || '⚡'; // Default to Thundermen
};

export const getFlagLabel = (flagValue: string): string => {
  const flagLabels: Record<string, string> = {
    'red-wine': 'Thundermen',
    'white-wine': 'Golden Geese',
    'golden-chalice': 'Electric Boogaloo',
    'kitten-mittens': 'Kitten Mittens',
    'greenman': 'Green Man',
    'aluminum-monster': 'Aluminum Monster',
    'cricket': 'Cricket',
    'rum-ham': 'Rum Ham',
    'fight-milk': 'Fight Milk',
  };

  return flagLabels[flagValue] || 'Thundermen';
};
