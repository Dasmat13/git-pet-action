import { PetData, TerrariumAsset, ToyData } from './pet';

const W = 900;
const H = 260;
const GROUND = 210;
const TILE_W = W / 52;

export function renderSVG(pet: PetData, username: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"
     style="border-radius:12px;overflow:hidden;background:#1e272e">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${pet.bgColorTop}"/>
      <stop offset="100%" stop-color="${pet.bgColorBottom}"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Terrarium Glass Backing Sky -->
  <rect width="${W}" height="${H}" fill="url(#sky)"/>

  <!-- Plants & Mushrooms in the background -->
  ${pet.assets.map(a => renderAsset(a)).join('\n  ')}

  <!-- Dirt / Grass Ground bed -->
  <rect x="0" y="${GROUND}" width="${W}" height="${H - GROUND}" fill="${pet.groundColor}"/>
  <!-- Grass blades along the top edge of ground -->
  <path d="M 0,${GROUND} Q 25,${GROUND - 5} 50,${GROUND} T 100,${GROUND} T 150,${GROUND} T 200,${GROUND} T 250,${GROUND} T 300,${GROUND} T 350,${GROUND} T 400,${GROUND} T 450,${GROUND} T 500,${GROUND} T 550,${GROUND} T 600,${GROUND} T 650,${GROUND} T 700,${GROUND} T 750,${GROUND} T 800,${GROUND} T 850,${GROUND} T 900,${GROUND}" fill="none" stroke="#2ecc71" stroke-width="2"/>

  <!-- Dust bunnies (messy unresolved bugs) floating around -->
  ${renderMessyBunnies(pet)}

  <!-- Toys laying on ground -->
  ${pet.toys.map(t => renderToy(t)).join('\n  ')}

  <!-- The Pet (bobs up/down, sleeps, walks) -->
  ${renderPet(pet)}

  <!-- Glass container glare overlays (makes it look like a physical terrarium) -->
  <rect x="10" y="10" width="${W - 20}" height="${H - 20}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" rx="8"/>
  <path d="M 12,20 L 150,20 Q 200,20 180,60 L 50,60 Z" fill="rgba(255,255,255,0.03)"/>

  <!-- HUD overlay showing Tamagotchi status indicators -->
  ${renderHUD(pet, username)}

  <style>${renderCSS(pet)}</style>
</svg>`;
}

// ─── Terrarium Asset Renderer ───────────────────────────────
function renderAsset(a: TerrariumAsset): string {
  if (a.assetType === 'empty') return '';

  const x = a.weekIdx * TILE_W + TILE_W / 2;
  const y = GROUND;
  const h = a.height;
  const col = a.color;

  let path = '';
  switch (a.assetType) {
    case 'grass':
      path = `<path class="plant" d="M ${x},${y} Q ${x - 3},${y - h/2} ${x},${y - h} T ${x + 3},${y - h - 4}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linecap="round"/>`;
      break;

    case 'flower':
      path = `
        <line x1="${x}" y1="${y}" x2="${x}" y2="${y - h}" stroke="#78e08f" stroke-width="1.5" stroke-linecap="round"/>
        <circle class="plant" cx="${x}" cy="${y - h}" r="4" fill="${col}"/>
        <circle cx="${x}" cy="${y - h}" r="1.5" fill="#fff"/>
      `;
      break;

    case 'mushroom':
      path = `
        <path d="M ${x - 3},${y} L ${x - 2},${y - h} L ${x + 2},${y - h} L ${x + 3},${y} Z" fill="#f5f6fa"/>
        <path class="plant" d="M ${x - 8},${y - h} C -8,-20 8,-20 ${x + 8},${y - h} Z" fill="${col}" transform="translate(${x}, ${y - h}) translate(-${x}, -${y - h})"/>
        <circle cx="${x - 2}" cy="${y - h - 3}" r="1" fill="#fff"/>
        <circle cx="${x + 3}" cy="${y - h - 2}" r="0.8" fill="#fff"/>
      `;
      break;
  }

  return path;
}

// ─── Dust Bunnies (Messy unresolved bugs) ────────────────────
function renderMessyBunnies(pet: PetData): string {
  const bunnies: string[] = [];
  const seed = pet.username.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  for (let i = 0; i < pet.messyCount; i++) {
    const x = ((seed * (i + 1) * 31) % (W - 100)) + 50;
    const y = ((seed * (i + 1) * 19) % (GROUND - 60)) + 30;
    const delay = (i * 0.4).toFixed(1);

    bunnies.push(`
      <g transform="translate(${x}, ${y})" class="dust-bunny" style="animation-delay:${delay}s">
        <!-- Spiky dust bunny -->
        <circle cx="0" cy="0" r="5" fill="#718093" opacity="0.6"/>
        <path d="M -5,0 L -8,-2 M 5,0 L 8,2 M 0,-5 L 2,-8 M 0,5 L -2,8" stroke="#718093" stroke-width="1" opacity="0.8"/>
        <!-- Glancing eyes -->
        <circle cx="-1.5" cy="-1" r="0.5" fill="#fff"/>
        <circle cx="1.5" cy="-1" r="0.5" fill="#fff"/>
      </g>
    `);
  }
  return bunnies.join('\n');
}

// ─── Pet Toys ────────────────────────────────────────────────
function renderToy(t: ToyData): string {
  const y = GROUND - 1;
  switch (t.type) {
    case 'ball':
      return `<circle cx="${t.x}" cy="${y - 4}" r="4" fill="#e74c3c" stroke="#c0392b" stroke-width="0.8"/>
              <path d="M ${t.x - 3.5},${y - 4} Q ${t.x},${y - 4} ${t.x + 3.5},${y - 4}" fill="none" stroke="#fff" stroke-width="0.8"/>`;

    case 'bowl':
      return `<path d="M ${t.x - 6},${y} L ${t.x + 6},${y} L ${t.x + 4},${y - 5} L ${t.x - 4},${y - 5} Z" fill="#95a5a6"/>
              <ellipse cx="${t.x}" cy="${y - 5}" rx="4" ry="1.5" fill="#e67e22"/> <!-- food inside -->`;

    case 'yarn':
      return `<circle class="plant" cx="${t.x}" cy="${y - 5}" r="5" fill="#9b59b6"/>
              <path d="M ${t.x - 5},${y} Q ${t.x - 10},${y + 2} ${t.x - 12},${y}" fill="none" stroke="#9b59b6" stroke-width="0.8"/>`;
  }
}

// ─── Pet Shape / Anim Renderer ──────────────────────────────
function renderPet(pet: PetData): string {
  const c1 = pet.petColor1;
  const c2 = pet.petColor2;

  let body = '';
  let yOffset = 0;

  // 1. Egg Stage
  if (pet.evolutionStage === 'egg') {
    return `
      <g class="pet-idle pet-egg" transform="translate(450, ${GROUND})">
        <!-- Wobbling Egg -->
        <ellipse cx="0" cy="-10" rx="8" ry="10" fill="#f5f6fa" stroke="#dcdde1" stroke-width="1.5"/>
        <!-- Egg spots -->
        <circle cx="-3" cy="-12" r="1.5" fill="${c1}"/>
        <circle cx="3" cy="-7" r="2" fill="${c2}"/>
        <circle cx="2" cy="-14" r="1" fill="${c1}"/>
        <!-- Crack / Sleep dots -->
        <text x="12" y="-15" font-family="monospace" font-size="8" fill="#fff" opacity="0.6">zZ</text>
      </g>
    `;
  }

  // 2. Child Stage (Blob)
  if (pet.evolutionStage === 'child') {
    body = `
      <ellipse cx="0" cy="-6" rx="9" ry="6" fill="${c1}"/>
      <circle cx="-3" cy="-7" r="1.5" fill="#fff"/>
      <circle cx="-3" cy="-7" r="0.7" fill="#000"/>
      <circle cx="3" cy="-7" r="1.5" fill="#fff"/>
      <circle cx="3" cy="-7" r="0.7" fill="#000"/>
      <path d="M -1,-4 Q 0,-3 1,-4" fill="none" stroke="#000" stroke-width="0.5"/>
      <path d="M -9,-6 Q -14,-10 -11,-3" fill="none" stroke="${c2}" stroke-width="2" stroke-linecap="round"/> <!-- wiggling tail -->
    `;
  } else {
    // 3. Teen / Legendary Stage (Specific species)
    const scale = pet.evolutionStage === 'legendary' ? 1.3 : 1.0;
    yOffset = pet.evolutionStage === 'legendary' ? 5 : 0;

    switch (pet.petType) {
      case 'fox':
        body = `
          <g transform="scale(${scale})">
            <!-- Body -->
            <ellipse cx="0" cy="-7" rx="9" ry="7" fill="${c1}"/>
            <!-- Snout/Face -->
            <polygon points="-4,-7 4,-7 0,-3" fill="${c2}"/>
            <circle cx="0" cy="-3.5" r="0.8" fill="#000"/> <!-- nose -->
            <!-- Eyes -->
            <circle cx="-3.5" cy="-9" r="1.2" fill="#000"/>
            <circle cx="3.5" cy="-9" r="1.2" fill="#000"/>
            <!-- Ears -->
            <polygon points="-8,-12 -8,-18 -3,-13" fill="${c1}"/>
            <polygon points="8,-12 8,-18 3,-13" fill="${c1}"/>
            <polygon points="-7,-13 -7,-16 -4,-13" fill="${c2}"/>
            <polygon points="7,-13 7,-16 4,-13" fill="${c2}"/>
            <!-- Fluffy Tail -->
            <path class="pet-tail" d="M -9,-6 Q -18,-15 -14,-2 Z" fill="${c1}"/>
            <path class="pet-tail" d="M -14,-2 Q -18,-15 -14,-7 Z" fill="${c2}"/>
          </g>
        `;
        break;

      case 'dragon':
        body = `
          <g transform="scale(${scale})">
            <!-- Body -->
            <ellipse cx="0" cy="-8" rx="8" ry="8" fill="${c1}"/>
            <path d="M 0,0 L 2,6 L -2,6 Z" fill="${c2}"/>
            <!-- Wings -->
            <path class="pet-wing-l" d="M -6,-10 Q -18,-14 -12,-4 Z" fill="${c2}" opacity="0.8"/>
            <path class="pet-wing-r" d="M 6,-10 Q 18,-14 12,-4 Z" fill="${c2}" opacity="0.8"/>
            <!-- Head & Horns -->
            <circle cx="0" cy="-17" r="5" fill="${c1}"/>
            <path d="M -3,-22 L -1,-19 M 3,-22 L 1,-19" stroke="${c2}" stroke-width="2" stroke-linecap="round"/>
            <!-- Eyes -->
            <circle cx="-2" cy="-17" r="1" fill="#000"/>
            <circle cx="2" cy="-17" r="1" fill="#000"/>
            <!-- Tail -->
            <path d="M -8,-6 Q -15,-2 -18,-8" fill="none" stroke="${c1}" stroke-width="2.5" stroke-linecap="round"/>
          </g>
        `;
        break;

      case 'snake':
        body = `
          <g transform="scale(${scale})">
            <!-- Coiled snake body -->
            <path d="M -10,-4 Q -5,-8 0,-4 T 10,-4" fill="none" stroke="${c1}" stroke-width="5" stroke-linecap="round"/>
            <path d="M -8,-2 Q -4,-5 0,-2 T 8,-2" fill="none" stroke="${c2}" stroke-width="2" stroke-linecap="round"/>
            <!-- Head -->
            <circle cx="10" cy="-7" r="4.5" fill="${c1}"/>
            <!-- Eyes -->
            <circle cx="10" cy="-8" r="0.8" fill="#000"/>
            <!-- Tongue -->
            <path d="M 14.5,-7 L 17.5,-7 M 17.5,-7 L 19,-8 M 17.5,-7 L 19,-6" fill="none" stroke="#e74c3c" stroke-width="0.8"/>
          </g>
        `;
        break;

      case 'gopher':
        body = `
          <g transform="scale(${scale})">
            <!-- Oval upright body -->
            <rect x="-8" y="-16" width="16" height="16" rx="7" fill="${c1}"/>
            <ellipse cx="0" cy="-4" rx="5" ry="4" fill="${c2}"/> <!-- belly -->
            <!-- Teeth -->
            <rect x="-1.5" y="-10" width="3" height="2" fill="#fff"/>
            <line x1="0" y1="-10" x2="0" y2="-8" stroke="#000" stroke-width="0.5"/>
            <!-- Snout/Nose -->
            <circle cx="0" cy="-11.5" r="1.5" fill="#ff7675"/>
            <!-- Eyes -->
            <circle cx="-3" cy="-13" r="1.2" fill="#000"/>
            <circle cx="3" cy="-13" r="1.2" fill="#000"/>
            <!-- Ears -->
            <circle cx="-7" cy="-16" r="2" fill="${c1}"/>
            <circle cx="7" cy="-16" r="2" fill="${c1}"/>
          </g>
        `;
        break;

      case 'golem':
        body = `
          <g transform="scale(${scale})">
            <!-- Blocky mechanical shoulders -->
            <rect x="-10" y="-12" width="20" height="12" rx="1.5" fill="${c1}" stroke="${c2}" stroke-width="1"/>
            <!-- Mechanical joints -->
            <circle cx="-8" cy="-3" r="2" fill="${c2}"/>
            <circle cx="8" cy="-3" r="2" fill="${c2}"/>
            <!-- Head / Visor -->
            <rect x="-6" y="-19" width="12" height="7" rx="1" fill="${c2}"/>
            <rect class="golem-visor" x="-4" y="-16" width="8" height="1.5" fill="#00ffff" filter="url(#glow)"/>
          </g>
        `;
        break;
    }
  }

  // 4. Hat/Accessory
  let accDraw = '';
  const hatY = pet.evolutionStage === 'child' ? -12 : (pet.petType === 'golem' ? -19 : -17);
  
  switch (pet.accessory) {
    case 'partyhat':
      accDraw = `
        <polygon points="-4,${hatY} 4,${hatY} 0,${hatY - 10}" fill="#e74c3c"/>
        <circle cx="0" cy="${hatY - 10}" r="1.2" fill="#f1c40f"/>
      `;
      break;
    case 'wizardhat':
      accDraw = `
        <polygon points="-6,${hatY} 6,${hatY} 0,${hatY - 14}" fill="#341f97"/>
        <path d="M -8,${hatY} L 8,${hatY}" stroke="#341f97" stroke-width="1.5" stroke-linecap="round"/>
        <polygon points="-1,${hatY - 7} 1,${hatY - 7} 0,${hatY - 9}" fill="#f1c40f"/>
      `;
      break;
    case 'crown':
      accDraw = `
        <polygon points="-6,${hatY} 6,${hatY} 5,${hatY - 6} 2,${hatY - 3} 0,${hatY - 8} -2,${hatY - 3} -5,${hatY - 6}" fill="#f1c40f" stroke="#d35400" stroke-width="0.5"/>
        <circle cx="0" cy="${hatY - 8}" r="0.8" fill="#e74c3c"/>
      `;
      break;
  }

  // 5. Emotion Bubble
  let emoDraw = '';
  const bubX = 14;
  const bubY = -18;
  switch (pet.emotion) {
    case 'happy':
      emoDraw = `
        <path d="M ${bubX},${bubY} C ${bubX + 15},${bubY - 15} ${bubX + 25},${bubY} ${bubX},${bubY + 5} Z" fill="rgba(255,255,255,0.7)"/>
        <path d="M ${bubX + 6},${bubY - 3} Q ${bubX + 9},${bubY - 7} ${bubX + 11},${bubY - 3}" fill="none" stroke="#ff4757" stroke-width="1.2" stroke-linecap="round"/>
      `;
      break;
    case 'sad':
      emoDraw = `
        <path d="M ${bubX},${bubY} C ${bubX + 15},${bubY - 15} ${bubX + 25},${bubY} ${bubX},${bubY + 5} Z" fill="rgba(0,0,0,0.6)"/>
        <text x="${bubX + 4}" y="${bubY - 2}" font-family="monospace" font-size="7" fill="#54a0ff">💧</text>
      `;
      break;
    case 'sweat':
      emoDraw = `
        <path class="plant" d="M ${bubX},${bubY} Q ${bubX + 5},${bubY - 8} ${bubX + 2},${bubY - 12}" fill="none" stroke="#54a0ff" stroke-width="2" stroke-linecap="round"/>
      `;
      break;
    case 'neutral':
      emoDraw = `
        <path d="M ${bubX},${bubY} C ${bubX + 12},${bubY - 10} ${bubX + 22},${bubY} ${bubX},${bubY + 5} Z" fill="rgba(255,255,255,0.7)"/>
        <circle cx="${bubX + 6}" cy="${bubY - 3}" r="0.5" fill="#000"/>
        <circle cx="${bubX + 9}" cy="${bubY - 3}" r="0.5" fill="#000"/>
        <circle cx="${bubX + 12}" cy="${bubY - 3}" r="0.5" fill="#000"/>
      `;
      break;
  }

  // Legendary flame particles overlay
  const legendaryAura = pet.evolutionStage === 'legendary' ? `
    <circle class="aura-particle" cx="-12" cy="-12" r="1.5" fill="${c1}" filter="url(#glow)"/>
    <circle class="aura-particle" cx="12" cy="-14" r="2" fill="${c2}" filter="url(#glow)" style="animation-delay:0.4s"/>
    <circle class="aura-particle" cx="0" cy="-24" r="1.2" fill="#fff" filter="url(#glow)" style="animation-delay:0.8s"/>
  ` : '';

  return `
    <g class="pet-idle" transform="translate(450, ${GROUND - yOffset})">
      ${legendaryAura}
      ${body}
      ${accDraw}
      ${emoDraw}
    </g>
  `;
}

// ─── HUD / Tamagotchi Interface Overlay ──────────────────────
function renderHUD(pet: PetData, username: string): string {
  // Map values to 0 - 5 bar meters
  const hungerBars = Math.min(5, Math.ceil((pet.totalContributions / 200) * 5));
  const funBars    = Math.min(5, Math.ceil((pet.totalStars / 50) * 5));
  const healthBars = Math.min(5, Math.ceil((pet.streak / 15) * 5));

  return `
  <!-- Info Banner -->
  <g>
    <rect x="8" y="8" width="220" height="22" rx="4" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.1)"/>
    <text x="14" y="22" font-family="monospace" font-size="10" fill="#fff" font-weight="bold">
      👾 ${username}'s ${pet.petType.toUpperCase()} (Lvl ${pet.evolutionStage.toUpperCase()})
    </text>
  </g>

  <!-- Tamagotchi Status Meters (Hunger, Fun, Health) -->
  <g transform="translate(${W - 250}, 8)">
    <rect x="0" y="0" width="240" height="52" rx="4" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.1)"/>
    
    <!-- Hunger Meter (Commits) -->
    <text x="8" y="16" font-family="monospace" font-size="8" fill="#fff" opacity="0.8">FOOD  [${'█'.repeat(hungerBars)}${'░'.repeat(5 - hungerBars)}]</text>
    <!-- Fun Meter (Stars) -->
    <text x="8" y="30" font-family="monospace" font-size="8" fill="#fff" opacity="0.8">PLAY  [${'█'.repeat(funBars)}${'░'.repeat(5 - funBars)}]</text>
    <!-- Health Meter (Streak) -->
    <text x="8" y="44" font-family="monospace" font-size="8" fill="#fff" opacity="0.8">HEALTH[${'█'.repeat(healthBars)}${'░'.repeat(5 - healthBars)}]</text>
  </g>
  `;
}

// ─── CSS Animations ──────────────────────────────────────────
function renderCSS(pet: PetData): string {
  return `
    /* Pet bobbing/breathing animation */
    .pet-idle {
      animation: pet-bob 4s ease-in-out infinite alternate;
    }
    @keyframes pet-bob {
      0%   { transform: translate(450px, ${GROUND}px) scaleY(0.96) scaleX(1.02); }
      100% { transform: translate(450px, ${GROUND - 6}px) scaleY(1.02) scaleX(0.98); }
    }

    /* Wiggling Fox/Child tail */
    .pet-tail {
      animation: tail-wag 0.8s ease-in-out infinite alternate;
      transform-origin: -9px -6px;
    }
    @keyframes tail-wag {
      from { transform: rotate(-8deg); }
      to   { transform: rotate(10deg); }
    }

    /* Flapping dragon wings */
    .pet-wing-l {
      animation: wing-flap-l 0.6s ease-in-out infinite alternate;
      transform-origin: -6px -10px;
    }
    .pet-wing-r {
      animation: wing-flap-r 0.6s ease-in-out infinite alternate;
      transform-origin: 6px -10px;
    }
    @keyframes wing-flap-l {
      from { transform: rotate(-10deg); }
      to   { transform: rotate(15deg); }
    }
    @keyframes wing-flap-r {
      from { transform: rotate(10deg); }
      to   { transform: rotate(-15deg); }
    }

    /* Golem visor pulse */
    .golem-visor {
      animation: visor-glow 2s ease-in-out infinite alternate;
    }
    @keyframes visor-glow {
      from { fill: #00ffff; filter: brightness(0.8); }
      to   { fill: #00e5ff; filter: brightness(1.5); }
    }

    /* Waving terrarium flora */
    .plant {
      animation: flora-wave 3s ease-in-out infinite alternate;
      transform-origin: bottom center;
    }
    @keyframes flora-wave {
      from { transform: skewX(-4deg); }
      to   { transform: skewX(4deg); }
    }

    /* Dust bunnies floating */
    .dust-bunny {
      animation: bunny-float 5s ease-in-out infinite alternate;
    }
    @keyframes bunny-float {
      0%   { transform: translate(0, 0); }
      100% { transform: translate(10px, -15px) rotate(15deg); }
    }

    /* Legendary aura floating particles */
    .aura-particle {
      animation: particle-rise 2s infinite ease-in-out;
    }
    @keyframes particle-rise {
      0%   { transform: translateY(0px) scale(0.5); opacity: 0; }
      50%  { opacity: 0.8; }
      100% { transform: translateY(-20px) scale(1.1); opacity: 0; }
    }
  `;
}
