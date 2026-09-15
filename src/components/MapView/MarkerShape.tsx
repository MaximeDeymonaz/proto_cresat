interface MarkerShapeProps {
  radius: number;
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
}

/** Cercle proportionnel, identique au marqueur de la carte. */
export function MarkerShape({
  radius,
  color,
  strokeColor = '#fff',
  strokeWidth = 1.4,
}: MarkerShapeProps) {
  return <circle r={radius} fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />;
}
