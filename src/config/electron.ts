export interface ElectronData {
  str: string;
  shells: number[];
}

const orbitals = ['1s','2s','2p','3s','3p','4s','3d','4p','5s','4d','5p','6s','4f','5d','6p','7s','5f','6d','7p'];

const capacities: Record<string, number> = { s: 2, p: 6, d: 10, f: 14 };

const exceptions: Record<number, Record<string, number>> = {
  24: { '4s': 1, '3d': 5 },
  29: { '4s': 1, '3d': 10 },
  41: { '5s': 1, '4d': 4 },
  42: { '5s': 1, '4d': 5 },
  44: { '5s': 1, '4d': 7 },
  45: { '5s': 1, '4d': 8 },
  46: { '5s': 0, '4d': 10 },
  47: { '5s': 1, '4d': 10 },
  78: { '6s': 1, '5d': 9 },
  79: { '6s': 1, '5d': 10 },
};

export function getElectronData(Z: number): ElectronData {
  const config: Record<string, number> = {};
  let remaining = Z;

  for (const orb of orbitals) {
    if (remaining <= 0) break;
    const type = orb.charAt(1);
    const cap = capacities[type];
    const fill = Math.min(remaining, cap);
    config[orb] = fill;
    remaining -= fill;
  }

  if (exceptions[Z]) {
    const patch = exceptions[Z];
    for (const orb in patch) {
      config[orb] = patch[orb];
    }
  }

  const sortOrb = (a: string, b: string): number => {
    const n1 = parseInt(a[0]);
    const n2 = parseInt(b[0]);
    if (n1 !== n2) return n1 - n2;
    const order = 'spdf';
    return order.indexOf(a[1]) - order.indexOf(b[1]);
  };

  const str = Object.keys(config)
    .filter(k => config[k] > 0)
    .sort(sortOrb)
    .map(k => `${k}<sup>${config[k]}</sup>`)
    .join(' ');

  const shells: number[] = [];
  Object.keys(config).forEach(orb => {
    const n = parseInt(orb[0]);
    shells[n - 1] = (shells[n - 1] || 0) + config[orb];
  });

  for (let i = 0; i < shells.length; i++) {
    if (!shells[i]) shells[i] = 0;
  }

  return { str, shells };
}
