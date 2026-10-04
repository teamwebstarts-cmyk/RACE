import React from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

function MapPin({ x, y, color = '#FFB51C' }: { x: number; y: number; color?: string }) {
  return (
    <G transform={`translate(${x} ${y})`}>
      <Path
        d="M0 -13 C-6.9 -13 -11.5 -8 -11.5 -2 C-11.5 6 0 18 0 18 C0 18 11.5 6 11.5 -2 C11.5 -8 6.9 -13 0 -13 Z"
        fill={color}
      />
      <Circle cx="0" cy="-2.2" r="4.1" fill="#FFFFFF" />
    </G>
  );
}

function Sapling({
  x,
  y,
  scale = 1,
  color = '#F0E4C8',
}: {
  x: number;
  y: number;
  scale?: number;
  color?: string;
}) {
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`}>
      <Path d="M0 27 V13" stroke="#E6D9BE" strokeWidth="1.5" />
      <Path d="M0 0 C-6 7 -6 18 0 24 C6 18 6 7 0 0 Z" fill={color} />
    </G>
  );
}

export function LoginIllustration({ scale }: { scale: number }) {
  return (
    <Svg pointerEvents="none" width={390 * scale} height={150 * scale} viewBox="0 0 390 150">
      <Defs>
        <LinearGradient
          id="loginSky"
          x1="0"
          y1="0"
          x2="390"
          y2="110"
          gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#FFF9EE" />
          <Stop offset="63%" stopColor="#FFFDF8" />
          <Stop offset="100%" stopColor="#FFFFFF" />
        </LinearGradient>
      </Defs>

      <Path
        d="M0 13 C31 -3 61 5 86 23 C122 49 145 59 193 57 C239 55 256 11 298 9 C338 7 361 25 390 22 L390 106 L0 106 Z"
        fill="url(#loginSky)"
      />
      <Path d="M258 7 C303 4 331 25 390 19" fill="none" stroke="#F9E7C3" strokeWidth="1.4" />

      <Rect x="141" y="18" width="7" height="45" rx="2" fill="#F1F0EB" />
      <Rect x="155" y="39" width="9" height="27" rx="2" fill="#F4F2ED" />
      <Rect x="171" y="22" width="12" height="47" rx="2" fill="#F3F1EC" />
      <Rect x="188" y="31" width="11" height="38" rx="2" fill="#F3F1EC" />
      <Rect x="204" y="51" width="8" height="19" rx="1" fill="#F6F4EF" />
      <Rect x="216" y="44" width="7" height="25" rx="1" fill="#F7F5F0" />

      <Path
        d="M0 59 C24 41 47 47 69 62 C91 76 124 84 167 78 C218 71 258 56 295 59 C334 62 362 76 390 67 L390 150 L0 150 Z"
        fill="#FBF7ED"
      />
      <Path
        d="M0 84 C45 74 73 83 112 91 C172 104 211 88 258 79 C311 68 351 77 390 83 L390 150 L0 150 Z"
        fill="#FFFFFF"
        opacity={0.78}
      />

      <Sapling x={27} y={40} scale={1.15} />
      <Sapling x={96} y={43} scale={1.04} />
      <Sapling x={354} y={49} scale={1.22} />
      <Sapling x={365} y={76} scale={0.84} color="#F1E6CF" />

      <Path
        d="M-25 144 C34 103 96 93 156 100 C213 107 270 101 301 87 C319 79 295 68 258 66"
        fill="none"
        stroke="#F8E8C8"
        strokeWidth="30"
        strokeLinecap="round"
      />
      <Path
        d="M-25 144 C34 103 96 93 156 100 C213 107 270 101 301 87 C319 79 295 68 258 66"
        fill="none"
        stroke="#E5E5E1"
        strokeWidth="23"
        strokeLinecap="round"
      />
      <Path
        d="M-25 144 C34 103 96 93 156 100 C213 107 270 101 301 87 C319 79 295 68 258 66"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <Path d="M0 120 C67 88 117 97 159 101" fill="none" stroke="#F9E5BA" strokeWidth="1.5" />

      <Ellipse cx="143" cy="105" rx="25" ry="3.3" fill="#D8D5CC" opacity={0.6} />

      <Path
        d="M119 91 L124 83 C126 79 130 78 137 78 H149 C153 78 157 81 160 88 L166 92 L167 99 C167 102 165 104 162 104 H120 C117 104 115 102 116 98 L117 94 Z"
        fill="#FFC13C"
        stroke="#CA8B1D"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <Path d="M127 83 C129 81 132 80 138 80 H146 V90 H122 Z" fill="#35444C" />
      <Path d="M148 80 H150 C154 80 156 84 158 90 H148 Z" fill="#43525B" />
      <Path d="M122 91 H160" stroke="#E69C1B" strokeWidth="1" />
      <Path d="M117 95 H123" stroke="#FFF5CE" strokeWidth="2" />
      <Path d="M160 95 H166" stroke="#FFF5CE" strokeWidth="2" />
      <Circle cx="126" cy="103" r="4.2" fill="#263139" />
      <Circle cx="157" cy="103" r="4.2" fill="#263139" />
      <Circle cx="126" cy="103" r="1.8" fill="#F4F2EB" />
      <Circle cx="157" cy="103" r="1.8" fill="#F4F2EB" />

      <MapPin x={296} y={32} color="#FFAD08" />
    </Svg>
  );
}

export function SignupIllustration({ scale, top }: { scale: number; top: number }) {
  return (
    <Svg
      pointerEvents="none"
      style={{ position: 'absolute', top, left: 0 }}
      width={390 * scale}
      height={184 * scale}
      viewBox="0 0 390 184">
      <Defs>
        <LinearGradient
          id="signupHaze"
          x1="220"
          y1="0"
          x2="390"
          y2="100"
          gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#FBF6E9" />
        </LinearGradient>
      </Defs>

      <Path
        d="M390 3 C364 7 359 24 340 35 C320 48 302 49 282 43 C257 36 241 48 221 62 C276 66 326 78 390 86 Z"
        fill="url(#signupHaze)"
      />
      <Path
        d="M153 68 C195 48 217 53 242 68 C276 84 309 71 337 68 C360 66 375 73 390 79 L390 117 C353 106 317 91 286 97 C249 103 207 83 153 68 Z"
        fill="#FCF8EF"
        opacity={0.82}
      />

      <Path
        d="M125 54 C70 57 46 75 76 87 C101 98 151 96 199 92 C256 87 280 93 316 108 C352 123 356 149 350 183"
        fill="none"
        stroke="#F9E2AD"
        strokeWidth="1.55"
      />

      <Path
        d="M129 62 C76 58 44 75 68 86 C86 95 142 95 190 88 C237 82 249 71 214 65"
        fill="none"
        stroke="#FCF4E5"
        strokeWidth="31"
        strokeLinecap="round"
      />
      <Path
        d="M129 62 C76 58 44 75 68 86 C86 95 142 95 190 88 C237 82 249 71 214 65"
        fill="none"
        stroke="#E8E9E6"
        strokeWidth="20"
        strokeLinecap="round"
      />
      <Path
        d="M129 62 C76 58 44 75 68 86 C86 95 142 95 190 88 C237 82 249 71 214 65"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <Path d="M56 82 C55 70 77 63 106 61" fill="none" stroke="#F9DFA4" strokeWidth="1.5" />

      <Sapling x={237} y={68} scale={0.83} color="#EFE5CF" />
      <Sapling x={250} y={72} scale={0.75} color="#F0E6D1" />
      <Sapling x={350} y={70} scale={0.75} color="#F0E4C9" />

      <Ellipse cx="169" cy="94" rx="13" ry="2.3" fill="#D9D8D2" opacity={0.47} />
      <MapPin x={166} y={75} color="#FFC448" />

      <Ellipse cx="317" cy="136" rx="50" ry="4.4" fill="#D8D5CC" opacity={0.48} />

      <Path
        d="M311 111 H352 L361 117 V129 H309 Z"
        fill="#FFBE35"
        stroke="#334049"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <Path
        d="M274 107 L282 97 H302 L311 104 H316 V129 H270 V115 Z"
        fill="#FFC33E"
        stroke="#334049"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <Path d="M282 101 L286 98 H300 L307 106 V113 H278 V108 Z" fill="#30424A" />
      <Path d="M293 99 V113" stroke="#FFC442" strokeWidth="2" />
      <Path d="M273 116 H281" stroke="#FFF3BE" strokeWidth="2.5" />
      <Path d="M310 114 V128" stroke="#D89316" strokeWidth="1.6" />
      <Path d="M318 119 H356" stroke="#E59C1C" strokeWidth="1.3" />
      <Rect x="314" y="124" width="47" height="5" rx="1.5" fill="#EAA51F" />

      <Path
        d="M334 110 L348 99 L355 84"
        fill="none"
        stroke="#36414A"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M334 110 L348 99 L355 84"
        fill="none"
        stroke="#FFC23C"
        strokeWidth="4.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M355 84 L364 91 V110"
        fill="none"
        stroke="#35414A"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M364 110 C364 114 360 116 358 113"
        fill="none"
        stroke="#35414A"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <Circle cx="355" cy="83" r="3" fill="#FFAE17" />

      <Circle cx="287" cy="129" r="7.5" fill="#303840" />
      <Circle cx="340" cy="129" r="7.5" fill="#303840" />
      <Circle cx="287" cy="129" r="3.4" fill="#F7F5ED" />
      <Circle cx="340" cy="129" r="3.4" fill="#F7F5ED" />
      <Circle cx="287" cy="129" r="1.4" fill="#BCC0BE" />
      <Circle cx="340" cy="129" r="1.4" fill="#BCC0BE" />
    </Svg>
  );
}
