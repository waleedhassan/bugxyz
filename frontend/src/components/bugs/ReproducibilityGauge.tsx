interface ReproducibilityGaugeProps {
  score: number;
  size?: number;
}

export default function ReproducibilityGauge({ score, size = 100 }: ReproducibilityGaugeProps) {
  const radius = (size - 12) / 2;
  const circumference = radius * Math.PI;
  const normalizedScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (normalizedScore / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 80) return 'text-green-500';
    if (val >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStroke = (val: number) => {
    if (val >= 80) return '#22c55e';
    if (val >= 50) return '#eab308';
    return '#ef4444';
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        <path
          d={`M ${6} ${size / 2 + 4} A ${radius} ${radius} 0 0 1 ${size - 6} ${size / 2 + 4}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted"
        />
        <path
          d={`M ${6} ${size / 2 + 4} A ${radius} ${radius} 0 0 1 ${size - 6} ${size / 2 + 4}`}
          fill="none"
          stroke={getStroke(normalizedScore)}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          className={`${getColor(normalizedScore)} fill-current text-lg font-bold`}
          fontSize={size / 5}
        >
          {normalizedScore}%
        </text>
      </svg>
      <p className="text-xs text-muted-foreground">Reproducibility</p>
    </div>
  );
}
