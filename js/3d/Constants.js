export const ROOM_W     = 20;
export const ROOM_D     = 24;
export const ROOM_H     = 6;
export const ROOM_COUNT = 5;
export const TOTAL_D    = ROOM_D * ROOM_COUNT;
export const DOOR_W     = 3.0;
export const DOOR_H     = 3.5;

export const STRAND_COLORS = {
  philosophie: 0x3f5775,
  religion:    0x3a5a48,
  geschichte:  0x6b5236,
};

export const STRAND_HEX = {
  philosophie: '#3f5775',
  religion:    '#3a5a48',
  geschichte:  '#6b5236',
};

export const STRAND_LABELS_DE = {
  philosophie: 'Philosophie',
  religion:    'Religion',
  geschichte:  'Geschichte',
};

export const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

// Subtle ceiling tints per room
export const ROOM_TINTS = [
  0xe8edf5,   // I  — Antike, blaugrau
  0xe3ede8,   // II — Mittelalter, grüngrau
  0xf0e8e0,   // III— Bruch, warmbeige
  0xf0e5e3,   // IV — Herausforderung, rosé
  0xeae9e7,   // V  — Moderne, kühles grau
];
