type Props = {
  points: number[];
  height?: number;
  width?: number;
};

export default function MiniSparkline({
  points,
  height = 36,
  width = 120,
}: Props) {
  if (!points || points.length === 0) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="No data"
        className="block"
      >
        <line
          x1={0}
          y1={height - 1}
          x2={width}
          y2={height - 1}
          stroke="#D4AF37"
          strokeOpacity={0.2}
          strokeWidth={1}
        />
      </svg>
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = points.length > 1 ? width / (points.length - 1) : width;
  const padY = 2;
  const usable = height - padY * 2;

  const coords = points.map((value, index) => {
    const x = index * stepX;
    const normalized = (value - min) / range;
    const y = height - padY - normalized * usable;
    return { x, y };
  });

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
    .join(" ");

  const fillPath =
    `${linePath} L ${width} ${height} L 0 ${height} Z`;

  const gradientId = `mini-spark-${points
    .slice(0, 3)
    .map((v) => Math.round(v))
    .join("-")}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Trend chart, ${points.length} data points`}
      className="block"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke="#D4AF37"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
