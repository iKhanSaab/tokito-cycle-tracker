import { useRef, useState, useCallback } from 'react';

interface CircularSleepSliderProps {
  value: number;
  onChange: (hours: number) => void;
}

function getSleepColor(hours: number): string {
  if (hours < 6) return 'hsl(var(--sleep-red))';
  if (hours < 8 || hours > 20) return 'hsl(var(--sleep-yellow))';
  return 'hsl(var(--sleep-green))';
}

function getSleepLabel(hours: number): string {
  if (hours < 6) return 'Concerning';
  if (hours < 8) return 'Could be better';
  if (hours <= 10) return 'Healthy';
  if (hours <= 20) return 'A lot of sleep';
  return 'Warning';
}

export function CircularSleepSlider({ value, onChange }: CircularSleepSliderProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 70;
  const strokeWidth = 12;

  const angle = (value / 24) * 360 - 90; // -90 to start from top
  const angleRad = (angle * Math.PI) / 180;
  const knobX = cx + radius * Math.cos(angleRad);
  const knobY = cy + radius * Math.sin(angleRad);

  // Arc path
  const startAngle = -90;
  const endAngle = angle;
  const largeArc = (endAngle - startAngle + 360) % 360 > 180 ? 1 : 0;

  const startX = cx + radius * Math.cos((startAngle * Math.PI) / 180);
  const startY = cy + radius * Math.sin((startAngle * Math.PI) / 180);

  const arcPath = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${knobX} ${knobY}`;

  const getHoursFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return value;
      const rect = svgRef.current.getBoundingClientRect();
      const x = clientX - rect.left - cx;
      const y = clientY - rect.top - cy;
      let deg = (Math.atan2(y, x) * 180) / Math.PI + 90;
      if (deg < 0) deg += 360;
      const hours = Math.round((deg / 360) * 48) / 2; // snap to 0.5
      return Math.min(24, Math.max(0, hours));
    },
    [cx, cy, value]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    const h = getHoursFromEvent(e.clientX, e.clientY);
    onChange(h);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const h = getHoursFromEvent(e.clientX, e.clientY);
    onChange(h);
  };

  const handlePointerUp = () => setDragging(false);

  const color = getSleepColor(value);
  const label = getSleepLabel(value);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Sleep</label>
      <div className="flex flex-col items-center">
        <svg
          ref={svgRef}
          width={size}
          height={size}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="touch-none cursor-pointer"
        >
          {/* Background track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Filled arc */}
          {value > 0 && (
            <path
              d={arcPath}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="sleep-ring"
            />
          )}
          {/* Knob */}
          <circle
            cx={knobX}
            cy={knobY}
            r={10}
            fill={color}
            stroke="hsl(var(--background))"
            strokeWidth={3}
            className="drop-shadow-md"
          />
          {/* Center text */}
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            className="fill-foreground font-heading"
            fontSize="20"
            fontWeight="700"
          >
            {value}h
          </text>
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            fontSize="12"
            fontWeight="500"
            fill={color}
          >
            {label}
          </text>
        </svg>
      </div>
    </div>
  );
}
