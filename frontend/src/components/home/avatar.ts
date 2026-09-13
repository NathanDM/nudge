const PALETTE = [
  '#FFD2B3', '#F5CD69', '#A7D49B', '#A8D8AA', '#66B1B0',
  '#C4B7E8', '#A87A86', '#98CBE9', '#9FAED9', '#E892A7',
  '#F88C85', '#DFA28A', '#B88A66', '#85A68B', '#8FA6A3',
  '#E3D4F3', '#F7C3CF',
];

export function colorForId(id: string) {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

export function textColorFor(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) / 255 > 0.65 ? '#2D5954' : '#fff';
}

export function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2);
}
