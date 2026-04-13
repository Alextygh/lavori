// ai.js — Preset-based arrival descriptions (no server required)

// Keys match the biome IDs from world.js
const BIOME_PHRASES = {
  'void':         ['An absence of everything surrounds you here', 'The void offers no landmarks, no horizon, no sound', 'Nothing here confirms you exist'],
  'deep-ocean':   ['Impossible depths press in from all sides', 'The water is black and absolutely still', 'No light has reached this place in centuries'],
  'ocean':        ['A grey expanse of open water stretches without limit', 'The ocean swells and breathes around you', 'Waves carry no message from any shore'],
  'shore':        ['The tide pulls at sand that has never known footprints', 'Where water meets land, something watches from the surf', 'The shoreline curves away in both directions forever'],
  'tundra':       ['Frozen ground crunches underfoot in the windswept flatness', 'The tundra offers nothing to hide behind', 'A pale sky presses down on an unbroken horizon'],
  'snow':         ['Snowfields stretch in every direction without a single track', 'Silence here is the kind that swallows sound before it travels', 'The whiteness offers no depth, no shadow, no relief'],
  'plains':       ['Tall grass sways in a wind that carries no smell of anything alive', 'The plains roll on past where vision ends', 'Something moved through here long ago and left no trail'],
  'forest':       ['Trees close in from every direction, their canopy blocking all sky', 'The forest has been here longer than any map', 'Bark older than memory absorbs the sound of your arrival'],
  'dense-forest': ['The undergrowth is impenetrable in every direction but here', 'Light barely reaches the ground through this canopy', 'Something shifts in the dark between the trunks'],
  'jungle':       ['Vegetation presses close, wet and indifferent', 'The jungle breathes humidity and rot and growth', 'Everything here is in the process of consuming something else'],
  'swamp':        ['Still water reflects a sky you cannot see directly', 'The swamp accepts your weight reluctantly', 'Gas rises from the mud in slow, purposeful columns'],
  'desert':       ['Sand extends to every horizon without interruption', 'Heat distorts the air into shapes that almost resemble things', 'The desert has outlasted everyone who came before you'],
  'badlands':     ['Eroded rock towers above in formations with no natural name', 'The badlands were beautiful once, before whatever happened', 'Rust-colored stone crumbles at the edges of the path'],
  'mountain':     ['The mountains rise around you, indifferent to your scale', 'Thin air and distance make everything feel further than it is', 'Rock faces reflect nothing back'],
  'peak':         ['From the peak, everything below is the same shade of small', 'Cold air moves through without stopping', 'The summit offers a view of more of the same'],
  'volcanic':     ['Heat rises from cracks in the ground without flame', 'The volcanic rock is young here, geologically speaking', 'Sulfur and silence share the air equally'],
  'lava':         ['Lava fields have cooled to a brittle black crust underfoot', 'The ground here has memory of when it was liquid', 'Cracks in the rock glow faintly from below'],
  'crystal':      ['Crystal formations catch light from no visible source', 'The basin resonates at a frequency just below hearing', 'Refracted color moves across surfaces that should be still'],
  'anomaly':      ['The rules of the surrounding landscape do not apply here', 'Something about this zone resists description', 'You arrived correctly, but nothing else about this place is correct'],
};

// Keys match the weather IDs from world.js
const WEATHER_PHRASES = {
  'clear':     ['under a sky too clear to trust', 'in light that reveals everything and explains nothing', 'beneath open sky with nowhere to hide'],
  'cloudy':    ['under a ceiling of grey that offers no weather, only threat', 'in flat overcast light that flattens all shadows', 'beneath clouds moving with purpose toward somewhere else'],
  'foggy':     ['in fog that arrived before you did', 'through heavy mist that reduces the world to ten meters in any direction', 'in fog that makes distance impossible to judge'],
  'rain':      ['in rainfall that has been going on for longer than your arrival', 'as rain falls without wind or drama', 'through steady rain that soaks without announcing itself'],
  'storm':     ['as a storm builds without moving closer or further', 'under electrical sky that illuminates nothing clearly', 'in storm conditions that make no sound between strikes'],
  'snow':      ['as snowfall erases everything that came before', 'in falling snow that makes the air itself disappear', 'through snow that accumulates without intent'],
  'blizzard':  ['in a blizzard that makes direction meaningless', 'as white-out conditions remove all reference points', 'through a blizzard that does not distinguish between ground and sky'],
  'ash':       ['as ash falls without any visible source', 'in a rain of grey particles that coat everything equally', 'through ash fall that carries the smell of something ended'],
  'aurora':    ['under aurora that moves against the logic of atmosphere', 'as colored light bends across the sky without explanation', 'beneath an aurora that responds to nothing visible'],
  'static':    ['as static pulses through the air at irregular intervals', 'in electromagnetic conditions that make hair and thought both rise', 'through a static pulse that arrived exactly when you did'],
};

// Varied closing lines — coordinates are injected where {coords} appears
const CLOSINGS = [
  'The coordinates are correct. Everything else is uncertain.',
  'You are the only record that this place exists.',
  'Whatever named this world did not get this far.',
  'There is no signal here. There is no one to send one to.',
  'This location will outlast your knowledge of it.',
  'The world generates this place whether or not anyone arrives.',
  'Distance from here to anywhere is not a number that fits on a sign.',
  'Something about the air suggests this is not the first time, but the evidence is gone.',
  'You have not discovered this place. You have simply confirmed its coordinates.',
  'The silence here predates language.',
  'If you leave, nothing about this place will remember you did.',
  'The grid extends. You are one point on it.',
  'This terrain was always here. Your arrival changes nothing about that.',
  'There is no landmark. You are the landmark, temporarily.',
  'Somewhere beyond this, the pattern continues without variation or end.',
  'The coordinates are logged. The place is indifferent to that.',
  'Unmapped is not the same as unknown — the math knew this was here.',
  'This exists at the same depth of wilderness as every other coordinate.',
  'You have not gone further than anyone. You have simply gone differently.',
  'The world does not run out. It just gets less visited.',
];

// Maps biome display names → biome IDs (from world.js BIOMES)
const BIOME_NAME_TO_ID = {
  'Void': 'void', 'Deep Ocean': 'deep-ocean', 'Ocean': 'ocean',
  'Shoreline': 'shore', 'Tundra': 'tundra', 'Snowfield': 'snow',
  'Plains': 'plains', 'Forest': 'forest', 'Dense Forest': 'dense-forest',
  'Jungle': 'jungle', 'Swamp': 'swamp', 'Desert': 'desert',
  'Badlands': 'badlands', 'Mountains': 'mountain', 'Peak': 'peak',
  'Volcanic': 'volcanic', 'Lava Fields': 'lava', 'Crystal Basin': 'crystal',
  'Anomaly Zone': 'anomaly',
};

// Maps weather display names → weather IDs (from world.js WEATHERS)
const WEATHER_NAME_TO_ID = {
  'Clear': 'clear', 'Overcast': 'cloudy', 'Heavy Fog': 'foggy',
  'Rainfall': 'rain', 'Thunderstorm': 'storm', 'Snowfall': 'snow',
  'Blizzard': 'blizzard', 'Ash Rain': 'ash', 'Aurora': 'aurora',
  'Static Pulse': 'static',
};

const ARRIVAL_OPENERS = [
  'You arrive at {coords}.',
  'Coordinates {coords}.',
  'The Infinite Wild delivers you to {coords}.',
  'At {coords}, you materialize.',
  '{coords} —',
  'You surface at {coords}.',
];

function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length];
}

function hashInt(x, z) {
  let h = (Math.imul(x | 0, 1619) + Math.imul(z | 0, 31337) + 1013904223) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) | 0;
  return (h ^ (h >>> 16)) >>> 0;
}

export function generateArrivalDescription(x, z, biomeName, weatherName) {
  const biomeKey   = BIOME_NAME_TO_ID[biomeName]   || 'plains';
  const weatherKey = WEATHER_NAME_TO_ID[weatherName] || 'clear';

  const seed = hashInt(x, z);
  const coordStr = x.toLocaleString() + ', ' + z.toLocaleString();

  const opener      = pick(ARRIVAL_OPENERS, seed).replace('{coords}', coordStr);
  const biomeLine   = pick(BIOME_PHRASES[biomeKey],    seed + 1);
  const weatherLine = pick(WEATHER_PHRASES[weatherKey], seed + 2);
  const closing     = pick(CLOSINGS,                    seed + 3);

  return Promise.resolve(`${opener} ${biomeLine} ${weatherLine}. ${closing}`);
}

export function fallbackDescription(x, z, biomeName, weatherName) {
  const seed = hashInt(x, z);
  const closing = pick(CLOSINGS, seed + 3);
  return `You arrive at ${x.toLocaleString()}, ${z.toLocaleString()}. A ${biomeName.toLowerCase()} stretches in every direction under ${weatherName.toLowerCase()} skies. ${closing}`;
}
