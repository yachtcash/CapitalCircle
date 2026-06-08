"use client";

import type { ReactNode } from "react";
import { MAP_VIEWBOX } from "@/lib/map/projection";

type Props = {
  children?: ReactNode;
  className?: string;
  ariaLabel?: string;
};

/**
 * Stylized world-map backdrop. Continents are abstract blob paths so we
 * don't depend on a third-party map library. Equirectangular projection
 * is used by the projection helper; markers can be positioned on top.
 */
export default function WorldMapSvg({ children, className, ariaLabel }: Props) {
  const { width, height } = MAP_VIEWBOX;
  return (
    <svg
      role="img"
      aria-label={ariaLabel ?? "World map"}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
    >
      <defs>
        <linearGradient id="map-land" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8E0D2" />
          <stop offset="100%" stopColor="#D8CFBF" />
        </linearGradient>
        <linearGradient id="map-ocean" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F7F2E8" />
          <stop offset="100%" stopColor="#EFE7D8" />
        </linearGradient>
        <pattern
          id="map-grid"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 60 0 L 0 0 0 60"
            fill="none"
            stroke="#0A1628"
            strokeOpacity="0.05"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      {/* Ocean background */}
      <rect width={width} height={height} fill="url(#map-ocean)" />
      <rect width={width} height={height} fill="url(#map-grid)" />

      {/* Greenland */}
      <path
        d="M 540 90 C 580 75 640 80 670 110 C 695 140 690 170 660 195 C 625 215 580 205 555 180 C 535 155 530 120 540 90 Z"
        fill="url(#map-land)"
        stroke="#0A1628"
        strokeOpacity="0.18"
        strokeWidth="0.8"
      />

      {/* North America */}
      <path
        d="M 100 140
           C 130 105 200 100 280 105
           C 360 105 430 115 480 135
           C 520 150 550 170 555 200
           C 555 240 540 270 510 295
           C 495 308 475 318 455 322
           C 435 322 420 322 405 322
           C 390 322 378 325 365 332
           C 350 340 340 360 333 380
           C 327 400 320 420 305 432
           C 290 442 270 442 250 432
           C 230 420 210 400 195 378
           C 180 350 165 320 150 285
           C 135 250 122 215 110 180
           C 100 155 95 145 100 140 Z"
        fill="url(#map-land)"
        stroke="#0A1628"
        strokeOpacity="0.18"
        strokeWidth="0.8"
      />

      {/* Central America thin connector */}
      <path
        d="M 305 432 C 330 442 360 460 385 485 C 405 505 410 525 405 540 C 390 535 365 525 345 510 C 325 495 310 470 305 432 Z"
        fill="url(#map-land)"
        stroke="#0A1628"
        strokeOpacity="0.18"
        strokeWidth="0.8"
      />

      {/* Caribbean dots */}
      <circle cx="430" cy="430" r="6" fill="url(#map-land)" stroke="#0A1628" strokeOpacity="0.18" strokeWidth="0.6" />
      <circle cx="455" cy="450" r="5" fill="url(#map-land)" stroke="#0A1628" strokeOpacity="0.18" strokeWidth="0.6" />
      <circle cx="475" cy="465" r="4" fill="url(#map-land)" stroke="#0A1628" strokeOpacity="0.18" strokeWidth="0.6" />

      {/* South America */}
      <path
        d="M 410 540 C 460 530 510 545 540 580 C 565 615 575 660 565 700 L 540 700 L 510 690 C 485 680 470 660 460 635 C 450 615 440 595 425 580 C 415 565 408 555 410 540 Z"
        fill="url(#map-land)"
        stroke="#0A1628"
        strokeOpacity="0.18"
        strokeWidth="0.8"
      />

      {/* Iceland */}
      <circle cx="700" cy="190" r="14" fill="url(#map-land)" stroke="#0A1628" strokeOpacity="0.18" strokeWidth="0.6" />

      {/* UK + Ireland */}
      <path
        d="M 760 215 C 775 210 790 215 795 230 C 798 245 790 258 775 262 C 762 263 752 255 752 240 C 752 230 755 220 760 215 Z"
        fill="url(#map-land)"
        stroke="#0A1628"
        strokeOpacity="0.18"
        strokeWidth="0.6"
      />

      {/* Western & Central Europe */}
      <path
        d="M 815 215 C 850 207 900 210 935 220 C 960 230 975 250 975 275 C 975 295 965 310 945 320 C 920 325 890 322 860 318 C 835 312 820 300 810 280 C 805 260 808 235 815 215 Z"
        fill="url(#map-land)"
        stroke="#0A1628"
        strokeOpacity="0.18"
        strokeWidth="0.8"
      />

      {/* Africa */}
      <path
        d="M 820 330 C 870 322 920 330 955 350 C 985 370 1000 405 1000 445 C 1000 490 985 530 960 555 C 935 575 905 580 880 568 C 855 555 835 530 825 500 C 815 470 810 440 810 405 C 810 380 813 350 820 330 Z"
        fill="url(#map-land)"
        stroke="#0A1628"
        strokeOpacity="0.18"
        strokeWidth="0.8"
      />

      {/* Middle East */}
      <path
        d="M 985 290 C 1020 285 1060 295 1090 320 C 1110 340 1115 365 1100 380 C 1080 388 1055 385 1025 375 C 1000 365 985 345 982 320 C 980 305 980 295 985 290 Z"
        fill="url(#map-land)"
        stroke="#0A1628"
        strokeOpacity="0.18"
        strokeWidth="0.8"
      />

      {/* Asia (right-edge slice) */}
      <path
        d="M 1100 260 C 1140 250 1180 255 1200 270 L 1200 360 L 1170 365 C 1145 365 1120 355 1105 340 C 1090 320 1085 295 1090 280 C 1093 270 1097 263 1100 260 Z"
        fill="url(#map-land)"
        stroke="#0A1628"
        strokeOpacity="0.18"
        strokeWidth="0.8"
      />

      {/* Subtle region labels — keep them low contrast so markers dominate */}
      <g
        fontFamily="ui-sans-serif, system-ui"
        fontSize="11"
        fontWeight="700"
        letterSpacing="2"
        fill="#0A1628"
        fillOpacity="0.32"
        textAnchor="middle"
      >
        <text x="300" y="180" style={{ textTransform: "uppercase" }}>
          North America
        </text>
        <text x="495" y="610" style={{ textTransform: "uppercase" }}>
          South America
        </text>
        <text x="870" y="260" style={{ textTransform: "uppercase" }}>
          Europe
        </text>
        <text x="905" y="430" style={{ textTransform: "uppercase" }}>
          Africa
        </text>
        <text x="1040" y="335" style={{ textTransform: "uppercase" }}>
          Middle East
        </text>
        <text x="1145" y="305" style={{ textTransform: "uppercase" }}>
          Asia
        </text>
      </g>

      {/* Marker / overlay layer (children) */}
      {children}
    </svg>
  );
}
