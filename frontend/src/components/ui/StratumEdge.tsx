interface StratumEdgeProps {
  color: string;
  position?: 'top' | 'raised' | 'below';
}

const positions = {
  top: 'top-0',
  raised: '-top-5',
  below: 'top-full',
};

/** Bord irrégulier entre deux couches de terrain. */
export function StratumEdge({ color, position = 'top' }: StratumEdgeProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 24"
      preserveAspectRatio="none"
      className={`absolute left-0 w-full h-5 ${positions[position]}`}
    >
      <path
        fill={color}
        d={
          position === 'raised'
            ? 'M0 24V14C180 4 320 18 520 12S860 2 1040 10 1320 18 1440 8V24Z'
            : 'M0 0V10C200 20 340 6 540 12S880 22 1060 12 1320 4 1440 14V0Z'
        }
      />
    </svg>
  );
}
