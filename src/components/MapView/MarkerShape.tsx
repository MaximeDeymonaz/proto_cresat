import type { PointCategory } from '../../types';

interface MarkerShapeProps {
  cat: PointCategory;
  size: number;
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
  extraProps?: React.SVGAttributes<SVGElement>;
}

/** Génère les points d'une étoile à n branches */
function starPoints(outerR: number, innerR: number, n = 5): string {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const angle = (Math.PI / n) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${(r * Math.cos(angle)).toFixed(3)},${(r * Math.sin(angle)).toFixed(3)}`);
  }
  return pts.join(' ');
}

export function MarkerShape({
  cat,
  size,
  color,
  strokeColor = '#fff',
  strokeWidth = 1.6,
  extraProps,
}: MarkerShapeProps) {
  const base = {
    fill: color,
    stroke: strokeColor,
    strokeWidth,
    strokeLinejoin: 'round' as const,
    ...extraProps,
  };

  if (cat === 'siege') {
    // Étoile 5 branches identique à la légende
    const outerR = size * 1.35;
    const innerR = size * 0.54;
    return (
      <polygon
        points={starPoints(outerR, innerR)}
        fill={color}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        {...extraProps}
      />
    );
  }

  if (cat === 'bureau') {
    return <rect x={-size} y={-size} width={size * 2} height={size * 2} rx={1.5} {...base} />;
  }

  if (cat === 'envoye') {
    const p = `0,${-(size * 1.3).toFixed(2)} ${(size * 1.1).toFixed(2)},0 0,${(size * 1.3).toFixed(2)} ${-(size * 1.1).toFixed(2)},0`;
    return <polygon points={p} {...base} />;
  }

  if (cat === 'fournisseur') {
    const p = `0,${-(size * 1.25).toFixed(2)} ${(size * 1.1).toFixed(2)},${(size * 0.82).toFixed(2)} ${-(size * 1.1).toFixed(2)},${(size * 0.82).toFixed(2)}`;
    return <polygon points={p} {...base} />;
  }

  // client → cercle
  return <circle r={size} {...base} />;
}
