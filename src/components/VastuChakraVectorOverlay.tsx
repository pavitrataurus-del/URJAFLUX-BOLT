import React, { useState } from "react";
import { VASTU_16_ZONES, VASTU_32_PADAS, describeSvgSector } from "./vastuChakraData";

const CONTROL_RADIUS = 18;

interface ChakraControlButtonProps {
  active?: boolean;
  title: string;
  label?: string;
  cursor?: string;
  onMouseDown?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
}

const ChakraControlButton: React.FC<ChakraControlButtonProps> = ({
  active = false,
  title,
  label,
  cursor = "pointer",
  onMouseDown,
  onClick,
  icon,
}) => {
  const stopBubble = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <g
      className="chakra-control-btn"
      style={{ cursor }}
      onMouseDown={(e) => {
        stopBubble(e);
        onMouseDown?.(e);
      }}
      onClick={(e) => {
        stopBubble(e);
        e.preventDefault();
        onClick?.(e);
      }}
    >
      <title>{title}</title>
      <circle
        r={CONTROL_RADIUS}
        fill="rgba(15, 23, 42, 0.82)"
        stroke={active ? "#38bdf8" : "rgba(52, 211, 153, 0.7)"}
        strokeWidth={active ? 2.5 : 1.5}
        filter="url(#control-shadow)"
      />
      <circle r={CONTROL_RADIUS - 1} fill="url(#chakra-glass-grad)" pointerEvents="none" />
      {active && (
        <circle
          r={CONTROL_RADIUS + 2}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.5"
          opacity="0.85"
          pointerEvents="none"
        />
      )}
      <g pointerEvents="none">{icon}</g>
      {label && (
        <text
          y={14}
          textAnchor="middle"
          fill="#f8fafc"
          fontSize="7"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
          pointerEvents="none"
        >
          {label}
        </text>
      )}
    </g>
  );
};

const MoveIcon = () => (
  <g stroke="#f8fafc" strokeWidth="1.6" strokeLinecap="round">
    <line x1="0" y1="-5" x2="0" y2="5" />
    <line x1="-5" y1="0" x2="5" y2="0" />
    <polyline points="-2,-3 0,-5 2,-3" fill="none" />
    <polyline points="-2,3 0,5 2,3" fill="none" />
    <polyline points="-3,-2 -5,0 -3,2" fill="none" />
    <polyline points="3,-2 5,0 3,2" fill="none" />
  </g>
);

const RotateIcon = () => (
  <g>
    <path
      d="M -5.5 -1.5 A 6.5 6.5 0 1 1 -1.5 5.5"
      fill="none"
      stroke="#f8fafc"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M -5.5 -1.5 L -8.5 -4.5 M -5.5 -1.5 L -2.5 -4.5"
      fill="none"
      stroke="#f8fafc"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </g>
);

const ExpandIcon = () => (
  <g stroke="#f8fafc" strokeWidth="2" strokeLinecap="round">
    <line x1="-6" y1="0" x2="6" y2="0" />
    <line x1="0" y1="-6" x2="0" y2="6" />
  </g>
);

const ShrinkIcon = () => (
  <line x1="-6" y1="0" x2="6" y2="0" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
);

export interface VastuChakraProps {
  cx?: number;
  cy?: number;
  radius?: number;
  rotation?: number; // North calibration angle in degrees
  scale?: number;
  aspect?: number;
  opacity?: number;
  zoom?: number;
  /** When set, cx/cy are world meters (+Y North) and are converted to SVG using ppm. */
  pixelsPerMeter?: number;
  show16Zones?: boolean;
  show32Padas?: boolean;
  showBrahmasthan?: boolean;
  showCompass?: boolean;
  showDegreeTicks?: boolean;
  locked?: boolean;
  isSelected?: boolean;

  onChangeRotation?: (newRot: number) => void;
  onChangeScale?: (newScale: number) => void;
  onChangePosition?: (newX: number, newY: number) => void;
  onRotate?: () => void;
  onExpand?: () => void;
  onShrink?: () => void;
  onSelect?: () => void;
}

export const VastuChakraVectorOverlay: React.FC<VastuChakraProps> = ({
  cx = 0,
  cy = 0,
  radius = 280,
  rotation = 0,
  scale = 1.0,
  aspect = 1.0,
  opacity = 0.9, // Ultra-high CAD visibility with lightweight 10-15% pastel fills
  zoom = 1.0,
  pixelsPerMeter = 0,
  show16Zones = true,
  show32Padas = true,
  showBrahmasthan = true,
  showCompass = true,
  showDegreeTicks = true,
  locked = false,
  isSelected = true,
  onChangeRotation,
  onChangeScale,
  onChangePosition,
  onExpand,
  onShrink,
  onSelect
}) => {
  const [isRotating, setIsRotating] = useState(false);
  const [activeControl, setActiveControl] = useState<"expand" | "shrink" | null>(null);

  const R = radius * scale;
  const dragHitRadius = Math.min(R * 0.4, 120);
  const usesWorldCoords = pixelsPerMeter > 0;
  const ppm = usesWorldCoords ? pixelsPerMeter : 1;
  const svgCx = usesWorldCoords ? cx * ppm : cx;
  const svgCy = usesWorldCoords ? -cy * ppm : cy;
  const padaOuterR = R + 14;
  const degreeRingR = R + 32;
  const innerR = R * 0.32;
  const brahmasthanR = R * 0.28;
  /** Cardinal labels sit outside the degree ring; controls sit between ring and label */
  const cardinalLabelArm = degreeRingR + 58;
  const controlArm = degreeRingR + 26;
  const uiScale = 1 / Math.max(0.1, zoom);

  // Degrees for degree ticks (every 3 degrees)
  const degreeTicks = Array.from({ length: 120 }, (_, i) => i * 3);

  const getOverlayCenterClient = (overlayEl: SVGGElement, svg: SVGSVGElement) => {
    const pt = svg.createSVGPoint();
    pt.x = 0;
    pt.y = 0;
    const ctm = overlayEl.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const p = pt.matrixTransform(ctm);
    return { x: p.x, y: p.y };
  };

  const getPointerAngleDeg = (
    clientX: number,
    clientY: number,
    overlayEl: SVGGElement,
    svg: SVGSVGElement
  ) => {
    const center = getOverlayCenterClient(overlayEl, svg);
    return Math.atan2(clientY - center.y, clientX - center.x) * (180 / Math.PI);
  };

  // Continuous drag rotation — handle stays at North (top) on outer ring
  const handleRotateDragMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (locked) return;
    if (onSelect) onSelect();

    const overlayEl = (e.currentTarget as SVGElement).closest("#vastu-chakra-cad-overlay") as SVGGElement | null;
    const svg = overlayEl?.ownerSVGElement;
    if (!overlayEl || !svg) return;

    setIsRotating(true);
    const startPointerAngle = getPointerAngleDeg(e.clientX, e.clientY, overlayEl, svg);
    const startRotation = rotation;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.stopPropagation();
      const pointerAngle = getPointerAngleDeg(moveEvent.clientX, moveEvent.clientY, overlayEl, svg);
      let delta = pointerAngle - startPointerAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      let newRot = startRotation + delta;
      newRot = ((newRot % 360) + 360) % 360;
      if (onChangeRotation) {
        onChangeRotation(Math.round(newRot * 10) / 10);
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      upEvent.stopPropagation();
      setIsRotating(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Drag Center Position Handler
  const handlePositionMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (locked) return;
    if (onSelect) onSelect();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = cx;
    const initialY = cy;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.stopPropagation();
      const scaleFactor = Math.max(0.1, ppm * zoom);
      const dx = (moveEvent.clientX - startX) / scaleFactor;
      const dy = usesWorldCoords
        ? -(moveEvent.clientY - startY) / scaleFactor
        : (moveEvent.clientY - startY) / Math.max(0.1, zoom);
      if (onChangePosition) {
        onChangePosition(
          Math.round((initialX + dx) * 100) / 100,
          Math.round((initialY + dy) * 100) / 100
        );
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      upEvent.stopPropagation();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const applyScaleDelta = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(3.0, Math.round((scale + delta) * 100) / 100));
    if (onChangeScale) onChangeScale(newScale);
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onSelect) onSelect();
    setActiveControl("expand");
    window.setTimeout(() => setActiveControl(null), 180);
    if (onExpand) onExpand();
    else applyScaleDelta(0.15);
  };

  const handleShrink = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onSelect) onSelect();
    setActiveControl("shrink");
    window.setTimeout(() => setActiveControl(null), 180);
    if (onShrink) onShrink();
    else applyScaleDelta(-0.15);
  };

  const stopOverlayMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <g
      id="vastu-chakra-cad-overlay"
      transform={`translate(${svgCx}, ${svgCy}) rotate(${rotation}) scale(${aspect}, 1)`}
      style={{ opacity, pointerEvents: "all" }}
      onMouseDown={stopOverlayMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect();
      }}
    >
      {/* SVG DEFINITIONS - ULTRA-LIGHT PASTEL GRADIENTS (MAX 10-15% OPACITY) FOR CAD TRANSPARENCY */}
      <defs>
        {/* Water Element Gradient (Light Cyan/Blue) */}
        <radialGradient id="grad-water" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.14" />
          <stop offset="70%" stopColor="#0284c7" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0.03" />
        </radialGradient>
        <radialGradient id="grad-water-ne" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.15" />
          <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.03" />
        </radialGradient>

        {/* Air / Wood Element Gradient (Light Emerald/Mint) */}
        <radialGradient id="grad-air" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.14" />
          <stop offset="70%" stopColor="#10b981" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0.03" />
        </radialGradient>

        {/* Fire Element Gradient (Light Crimson/Coral) */}
        <radialGradient id="grad-fire" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f87171" stopOpacity="0.15" />
          <stop offset="70%" stopColor="#ef4444" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.03" />
        </radialGradient>

        {/* Earth Element Gradient (Light Gold/Amber) */}
        <radialGradient id="grad-earth" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.15" />
          <stop offset="70%" stopColor="#d97706" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#92400e" stopOpacity="0.03" />
        </radialGradient>

        {/* Space / Metal Element Gradient (Light Lavender/Platinum) */}
        <radialGradient id="grad-space" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.14" />
          <stop offset="70%" stopColor="#a855f7" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#6b21a8" stopOpacity="0.03" />
        </radialGradient>

        {/* Minimal Subtle Drop Shadow Filter */}
        <filter id="chakra-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="control-shadow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#020617" floodOpacity="0.55" />
        </filter>

        <linearGradient id="chakra-glass-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* 1. OUTER DEGREE RING & TICKS & NUMBERS (HAIRLINE CAD VECTORS) */}
      {/* Outer Circle (Transparent Fill so CAD plan passes 100% through) */}
      <circle cx={0} cy={0} r={degreeRingR + 12} fill="none" stroke="rgba(244, 63, 94, 0.35)" strokeWidth="0.8" />
      <circle cx={0} cy={0} r={degreeRingR} fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 2" />
      <circle cx={0} cy={0} r={padaOuterR} fill="none" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="0.8" />

      {/* Degree Ticks around Outer Rim */}
      {showDegreeTicks && degreeTicks.map(deg => {
        const rad = ((deg - 90) * Math.PI) / 180;
        const is30 = deg % 30 === 0;
        const is11_25 = deg % 11.25 === 0;
        const is15 = deg % 15 === 0;
        const tickLen = is30 ? 10 : is15 || is11_25 ? 7 : 4;
        const x1 = degreeRingR * Math.cos(rad);
        const y1 = degreeRingR * Math.sin(rad);
        const x2 = (degreeRingR + tickLen) * Math.cos(rad);
        const y2 = (degreeRingR + tickLen) * Math.sin(rad);

        return (
          <line
            key={`tick-${deg}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={is30 ? "#38bdf8" : is15 ? "rgba(255, 255, 255, 0.85)" : "rgba(244, 63, 94, 0.5)"}
            strokeWidth={is30 ? 1.2 : 0.8}
            opacity={is30 ? 1 : 0.7}
          />
        );
      })}

      {/* Degree Callout Numbers at 10° Intervals (0°, 10°, 20°, ... 350°) */}
      {showDegreeTicks && Array.from({ length: 36 }, (_, i) => i * 10).map(deg => {
        const rad = ((deg - 90) * Math.PI) / 180;
        const is30 = deg % 30 === 0;
        const numR = degreeRingR + 8;
        const x = numR * Math.cos(rad);
        const y = numR * Math.sin(rad);

        return (
          <text
            key={`deg-num-${deg}`}
            x={x}
            y={y}
            transform={`rotate(${-rotation}, ${x}, ${y})`}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#ffffff"
            stroke="#0f172a"
            strokeWidth="1.2"
            style={{ paintOrder: "stroke fill" }}
            fontSize={is30 ? "9" : "7.5"}
            fontWeight={is30 ? "800" : "700"}
            fontFamily="system-ui, sans-serif"
          >
            {deg}°
          </text>
        );
      })}

      {/* 2. 32 SUB-ENTRANCE PADAS (E1-E8, S1-S8, W1-W8, N1-N8) OUTER RING NOTCHES */}
      {show32Padas && VASTU_32_PADAS.map(pada => {
        const pathD = describeSvgSector(0, 0, R, padaOuterR, pada.startDeg, pada.endDeg);
        const centerRad = ((pada.centerDeg - 90) * Math.PI) / 180;
        const textR = (R + padaOuterR) / 2;
        const textX = textR * Math.cos(centerRad);
        const textY = textR * Math.sin(centerRad);

        return (
          <g key={`pada-${pada.code}`}>
            {/* Sector Fill for Pada Notch (Transparent pastel tint for auspicious padas) */}
            <path
              d={pathD}
              fill={pada.isAuspicious ? "rgba(16, 185, 129, 0.22)" : "none"}
              stroke={pada.isAuspicious ? "#34d399" : "rgba(255, 255, 255, 0.25)"}
              strokeWidth="0.8"
            />
            {/* Radial Divider for 32 Sub-Entrance Boundaries (11.25° Ticks) */}
            <line
              x1={R * Math.cos(centerRad)}
              y1={R * Math.sin(centerRad)}
              x2={padaOuterR * Math.cos(centerRad)}
              y2={padaOuterR * Math.sin(centerRad)}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="0.8"
            />
            {/* Pada Code Text Label (Clean floating text, no dark box) */}
            <text
              x={textX}
              y={textY}
              transform={`rotate(${-rotation}, ${textX}, ${textY})`}
              textAnchor="middle"
              dominantBaseline="central"
              fill={pada.isAuspicious ? "#34d399" : "#e2e8f0"}
              stroke="#0f172a"
              strokeWidth="1.2"
              style={{ paintOrder: "stroke fill" }}
              fontSize="7.5"
              fontWeight={pada.isAuspicious ? "800" : "600"}
              fontFamily="monospace, sans-serif"
            >
              {pada.code}
            </text>
          </g>
        );
      })}

      {/* 3. 16 SECTOR ZONES (SECTORS & BOUNDARIES) WITH ULTRA-TRANSPARENT 5-ELEMENT TINTS */}
      {show16Zones && VASTU_16_ZONES.map(zone => {
        const pathD = describeSvgSector(0, 0, innerR, R, zone.startDeg, zone.endDeg);
        const centerRad = ((zone.centerDeg - 90) * Math.PI) / 180;
        const startRad = ((zone.startDeg - 90) * Math.PI) / 180;
        
        // Label position
        const labelR = R * 0.70;
        const labelX = labelR * Math.cos(centerRad);
        const labelY = labelR * Math.sin(centerRad);

        return (
          <g key={zone.code} className="zone-sector-group">
            {/* Sector Fill with Ultra-Light Pastel Radial Gradient */}
            <path
              d={pathD}
              fill={`url(#${zone.gradientId})`}
              stroke={zone.color}
              strokeWidth="1"
            />

            {/* Crisp 1px Boundary Radial Dividing Line (Sector Edges) */}
            <line
              x1={innerR * Math.cos(startRad)}
              y1={innerR * Math.sin(startRad)}
              x2={R * Math.cos(startRad)}
              y2={R * Math.sin(startRad)}
              stroke={zone.color}
              strokeWidth="1"
              strokeDasharray="4 2"
              opacity="0.85"
            />

            {/* Hairline Center Direction Line */}
            <line
              x1={innerR * Math.cos(centerRad)}
              y1={innerR * Math.sin(centerRad)}
              x2={R * Math.cos(centerRad)}
              y2={R * Math.sin(centerRad)}
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />

            {/* Minimalist Direction Label Typography (NO dark pill badges or background boxes) */}
            <g transform={`translate(${labelX}, ${labelY})`}>
              {/* Zone Code (E.g. N, NNE, NE) with high-contrast outline */}
              <text
                x="0"
                y="-3"
                transform={`rotate(${-rotation})`}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#ffffff"
                stroke="#0f172a"
                strokeWidth="2.5"
                style={{ paintOrder: "stroke fill" }}
                fontSize="11"
                fontWeight="800"
                fontFamily="system-ui, sans-serif"
                letterSpacing="0.5"
              >
                {zone.code}
              </text>
              {/* Center Degree Callout */}
              <text
                x="0"
                y="7"
                transform={`rotate(${-rotation})`}
                textAnchor="middle"
                dominantBaseline="central"
                fill={zone.color}
                stroke="#0f172a"
                strokeWidth="1.8"
                style={{ paintOrder: "stroke fill" }}
                fontSize="7.5"
                fontWeight="700"
                fontFamily="monospace, sans-serif"
              >
                {zone.centerDeg}°
              </text>
            </g>
          </g>
        );
      })}

      {/* 4. CONCENTRIC CAD GEOMETRY RINGS (HAIRLINE VECTORS) */}
      <circle cx={0} cy={0} r={R} fill="none" stroke="#f43f5e" strokeWidth="1.5" />
      <circle cx={0} cy={0} r={R * 0.55} fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="5 3" opacity="0.85" />
      <circle cx={0} cy={0} r={innerR} fill="none" stroke="#f59e0b" strokeWidth="1.2" />

      {/* 5-ELEMENT DIRECTIONAL AXIS LINES (N: Ocean Blue, E: Emerald Green, S: Crimson Red, W: Silver White) */}
      <line x1={0} y1={-innerR} x2={0} y2={-degreeRingR} stroke="#007AFF" strokeWidth="1.2" strokeDasharray="4 2" />
      <line x1={innerR} y1={0} x2={degreeRingR} y2={0} stroke="#10B981" strokeWidth="1.2" strokeDasharray="4 2" />
      <line x1={0} y1={innerR} x2={0} y2={degreeRingR} stroke="#EF4444" strokeWidth="1.2" strokeDasharray="4 2" />
      <line x1={-innerR} y1={0} x2={-degreeRingR} y2={0} stroke="#F8FAFC" strokeWidth="1.2" strokeDasharray="4 2" />

      {/* Large center drag hit area — click anywhere near centre to move */}
      <circle
        cx={0}
        cy={0}
        r={dragHitRadius}
        fill="transparent"
        stroke="none"
        className={locked ? "" : "cursor-move"}
        style={{ pointerEvents: locked ? "none" : "all" }}
        onMouseDown={handlePositionMouseDown}
      >
        <title>Drag to move Vastu Chakra</title>
      </circle>

      {/* 5. ARCHITECTURAL BRAHMASTHAN MINIMAL CENTER POINT */}
      {showBrahmasthan ? (
        <g id="brahmasthan-core-zone" style={{ pointerEvents: "none" }}>

          {/* Minimal Target Point Crosshair Lines (100% blueprint visibility) */}
          <line x1={-12} y1={0} x2={12} y2={0} stroke="#fbbf24" strokeWidth="1" opacity="0.9" />
          <line x1={0} y1={-12} x2={0} y2={12} stroke="#fbbf24" strokeWidth="1" opacity="0.9" />

          {/* Sleek Target Dot (Max 8px diameter) */}
          <circle cx={0} cy={0} r={3.5} fill="#fbbf24" stroke="#ffffff" strokeWidth="0.8" />

          {/* Clean Floating Brahmasthan Text */}
          <text
            x="0"
            y="18"
            transform={`rotate(${-rotation})`}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#fbbf24"
            stroke="#0f172a"
            strokeWidth="1.2"
            style={{ paintOrder: "stroke fill" }}
            fontSize="8"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
            letterSpacing="0.5"
          >
            BRAHMASTHAN
          </text>
        </g>
      ) : (
        /* Fallback Center visual when Brahmasthan hidden */
        <g style={{ pointerEvents: "none" }}>
          <line x1={-8} y1={0} x2={8} y2={0} stroke="#f59e0b" strokeWidth="1" />
          <line x1={0} y1={-8} x2={0} y2={8} stroke="#f59e0b" strokeWidth="1" />
          <circle cx={0} cy={0} r={3} fill="#fbbf24" stroke="#ffffff" strokeWidth="0.8" />
        </g>
      )}

      {/* 6. SLIM, DUAL-TONE 5-ELEMENT COMPASS NEEDLE & CARDINALS */}
      {showCompass && (
        <g id="compass-cardinal-arrows">
          {/* North Axis Pointer (Vibrant Ocean Blue #007AFF) */}
          <g>
            {/* Left Half (Ocean Blue) */}
            <path
              d={`M 0 0 L -5 ${-degreeRingR + 10} L 0 ${-degreeRingR - 32} Z`}
              fill="#007AFF"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="0.8"
            />
            {/* Right Half (Light Ocean Blue) */}
            <path
              d={`M 0 0 L 0 ${-degreeRingR - 32} L 5 ${-degreeRingR + 10} Z`}
              fill="#60A5FA"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="0.8"
            />
            {/* Slim North Arrowhead Tip */}
            <path
              d={`M 0 ${-degreeRingR - 32} L -8 ${-degreeRingR - 16} L 0 ${-degreeRingR - 22} L 8 ${-degreeRingR - 16} Z`}
              fill="#007AFF"
              stroke="#ffffff"
              strokeWidth="1"
            />
            {/* North Cardinal Label — outside controls so it is never obscured */}
            <text
              x="0"
              y={-cardinalLabelArm}
              transform={`rotate(${-rotation}, 0, ${-cardinalLabelArm})`}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#007AFF"
              stroke="#0f172a"
              strokeWidth="1.5"
              style={{ paintOrder: "stroke fill" }}
              fontSize="11"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
            >
              NORTH
            </text>
          </g>

          {/* East Pointer (Crisp Emerald Green #10B981) */}
          <g>
            <path
              d={`M 0 0 L ${degreeRingR - 10} -3 L ${degreeRingR + 24} 0 L ${degreeRingR - 10} 3 Z`}
              fill="#10B981"
              stroke="#ffffff"
              strokeWidth="0.8"
            />
            <text
              x={cardinalLabelArm}
              y="0"
              transform={`rotate(${-rotation}, ${cardinalLabelArm}, 0)`}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#10B981"
              stroke="#0f172a"
              strokeWidth="1.5"
              style={{ paintOrder: "stroke fill" }}
              fontSize="11"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              EAST
            </text>
          </g>

          {/* South Pointer (Deep Crimson Red #EF4444) */}
          <g>
            <path
              d={`M 0 0 L -3 ${degreeRingR - 10} L 0 ${degreeRingR + 24} L 3 ${degreeRingR - 10} Z`}
              fill="#EF4444"
              stroke="#ffffff"
              strokeWidth="0.8"
            />
            <text
              x="0"
              y={cardinalLabelArm}
              transform={`rotate(${-rotation}, 0, ${cardinalLabelArm})`}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#EF4444"
              stroke="#0f172a"
              strokeWidth="1.5"
              style={{ paintOrder: "stroke fill" }}
              fontSize="11"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              SOUTH
            </text>
          </g>

          {/* West Pointer (Bright White/Silver Metallic #F8FAFC) */}
          <g>
            <path
              d={`M 0 0 L ${-degreeRingR + 10} -3 L ${-degreeRingR - 24} 0 L ${-degreeRingR + 10} 3 Z`}
              fill="#F8FAFC"
              stroke="#94A3B8"
              strokeWidth="1"
            />
            <text
              x={-cardinalLabelArm}
              y="0"
              transform={`rotate(${-rotation}, ${-cardinalLabelArm}, 0)`}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#F8FAFC"
              stroke="#0f172a"
              strokeWidth="1.5"
              style={{ paintOrder: "stroke fill" }}
              fontSize="11"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              WEST
            </text>
          </g>

        </g>
      )}

      {/* Professional floating CAD controls — visible while selected */}
      {isSelected && !locked && (
        <g id="chakra-attached-hud-controls" style={{ pointerEvents: "all" }}>
          {/* North anchor on outer ring */}
          <circle
            cx={0}
            cy={-degreeRingR}
            r={5}
            fill="#38bdf8"
            stroke="#ffffff"
            strokeWidth="1.2"
            opacity={isRotating ? 1 : 0.85}
            pointerEvents="none"
          />

          {/* Rotate — between ring and NORTH label */}
          <g transform={`translate(0, ${-controlArm}) scale(${uiScale})`}>
            <ChakraControlButton
              title="Drag to rotate Vastu Chakra"
              label="Rotate"
              cursor={isRotating ? "grabbing" : "grab"}
              active={isRotating}
              onMouseDown={handleRotateDragMouseDown}
              icon={<RotateIcon />}
            />
          </g>

          {/* Shrink — left */}
          <g transform={`translate(${-controlArm}, 0) scale(${uiScale})`}>
            <ChakraControlButton
              title="Shrink Chakra"
              label="Shrink"
              active={activeControl === "shrink"}
              onMouseDown={stopOverlayMouseDown}
              onClick={handleShrink}
              icon={<ShrinkIcon />}
            />
          </g>

          {/* Expand — right */}
          <g transform={`translate(${controlArm}, 0) scale(${uiScale})`}>
            <ChakraControlButton
              title="Expand Chakra"
              label="Expand"
              active={activeControl === "expand"}
              onMouseDown={stopOverlayMouseDown}
              onClick={handleExpand}
              icon={<ExpandIcon />}
            />
          </g>

          {/* Move — bottom */}
          <g transform={`translate(0, ${controlArm}) scale(${uiScale})`}>
            <ChakraControlButton
              title="Drag to move Vastu Chakra"
              label="Move"
              cursor="move"
              onMouseDown={handlePositionMouseDown}
              icon={<MoveIcon />}
            />
          </g>
        </g>
      )}
    </g>
  );
};

export default VastuChakraVectorOverlay;
