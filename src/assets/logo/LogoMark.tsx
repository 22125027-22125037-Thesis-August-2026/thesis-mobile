import React from 'react';
import Svg, { Defs, RadialGradient, Stop, Path, Line, Circle } from 'react-native-svg';

interface Props {
  size?: number;
}

const LogoMark: React.FC<Props> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
    <Defs>
      <RadialGradient id="lgLeaf" cx="40%" cy="35%" r="65%">
        <Stop offset="0%" stopColor="#6EC35A" />
        <Stop offset="100%" stopColor="#3A8A2E" />
      </RadialGradient>
      <RadialGradient id="lgInner" cx="50%" cy="40%" r="60%">
        <Stop offset="0%" stopColor="#A8E063" />
        <Stop offset="100%" stopColor="#56AB2F" />
      </RadialGradient>
    </Defs>

    {/* Outer leaf body */}
    <Path
      d="M100 170 C60 155,28 138,22 108 C14 72,36 44,62 36 C74 32,86 34,100 44 C114 34,126 32,138 36 C164 44,186 72,178 108 C172 138,140 155,100 170Z"
      fill="url(#lgLeaf)"
    />
    {/* Inner shimmer overlay */}
    <Path
      d="M100 154 C70 142,46 128,42 104 C36 78,54 58,74 52 C84 49,93 52,100 60 C107 52,116 49,126 52 C146 58,164 78,158 104 C154 128,130 142,100 154Z"
      fill="url(#lgInner)"
      opacity={0.4}
    />
    {/* White heart-leaf cutout */}
    <Path
      d="M100 130 C78 118,62 104,62 88 C62 76,72 68,84 68 C91 68,97 72,100 78 C103 72,109 68,116 68 C128 68,138 76,138 88 C138 104,122 118,100 130Z"
      fill="white"
      opacity={0.93}
    />
    {/* Stem */}
    <Line
      x1="100" y1="128" x2="100" y2="108"
      stroke="#4E9A3A" strokeWidth={3.5} strokeLinecap="round"
    />
    {/* Left branch */}
    <Path d="M100 118 C94 112,86 112,84 106 C86 100,94 102,100 108" fill="#5FB84A" />
    {/* Right branch */}
    <Path d="M100 118 C106 112,114 112,116 106 C114 100,106 102,100 108" fill="#5FB84A" />
    {/* Accent dots */}
    <Circle cx="76" cy="88" r="5" fill="#3A8A2E" opacity={0.6} />
    <Circle cx="124" cy="88" r="5" fill="#3A8A2E" opacity={0.6} />
    <Circle cx="100" cy="100" r="4" fill="#3A8A2E" opacity={0.5} />
  </Svg>
);

export default LogoMark;
