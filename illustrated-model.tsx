
"use client";

import { Character } from "@/lib/types";
import { cn } from "@/lib/utils";

export type IllustratedModelProps = Pick<
  Character,
  | "height"
  | "weight"
  | "bodyType"
  | "skinTone"
  | "faceShape"
  | "jawline"
  | "chin"
  | "nose"
  | "lips"
  | "eyeColor"
  | "eyeType"
  | "hairType"
  | "hairLength"
  | "hairColor"
  | "top"
  | "bottom"
  | "clothingColor"
  | "showLogo"
> & {
  animationState: "idle" | "walk" | "pointing";
  expressionState: "neutral" | "smile" | "serious" | "talking";
  pose: "front" | "left" | "right";
  cameraView: "full" | "upper";
  background: "plain-light" | "plain-dark" | "studio" | "indoor" | "outdoor" | "transparent";
  isCaptureMode: boolean;
};

export const IllustratedModel = ({
  height,
  weight,
  bodyType,
  skinTone,
  faceShape,
  jawline,
  chin,
  nose,
  lips,
  eyeColor,
  eyeType,
  hairType,
  hairLength,
  hairColor,
  top,
  bottom,
  clothingColor,
  showLogo,
  animationState,
  expressionState,
  pose,
  cameraView,
  background,
  isCaptureMode,
}: IllustratedModelProps) => {
  // Normalize values to a 0-1 range
  const heightFactor = (height - 140) / (220 - 140);
  const weightFactor = (weight - 40) / (150 - 40);

  // Get a multiplier from body type
  let bodyTypeMultiplier = 1;
  switch (bodyType) {
    case "Slim":
      bodyTypeMultiplier = 0.8;
      break;
    case "Athletic":
      bodyTypeMultiplier = 1.0;
      break;
    case "Heavy":
      bodyTypeMultiplier = 1.2;
      break;
    case "Bulky":
      bodyTypeMultiplier = 1.3;
      break;
  }

  // Define base dimensions
  const totalHeight = 200 + heightFactor * 100;
  const torsoWidth = (40 + weightFactor * 40) * bodyTypeMultiplier;

  let headRadiusX = 25;
  let headRadiusY = 25;

  switch (faceShape) {
    case "Square":
      headRadiusX *= 1.1;
      headRadiusY *= 1.05;
      break;
    case "Round":
      headRadiusX *= 1.1;
      headRadiusY *= 1.1;
      break;
    case "Heart":
      headRadiusX *= 1.1;
      headRadiusY *= 1;
      break; // Wider at top
    case "Long":
      headRadiusX *= 0.9;
      headRadiusY *= 1.15;
      break;
    case "Oval":
    default:
      headRadiusX *= 1;
      headRadiusY *= 1.1;
  }

  const neckHeight = 10;
  const neckWidth = 15;
  const torsoHeight = totalHeight * 0.4;
  const legHeight = totalHeight * 0.5;
  const legWidth = torsoWidth * 0.4;
  const armHeight = torsoHeight * 0.8;
  const armWidth = torsoWidth * 0.25;

  const svgHeight = totalHeight + headRadiusY * 2 + 50; // increased for hair
  const svgWidth = Math.max(torsoWidth + armWidth * 2 + 40, headRadiusX * 2 + 20);
  const centerX = svgWidth / 2;

  const headY = 10 + headRadiusY + 20; // Pushed down for hair
  const neckY = headY + headRadiusY;
  const torsoY = neckY + neckHeight;
  const legsY = torsoY + torsoHeight;

  // Face attribute calculations
  let jawWidth = headRadiusX * 0.8;
  switch (jawline) {
    case "Defined":
      jawWidth = headRadiusX * 0.7;
      break;
    case "Soft":
      jawWidth = headRadiusX * 0.85;
      break;
    case "Square":
      jawWidth = headRadiusX * 0.9;
      break;
    case "Rounded":
      jawWidth = headRadiusX * 0.8;
      break;
  }

  let chinLength = 5;
  let chinPath;
  switch (chin) {
    case "Prominent":
      chinLength = 10;
      break;
    case "Recessed":
      chinLength = 2;
      break;
    case "Pointed":
      chinLength = 8;
      break;
  }

  if (chin === "Pointed") {
    chinPath = `M ${centerX - jawWidth * 0.5} ${
      headY + headRadiusY - 2
    } L ${centerX} ${
      headY + headRadiusY + chinLength
    } L ${centerX + jawWidth * 0.5} ${headY + headRadiusY - 2}`;
  } else {
    chinPath = `M ${centerX - jawWidth * 0.6} ${
      headY + headRadiusY
    } C ${centerX - jawWidth * 0.5},${
      headY + headRadiusY + chinLength
    } ${centerX + jawWidth * 0.5},${
      headY + headRadiusY + chinLength
    } ${centerX + jawWidth * 0.6},${headY + headRadiusY}`;
  }

  let noseWidth = 4;
  let noseHeight = 10;
  switch (nose) {
    case "Roman":
      noseHeight = 14;
      break;
    case "Upturned":
      noseHeight = 8;
      break;
    case "Button":
      noseWidth = 6;
      noseHeight = 6;
      break;
  }

  let lipsWidth = 20;
  let lipsHeight = 4;
  switch (lips) {
    case "Full":
      lipsHeight = 6;
      break;
    case "Thin":
      lipsHeight = 2;
      break;
    case "Bow-shaped":
      lipsWidth = 18;
      break;
    case "Wide":
      lipsWidth = 24;
      break;
  }
  const lipsY = headY + headRadiusY * 0.5;

  const eyesY = headY - headRadiusY * 0.1;
  const eyeOffsetX = headRadiusX * 0.4;

  // Hair
  let hairStyle = null;
  if (hairType !== "Bald" && hairLength !== "Shaved") {
    let lengthFactor = 1;
    if (hairLength === "Short") lengthFactor = 0.5;
    if (hairLength === "Medium") lengthFactor = 0.8;
    if (hairLength === "Long") lengthFactor = 1.2;
    if (hairLength === "Very Long") lengthFactor = 1.8;

    let hairPath;
    const hairY = headY - headRadiusY * 0.9;
    const hairColorValue = hairColor.toLowerCase();

    if (hairType === "Straight") {
      hairPath = `M${centerX - headRadiusX * 1.1} ${hairY} L${
        centerX - headRadiusX * 1.1
      } ${hairY + 30 * lengthFactor}  C ${centerX}, ${
        hairY + 30 * lengthFactor + 20
      }, ${centerX}, ${
        hairY + 30 * lengthFactor + 20
      }, ${centerX + headRadiusX * 1.1} ${
        hairY + 30 * lengthFactor
      } L${centerX + headRadiusX * 1.1} ${hairY} Q${centerX} ${
        hairY - 20
      } ${centerX - headRadiusX * 1.1} ${hairY} Z`;
    } else if (hairType === "Wavy") {
      hairPath = `M${centerX - headRadiusX * 1.1} ${hairY} C ${
        centerX - headRadiusX * 1.1
      }, ${hairY + 40 * lengthFactor}, ${centerX + headRadiusX * 1.1}, ${
        hairY + 40 * lengthFactor
      }, ${centerX + headRadiusX * 1.1}, ${hairY} Q${centerX} ${
        hairY - 25
      } ${centerX - headRadiusX * 1.1} ${hairY} Z`;
    } else {
      // Curly / Coily
      hairPath = `M ${centerX} ${headY - headRadiusY} C ${
        centerX - headRadiusX * 1.5
      }, ${headY - headRadiusY}, ${centerX - headRadiusX * 1.5}, ${
        headY + headRadiusY * lengthFactor
      }, ${centerX} ${headY + headRadiusY * lengthFactor} C ${
        centerX + headRadiusX * 1.5
      }, ${headY + headRadiusY * lengthFactor}, ${
        centerX + headRadiusX * 1.5
      }, ${headY - headRadiusY}, ${centerX} ${headY - headRadiusY} Z`;
    }

    hairStyle = (
      <path d={hairPath} fill={hairColorValue} stroke="#333" strokeWidth="1" />
    );
  }

  // Expressions
  let lipsPath;
  let lipsProps: React.SVGProps<SVGPathElement> = {
    fill: "#D68A8A",
  };

  switch (expressionState) {
    case "smile":
      lipsPath = `M ${centerX - lipsWidth / 2},${lipsY + 2} C ${
        centerX - lipsWidth / 4
      },${lipsY + lipsHeight} ${centerX + lipsWidth / 4},${
        lipsY + lipsHeight
      } ${centerX + lipsWidth / 2},${lipsY + 2}`;
      break;
    case "serious":
      lipsPath = `M ${centerX - lipsWidth / 2},${
        lipsY + lipsHeight / 2
      } H ${centerX + lipsWidth / 2}`;
      lipsProps = {
        stroke: "#A06A6A",
        strokeWidth: 1.5,
        fill: "none",
      };
      break;
    case "talking":
      lipsPath = `M ${centerX - lipsWidth / 2},${lipsY} Q ${centerX},${
        lipsY + lipsHeight
      } ${centerX + lipsWidth / 2},${lipsY} Z`;
      if (!isCaptureMode) {
        lipsProps.className = "talking-mouth";
      }
      break;
    case "neutral":
    default:
      lipsPath = `M ${centerX - lipsWidth / 2},${lipsY} Q ${centerX},${
        lipsY + lipsHeight / 2
      } ${centerX + lipsWidth / 2},${lipsY} Q ${centerX},${
        lipsY + lipsHeight / 4
      } ${centerX - lipsWidth / 2},${lipsY}`;
  }

  // Clothing rendering
  let topElement = null;
  let bottomElement = null;
  let logoElement = null;

  const clothingFill = clothingColor;
  const clothingStroke = "#222";

  // Bottoms
  if (bottom === 'Pants' || bottom === 'Jeans') {
      const pantLegWidth = legWidth + 4; // Slightly wider than legs
      bottomElement = (
          <g stroke={clothingStroke} strokeWidth="1" fill={clothingFill}>
              <rect
                  className="left-leg"
                  x={centerX - torsoWidth / 2 + 3}
                  y={legsY}
                  width={pantLegWidth}
                  height={legHeight}
                  rx="5"
              />
              <rect
                  className="right-leg"
                  x={centerX + torsoWidth / 2 - pantLegWidth - 3}
                  y={legsY}
                  width={pantLegWidth}
                  height={legHeight}
                  rx="5"
              />
          </g>
      );
  }
  
  // Tops
  if (top === 'T-Shirt') {
      const sleeveHeight = armHeight * 0.4;
      topElement = (
          <g fill={clothingFill} stroke={clothingStroke} strokeWidth="1">
              <rect // Torso part
                  className="torso"
                  x={centerX - torsoWidth / 2 - 2}
                  y={torsoY}
                  width={torsoWidth + 4}
                  height={torsoHeight}
                  rx="10"
              />
              <rect // Left Sleeve
                  className="left-arm"
                  x={centerX - torsoWidth / 2 - armWidth - 7}
                  y={torsoY + 10}
                  width={armWidth + 2}
                  height={sleeveHeight}
                  rx="5"
              />
              <rect // Right Sleeve
                  className="right-arm"
                  x={centerX + torsoWidth / 2 + 5}
                  y={torsoY + 10}
                  width={armWidth + 2}
                  height={sleeveHeight}
                  rx="5"
              />
          </g>
      );
  } else if (top === 'Shirt' || top === 'Jacket') {
      const sleeveHeight = armHeight + 5; // Long sleeves
      topElement = (
           <g fill={clothingFill} stroke={clothingStroke} strokeWidth="1">
              <rect // Torso part
                  className="torso"
                  x={centerX - torsoWidth / 2 - 2}
                  y={torsoY}
                  width={torsoWidth + 4}
                  height={torsoHeight}
                  rx="10"
              />
              <rect // Left Sleeve
                  className="left-arm"
                  x={centerX - torsoWidth / 2 - armWidth - 7}
                  y={torsoY + 10}
                  width={armWidth + 2}
                  height={sleeveHeight}
                  rx="5"
              />
              <rect // Right Sleeve
                  className="right-arm"
                  x={centerX + torsoWidth / 2 + 5}
                  y={torsoY + 10}
                  width={armWidth + 2}
                  height={sleeveHeight}
                  rx="5"
              />
              {top === 'Jacket' && <path d={`M ${centerX} ${torsoY} V ${torsoY + torsoHeight}`} stroke="#111" strokeWidth="2" />}
          </g>
      );
  }

  // Logo
  if (showLogo) {
      logoElement = (
          <text x={centerX} y={torsoY + 40} textAnchor="middle" fontSize="24" fill="#fff" fontWeight="bold" className="torso" style={{paintOrder: "stroke", stroke: "#000", strokeWidth: "2px", strokeLinejoin: "round"}}>
              V
          </text>
      );
  }

  const styles = `
    .capture-mode * {
      animation-play-state: paused !important;
    }
    .idle .torso {
        animation: idle-breath 3s ease-in-out infinite;
    }
    .walk .left-leg, .walk .right-arm {
        animation: walk-swing-1 1.5s ease-in-out infinite;
    }
    .walk .right-leg, .walk .left-arm {
        animation: walk-swing-2 1.5s ease-in-out infinite;
    }
    .pointing .right-arm {
        animation: point-loop 2s ease-in-out infinite;
    }

    .torso { 
        transform-origin: center; 
        transform-box: fill-box; 
    }
    .left-leg, .right-leg, .left-arm, .right-arm {
        transform-origin: center top;
        transform-box: fill-box;
    }

    @keyframes idle-breath {
        0%, 100% { transform: scaleY(1); }
        50% { transform: scaleY(1.02); }
    }
    @keyframes walk-swing-1 {
        0%, 100% { transform: rotate(-20deg); }
        50% { transform: rotate(15deg); }
    }
    @keyframes walk-swing-2 {
        0%, 100% { transform: rotate(15deg); }
        50% { transform: rotate(-20deg); }
    }
    @keyframes point-loop {
        0%, 100% { transform: rotate(-110deg) translate(-10px, 10px) scaleY(0.95); }
        50% { transform: rotate(-120deg) translate(-10px, 10px) scaleY(1); }
    }
    @keyframes talking {
        0%, 100% { transform: scaleY(0.3); }
        50% { transform: scaleY(1); }
    }
    .talking-mouth {
        transform-origin: center;
        animation: talking 0.5s ease-in-out infinite;
    }
  `;

  const viewBoxValue =
    cameraView === "upper"
      ? `0 0 ${svgWidth} ${svgHeight / 1.8}`
      : `0 0 ${svgWidth} ${svgHeight}`;

  const getPoseTransform = () => {
    const skewAmount = 10;
    if (pose === "left") {
      return `skewX(${skewAmount})`;
    }
    if (pose === "right") {
      return `skewX(-${skewAmount})`;
    }
    return "none";
  };

  const renderBackground = () => {
    switch (background) {
      case 'plain-light':
        return <rect width={svgWidth} height={svgHeight} fill="#f1f5f9" />;
      case 'plain-dark':
        return <rect width={svgWidth} height={svgHeight} fill="#1e293b" />;
      case 'studio':
        return (
          <>
            <defs>
              <radialGradient id="studioGradient">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
              </radialGradient>
            </defs>
            <rect width={svgWidth} height={svgHeight} fill="url(#studioGradient)" />
            <ellipse cx={svgWidth / 2} cy={svgHeight - 20} rx={svgWidth / 1.5} ry="30" fill="#000000" opacity="0.1" />
          </>
        );
      case 'indoor':
        return (
          <>
            <rect width={svgWidth} height={svgHeight} fill="#bfdbfe" />
            <rect y={svgHeight * 0.7} width={svgWidth} height={svgHeight * 0.3} fill="#94a3b8" />
            <line x1="0" y1={svgHeight * 0.7} x2={svgWidth} y2={svgHeight * 0.7} stroke="#475569" strokeWidth="2" />
          </>
        );
      case 'outdoor':
        return (
          <>
            <rect width={svgWidth} height={svgHeight} fill="#7dd3fc" />
            <rect y={svgHeight * 0.75} width={svgWidth} height={svgHeight * 0.25} fill="#4ade80" />
            <circle cx={svgWidth * 0.8} cy="50" r="20" fill="#facc15" />
          </>
        );
       case 'transparent':
       default:
        return <rect width={svgWidth} height={svgHeight} fill="transparent" />;
    }
  };


  return (
    <svg
      viewBox={viewBoxValue}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMax meet"
      className={cn(animationState, isCaptureMode && 'capture-mode')}
    >
      <style>{styles}</style>
      {renderBackground()}
      <g transform={getPoseTransform()} style={{ transformOrigin: `${centerX}px ${torsoY}px` }}>
        {/* Body - Drawn first, will be covered by clothes */}
        <g stroke="#333333" strokeWidth="1">
          
          <g fill={skinTone}>
            {/* Neck */}
            <rect
              x={centerX - neckWidth / 2}
              y={neckY}
              width={neckWidth}
              height={neckHeight}
            />
            {/* Torso */}
            <rect
              className="torso"
              x={centerX - torsoWidth / 2}
              y={torsoY}
              width={torsoWidth}
              height={torsoHeight}
              rx="10"
            />
            {/* Legs */}
            <rect
              className="left-leg"
              x={centerX - torsoWidth / 2 + 5}
              y={legsY}
              width={legWidth}
              height={legHeight}
              rx="5"
            />
            <rect
              className="right-leg"
              x={centerX + torsoWidth / 2 - legWidth - 5}
              y={legsY}
              width={legWidth}
              height={legHeight}
              rx="5"
            />
            {/* Arms */}
            <rect
              className="left-arm"
              x={centerX - torsoWidth / 2 - armWidth - 5}
              y={torsoY + 10}
              width={armWidth}
              height={armHeight}
              rx="5"
            />
            <rect
              className="right-arm"
              x={centerX + torsoWidth / 2 + 5}
              y={torsoY + 10}
              width={armWidth}
              height={armHeight}
              rx="5"
            />
          </g>
        </g>
        
        {/* CLOTHING */}
        {bottomElement}
        {topElement}

        {/* HAIR AND HEAD are drawn on top of clothing */}
        {hairStyle}

        {/* Head */}
        <g>
          <g stroke="#333333" strokeWidth="1">
            <ellipse
              cx={centerX}
              cy={headY}
              rx={headRadiusX}
              ry={headRadiusY}
              fill={skinTone}
            />
            <path d={chinPath} stroke={skinTone} strokeWidth="2" fill={skinTone} />
          </g>

          {/* Face Features */}
          <g fill="#333" stroke="none">
            {/* Eyes */}
            <g>
              <ellipse
                cx={centerX - eyeOffsetX}
                cy={eyesY}
                rx="4"
                ry="3"
                fill="white"
                stroke="#333"
                strokeWidth="0.5"
              />
              {eyeType === "Reptile" ? (
                <rect
                  x={centerX - eyeOffsetX - 0.5}
                  y={eyesY - 2}
                  width="1"
                  height="4"
                  fill={eyeColor.toLowerCase()}
                />
              ) : (
                <circle
                  cx={centerX - eyeOffsetX}
                  cy={eyesY}
                  r="1.5"
                  fill={eyeColor.toLowerCase()}
                />
              )}

              <ellipse
                cx={centerX + eyeOffsetX}
                cy={eyesY}
                rx="4"
                ry="3"
                fill="white"
                stroke="#333"
                strokeWidth="0.5"
              />
              {eyeType === "Reptile" ? (
                <rect
                  x={centerX + eyeOffsetX - 0.5}
                  y={eyesY - 2}
                  width="1"
                  height="4"
                  fill={eyeColor.toLowerCase()}
                />
              ) : (
                <circle
                  cx={centerX + eyeOffsetX}
                  cy={eyesY}
                  r="1.5"
                  fill={eyeColor.toLowerCase()}
                />
              )}
            </g>
            {/* Nose */}
            <path
              d={`M ${centerX} ${eyesY + 5} L ${centerX - noseWidth / 2} ${
                eyesY + 5 + noseHeight
              } L ${centerX + noseWidth / 2} ${eyesY + 5 + noseHeight}`}
              fill="none"
              stroke="#333"
              strokeWidth="1"
            />

            {/* Lips */}
            <path d={lipsPath} {...lipsProps} />
          </g>
        </g>
        {/* LOGO on top of everything */}
        {logoElement}
      </g>
    </svg>
  );
};
