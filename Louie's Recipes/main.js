/* ══════════════════════════════════════════════════════
   LOUIE'S INTERGALACTIC COOKBOOK — main.js
   Shared across all pages
   ══════════════════════════════════════════════════════ */

'use strict';

// ─────────────────────────────────────────────────────
//  NAVIGATION HIGHLIGHT
// ─────────────────────────────────────────────────────
(function () {
  const page = document.body.dataset.page;
  if (!page) return;
  const link = document.getElementById('nav-' + page);
  if (link) link.classList.add('active');
})();

// ─────────────────────────────────────────────────────
//  SCROLL FADE-IN
// ─────────────────────────────────────────────────────
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

// ─────────────────────────────────────────────────────
//  BOSS SETS
// ─────────────────────────────────────────────────────
const p1Bosses = new Set([
  'Armored Cannon Beetle','Beady Long Legs','Burrowing Snagret',
  'Emperor Bulblax','Goolix','Mamuta','Puffstool','Smoky Progg'
]);
const p2Bosses = new Set([
  'Empress Bulblax','Burrowing Snagret','Beady Long Legs','Emperor Bulblax',
  'Giant Breadbug','Pileated Snagret','Man-at-Legs','Ranging Bloyster',
  'Waterwraith','Segmented Crawbster','Raging Long Legs','Titan Dweevil'
]);
const p3Bosses = new Set([
  'Armored Mawdad','Vehemoth Phosbat','Sandbelching Meerslug',
  'Scornet Maestro','Quaggled Mireclops','Plasm Wraith',
  'Shaggy Long Legs','Burrowing Snagret','Bug-Eyed Crawmad','Baldy Long Legs'
]);
const p4Bosses = new Set([
  'Foolix','Emperor Bulblax','Groovy Long Legs','Waterwraith','Gildemander',
  'Snowfake Fluttertail','Giant Breadbug','Man-at-Legs','Sovereign Bulblax',
  'Smoky Progg','Ancient Sirehound','Porquillion','Burrowing Snagret',
  'Crusted Rumpup','Hermit Crawmad','Bug-Eyed Crawmad','Baldy Long Legs',
  'Empress Bulblax','Mammoth Snootwhacker','Toxstool','Jumbo Bulborb',
  'Puffstool','Arctic Cannon Beetle','Horned Cannon Beetle','Titan Blowhog'
]);
const hpBosses = new Set([
  'Armurk','Berserk Leech Hydroe','Electric Cottonade','Long Water Dumple','Luring Slurker',
  'Emperor Bulblax',
  'Queen Shearwig'
]);

// ─────────────────────────────────────────────────────
//  MEAT TYPE MAP
//  Categories: bulborb · invertebrate · aquatic · avian
//              arachnid · aerial · fungus · gelatinous
//              mechanical · unknown
// ─────────────────────────────────────────────────────
const meatMap = {
  // ── PIKMIN 1 ──
  'Armored Cannon Beetle':'invertebrate',
  'Beady Long Legs':['arachnid','invertebrate'],
  'Breadbug':'bulborb',
  'Bulborb':'bulborb',
  'Burrowing Snagret':'avian',
  'Dwarf Bulbear':'bulborb',
  'Dwarf Bulborb':'bulborb',
  'Emperor Bulblax':'bulborb',
  'Female Sheargrub':'invertebrate',
  'Fiery Blowhog':'blowhog',
  'Goolix':'gelatinous',
  'Honeywisp':['aerial','gelatinous'],
  'Iridescent Flint Beetle':'invertebrate',
  'Male Sheargrub':'invertebrate',
  'Mamuta':'unknown',
  'Mushroom Pikmin':'fungus',
  'Pearly Clamclamp':['aquatic','invertebrate'],
  'Puffstool':'fungus',
  'Puffy Blowhog':['aerial','blowhog'],
  'Shearwig':['aerial','invertebrate'],
  'Smoky Progg':'unknown',
  'Spotty Bulbear':'bulborb',
  'Swooping Snitchbug':['aerial','invertebrate'],
  'Water Dumple':'aquatic',
  'Wolpole':'aquatic',
  'Wollyhop':'aquatic',
  'Yellow Wollyhop':'aquatic',
  // ── PIKMIN 2 ──
  'Anode Beetle':'invertebrate',
  'Anode Dweevil':['arachnid','invertebrate'],
  'Antenna Beetle':'invertebrate',
  'Armored Cannon Larva':'invertebrate',
  'Bulbmin':'bulborb',
  'Bulborb Larva':'bulborb',
  'Bumbling Snitchbug':['aerial','invertebrate'],
  'Careening Dirigibug':['aerial','invertebrate'],
  'Cloaking Burrow-nit':'invertebrate',
  'Creeping Chrysanthemum':'unknown',
  'Decorated Cannon Beetle':'invertebrate',
  'Doodlebug':'invertebrate',
  'Dwarf Orange Bulborb':'bulborb',
  'Empress Bulblax':'bulborb',
  'Fiery Bulblax':'bulborb',
  'Fiery Dweevil':['arachnid','invertebrate'],
  'Gatling Groink':'mechanical',
  'Giant Breadbug':'bulborb',
  'Greater Spotted Jellyfloat':['aerial','aquatic','invertebrate'],
  'Hairy Bulborb':'bulborb',
  'Hermit Crawmad':['aquatic','invertebrate'],
  'Hydro Dweevil':['arachnid','invertebrate'],
  'Iridescent Glint Beetle':'invertebrate',
  'Lesser Spotted Jellyfloat':['aerial','aquatic','invertebrate'],
  'Man-at-Legs':['arachnid','mechanical'],
  'Mitite':'invertebrate',
  'Munge Dweevil':['arachnid','invertebrate'],
  'Orange Bulborb':'bulborb',
  'Pileated Snagret':'avian',
  'Raging Long Legs':['arachnid','invertebrate'],
  'Ranging Bloyster':['aquatic','invertebrate'],
  'Ravenous Whiskerpillar':'invertebrate',
  'Segmented Crawbster':['aquatic','invertebrate'],
  'Skitter Leaf':'invertebrate',
  'Snow Bulborb':'bulborb',
  'Titan Dweevil':'mechanical',
  'Toady Bloyster':['aquatic','invertebrate'],
  'Ujadani':'invertebrate',
  'Unmarked Spectralids':['aerial','invertebrate'],
  'Volatile Dweevil':['arachnid','invertebrate'],
  'Waterwraith':'gelatinous',
  'Watery Blowhog':'blowhog',
  'Withering Blowhog':['aerial','blowhog'],
  // ── PIKMIN 3 ──
  'Arachnode':['arachnid','invertebrate'],
  'Arctic Cannon Larva':'invertebrate',
  'Armored Mawdad':'unknown',
  'Baldy Long Legs':['arachnid','invertebrate'],
  'Bearded Amprat':'unknown',
  'Bug-Eyed Crawmad':['aquatic','invertebrate'],
  'Calcified Crushblat':'unknown',
  'Desiccated Skitter Leaf':'invertebrate',
  'Flighty Joustmite':['aerial','invertebrate'],
  'Joustmite':'invertebrate',
  'Medusal Slurker':['aerial','gelatinous'],
  'Mysterious Life-Form':'gelatinous',
  'Nectarous Dandelfly':['aerial','invertebrate'],
  'Peckish Aristocrab':['aquatic','invertebrate'],
  'Phosbat':'aerial',
  'Phosbat Pod':'fungus',
  'Plasm Wraith':'gelatinous',
  'Puckering Blinnow':'aquatic',
  'Pyroclasmic Slooch':'unknown',
  'Quaggled Mireclops':'unknown',
  'Red Spectralids':['aerial','invertebrate'],
  'Sandbelching Meerslug':'unknown',
  'Scornet':['aerial','invertebrate'],
  'Scornet Maestro':['aerial','invertebrate'],
  'Shaggy Long Legs':['arachnid','invertebrate'],
  'Skeeterskate':['aquatic','invertebrate'],
  'Skutterchuck':'invertebrate',
  'Sputtlefish':'aquatic',
  'Swarming Sheargrub':'invertebrate',
  'Vehemoth Phosbat':'aerial',
  'Waddlepus':['aquatic','invertebrate'],
  'Whiptongue Bulborb':'bulborb',
  'White Spectralids':['aerial','invertebrate'],
  'Yellow Spectralids':['aerial','invertebrate'],
  // ── PIKMIN 4 ──
  'Albino Dwarf Bulborb':'bulborb',
  'Ancient Sirehound':'unknown',
  'Arctic Cannon Beetle':'invertebrate',
  'Aristocrab Offspring':['aquatic','invertebrate'],
  'Blizzarding Blowhog':'blowhog',
  'Bloomcap Bloyster':'invertebrate',
  'Bogswallow':'invertebrate',
  'Chillyhop':'aquatic',
  'Crusted Rumpup':'unknown',
  'Downy Snagret':'avian',
  'Dwarf Frosty Bulborb':'bulborb',
  'Electric Spectralid':['aerial','invertebrate'],
  'Foolix':'gelatinous',
  'Freezecake':'invertebrate',
  'Frosty Bulborb':'bulborb',
  'Gildemander':'unknown',
  'Gildemandwee':'unknown',
  'Groovy Long Legs':['arachnid','invertebrate'],
  'Grubchucker':['aquatic','invertebrate'],
  'Horned Cannon Beetle':'invertebrate',
  'Iceblown Dweevil':['arachnid','invertebrate'],
  'Icy Blowhog':['aerial','blowhog'],
  'Jumbo Bulborb':'bulborb',
  'Mama Sheargrub':'invertebrate',
  'Mammoth Snootwhacker':'unknown',
  'Masterhop':'aquatic',
  'Miniature Snootwhacker':'unknown',
  'Moldy Dwarf Bulborb':'bulborb',
  'Moldy Slooch':'unknown',
  'Moss':'unknown',
  'Muckerskate':['aquatic','invertebrate'],
  'Porquillion':'invertebrate',
  'Pricklepuff':'aquatic',
  'Scorchcake':'invertebrate',
  'Shearflea':'invertebrate',
  'Shockcake':'invertebrate',
  'Snowy Blowhog':'blowhog',
  'Snowfake Fluttertail':['aerial','invertebrate'],
  'Sovereign Bulblax':'bulborb',
  'Startle Spore':'unknown',
  'Sunsquish':'invertebrate',
  'Titan Blowhog':'blowhog',
  'Toxstool':'fungus',
  'Tusked Blowhog':'blowhog',
  'Venom Dweevil':['arachnid','invertebrate'],
  'Waddlequaff':'avian',
  // ── HEY! PIKMIN ──
  'Adult Centipare':'invertebrate',
  'Armurk':'invertebrate',
  'Berserk Leech Hydroe':['aerial','invertebrate'],
  'Blubbug':'invertebrate',
  'Centipare':['aerial','invertebrate'],
  'Clicking Slurker':['aerial','gelatinous'],
  'Coppeller':['aerial','invertebrate'],
  'Crammed Wraith':'invertebrate',
  'Crested Mockiwi':'avian',
  'Crumbug':'bulborb',
  'Crystalline Crushblat':'unknown',
  'Electric Cottonade':'aerial',
  'Electripede':'invertebrate',
  'Elongated Crushblat':'avian',
  'Eye-Stalker Bulbeel':'invertebrate',
  'Fiery Blowlet':'blowhog',
  'Fiery Dwarf Bulblax':['aerial','bulborb'],
  'Fiery Young Yellow Wollywog':'aquatic',
  'Fireflap Bulborb':'bulborb',
  'Fireflinger Groink':'mechanical',
  'Firesnout Beetle':'invertebrate',
  'Flatterchuck':'invertebrate',
  'Flying Spotted Jellyfloat':['aerial','aquatic','invertebrate'],
  'Grabbit':'invertebrate',
  'Large Splurchin':['aquatic','invertebrate'],
  'Leech Hydroe':'gelatinous',
  'Long Water Dumple':'aquatic',
  'Luring Slurker':'aquatic',
  'Mockiwi':'avian',
  'Muggonfly':['aerial','invertebrate'],
  'Puffstalk':'fungus',
  'Puffy Blubbug':['aerial','invertebrate'],
  'Queen Shearwig':['aerial','invertebrate'],
  'Red Bubblimp':'invertebrate',
  'Seedbagger':'invertebrate',
  'Shearblug':'invertebrate',
  'Shooting Spiner (Female)':'invertebrate',
  'Shooting Spiner (Male)':'invertebrate',
  'Sparrowhead':['aerial','invertebrate'],
  'Speargrub':'invertebrate',
  'Spiny Coppeller':['aerial','invertebrate'],
  'Sporegrub':'invertebrate',
  'Spornet':['aerial','invertebrate'],
  'Starnacle':['aquatic','invertebrate'],
  'Stony Flint Beetle':'invertebrate',
  'Stuffed Bellbloom':'invertebrate',
  'Widemouthed Anode Beetle':'invertebrate',
  'Young Yellow Wollywog':'aquatic',
};

function getMeat(name) {
  const v = meatMap[name];
  if (!v) return ['unknown'];
  return Array.isArray(v) ? v : [v];
}

const MEAT_LABELS = {
  bulborb:      'Bulborb',
  invertebrate: 'Invertebrate',
  aquatic:      'Aquatic',
  avian:        'Avian',
  arachnid:     'Arachnid',
  aerial:       'Aerial',
  fungus:       'Fungus',
  gelatinous:   'Gelatinous',
  mechanical:   'Mechanical',
  blowhog:	'Blowhog',
  unknown:      'Unknown',
};

// ─────────────────────────────────────────────────────
//  ICON MAP — full URLs; replace any value to fix an icon
// ─────────────────────────────────────────────────────
const iconMap = {
  // ── PIKMIN 1 ──
  'Armored Cannon Beetle':'https://pikmin.wiki.gallery/images/thumb/0/03/Armored_Cannon_Beetle_icon.png/48px-Armored_Cannon_Beetle_icon.png',
  'Beady Long Legs':'https://pikmin.wiki.gallery/images/thumb/0/0e/Beady_Long_Legs_icon.png/48px-Beady_Long_Legs_icon.png',
  'Breadbug':'https://pikmin.wiki.gallery/images/thumb/b/b3/Breadbug_icon.png/36px-Breadbug_icon.png',
  'Bulborb':'https://pikmin.wiki.gallery/images/thumb/4/40/Bulborb_icon.png/36px-Bulborb_icon.png',
  'Burrowing Snagret':'https://pikmin.wiki.gallery/images/thumb/c/c5/Burrowing_Snagret_icon.png/48px-Burrowing_Snagret_icon.png',
  'Dwarf Bulbear':'https://pikmin.wiki.gallery/images/thumb/a/ac/Dwarf_Bulbear_icon.png/36px-Dwarf_Bulbear_icon.png',
  'Dwarf Bulborb':'https://pikmin.wiki.gallery/images/thumb/7/73/Dwarf_Bulborb_icon.png/36px-Dwarf_Bulborb_icon.png',
  'Emperor Bulblax':'https://pikmin.wiki.gallery/images/thumb/c/c0/Emperor_Bulblax_icon.png/48px-Emperor_Bulblax_icon.png',
  'Female Sheargrub':'https://pikmin.wiki.gallery/images/thumb/8/88/Female_Sheargrub_icon.png/36px-Female_Sheargrub_icon.png',
  'Fiery Blowhog':'https://pikmin.wiki.gallery/images/thumb/8/8c/Fiery_Blowhog_icon.png/36px-Fiery_Blowhog_icon.png',
  'Goolix':'https://pikmin.wiki.gallery/images/thumb/6/66/Goolix_icon.png/48px-Goolix_icon.png',
  'Honeywisp':'https://pikmin.wiki.gallery/images/thumb/5/5a/Honeywisp_P1_icon.png/36px-Honeywisp_P1_icon.png',
  'Iridescent Flint Beetle':'https://pikmin.wiki.gallery/images/thumb/8/80/Iridescent_Flint_Beetle_icon.png/36px-Iridescent_Flint_Beetle_icon.png',
  'Male Sheargrub':'https://pikmin.wiki.gallery/images/thumb/8/8d/Male_Sheargrub_icon.png/36px-Male_Sheargrub_icon.png',
  'Mamuta':'https://pikmin.wiki.gallery/images/thumb/3/3b/Mamuta_icon.png/36px-Mamuta_icon.png',
  'Mushroom Pikmin':'https://pikmin.wiki.gallery/images/thumb/4/4b/Mushroom_Pikmin_P1.png/300px-Mushroom_Pikmin_P1.png',
  'Pearly Clamclamp':'https://pikmin.wiki.gallery/images/thumb/8/83/Pearly_Clamclamp_icon.png/36px-Pearly_Clamclamp_icon.png',
  'Puffstool':'https://pikmin.wiki.gallery/images/thumb/6/65/Puffstool_icon.png/48px-Puffstool_icon.png',
  'Puffy Blowhog':'https://pikmin.wiki.gallery/images/thumb/0/0f/Puffy_Blowhog_icon.png/36px-Puffy_Blowhog_icon.png',
  'Shearwig':'https://pikmin.wiki.gallery/images/thumb/2/28/Shearwig_icon.png/36px-Shearwig_icon.png',
  'Smoky Progg':'https://pikmin.wiki.gallery/images/thumb/e/ef/Smoky_Progg_icon.png/48px-Smoky_Progg_icon.png',
  'Spotty Bulbear':'https://pikmin.wiki.gallery/images/thumb/c/c2/Spotty_Bulbear_icon.png/36px-Spotty_Bulbear_icon.png',
  'Swooping Snitchbug':'https://pikmin.wiki.gallery/images/thumb/5/5f/Swooping_Snitchbug_icon.png/36px-Swooping_Snitchbug_icon.png',
  'Water Dumple':'https://pikmin.wiki.gallery/images/thumb/8/84/Water_Dumple_icon.png/36px-Water_Dumple_icon.png',
  'Wolpole':'https://pikmin.wiki.gallery/images/thumb/8/87/Wolpole_icon.png/36px-Wolpole_icon.png',
  'Wollyhop':'https://pikmin.wiki.gallery/images/thumb/e/ea/Wollyhop_icon.png/36px-Wollyhop_icon.png',
  'Yellow Wollyhop':'https://pikmin.wiki.gallery/images/thumb/a/ac/Yellow_Wollyhop_icon.png/36px-Yellow_Wollyhop_icon.png',
  // ── PIKMIN 2 ──
  'Anode Beetle':'https://pikmin.wiki.gallery/images/thumb/9/9a/Anode_Beetle_icon.png/36px-Anode_Beetle_icon.png',
  'Anode Dweevil':'https://pikmin.wiki.gallery/images/thumb/7/70/Anode_Dweevil_icon.png/36px-Anode_Dweevil_icon.png',
  'Antenna Beetle':'https://pikmin.wiki.gallery/images/thumb/c/cb/Antenna_Beetle_icon.png/36px-Antenna_Beetle_icon.png',
  'Armored Cannon Larva':'https://pikmin.wiki.gallery/images/thumb/a/a4/Armored_Cannon_Larva_icon.png/36px-Armored_Cannon_Larva_icon.png',
  'Bulbmin':'https://pikmin.wiki.gallery/images/thumb/e/e1/Bulbmin_icon.png/36px-Bulbmin_icon.png',
  'Bulborb Larva':'https://pikmin.wiki.gallery/images/thumb/7/71/Bulborb_Larva_icon.png/36px-Bulborb_Larva_icon.png',
  'Bumbling Snitchbug':'https://pikmin.wiki.gallery/images/thumb/b/bf/Bumbling_Snitchbug_icon.png/36px-Bumbling_Snitchbug_icon.png',
  'Careening Dirigibug':'https://pikmin.wiki.gallery/images/thumb/a/a6/Careening_Dirigibug_icon.png/36px-Careening_Dirigibug_icon.png',
  'Cloaking Burrow-nit':'https://pikmin.wiki.gallery/images/thumb/d/d9/Cloaking_Burrow-nit_icon.png/36px-Cloaking_Burrow-nit_icon.png',
  'Creeping Chrysanthemum':'https://pikmin.wiki.gallery/images/thumb/9/94/Creeping_Chrysanthemum_icon.png/36px-Creeping_Chrysanthemum_icon.png',
  'Decorated Cannon Beetle':'https://pikmin.wiki.gallery/images/thumb/c/c0/Decorated_Cannon_Beetle_icon.png/36px-Decorated_Cannon_Beetle_icon.png',
  'Doodlebug':'https://pikmin.wiki.gallery/images/thumb/0/02/Doodlebug_icon.png/36px-Doodlebug_icon.png',
  'Dwarf Orange Bulborb':'https://pikmin.wiki.gallery/images/thumb/d/d7/Dwarf_Orange_Bulborb_icon.png/36px-Dwarf_Orange_Bulborb_icon.png',
  'Empress Bulblax':'https://pikmin.wiki.gallery/images/thumb/9/92/Empress_Bulblax_icon.png/48px-Empress_Bulblax_icon.png',
  'Fiery Bulblax':'https://pikmin.wiki.gallery/images/thumb/4/42/Fiery_Bulblax_icon.png/36px-Fiery_Bulblax_icon.png',
  'Fiery Dweevil':'https://pikmin.wiki.gallery/images/thumb/0/01/Fiery_Dweevil_icon.png/36px-Fiery_Dweevil_icon.png',
  'Gatling Groink':'https://pikmin.wiki.gallery/images/thumb/5/54/Gatling_Groink_icon.png/36px-Gatling_Groink_icon.png',
  'Giant Breadbug':'https://pikmin.wiki.gallery/images/thumb/2/2c/Giant_Breadbug_icon.png/48px-Giant_Breadbug_icon.png',
  'Greater Spotted Jellyfloat':'https://pikmin.wiki.gallery/images/thumb/5/50/Greater_Spotted_Jellyfloat_icon.png/36px-Greater_Spotted_Jellyfloat_icon.png',
  'Hairy Bulborb':'https://pikmin.wiki.gallery/images/thumb/a/a8/Hairy_Bulborb_icon.png/36px-Hairy_Bulborb_icon.png',
  'Hermit Crawmad':'https://pikmin.wiki.gallery/images/thumb/5/52/Hermit_Crawmad_icon.png/36px-Hermit_Crawmad_icon.png',
  'Hydro Dweevil':'https://pikmin.wiki.gallery/images/thumb/3/33/Hydro_Dweevil_icon.png/36px-Hydro_Dweevil_icon.png',
  'Iridescent Glint Beetle':'https://pikmin.wiki.gallery/images/thumb/3/3d/Iridescent_Glint_Beetle_icon.png/36px-Iridescent_Glint_Beetle_icon.png',
  'Lesser Spotted Jellyfloat':'https://pikmin.wiki.gallery/images/thumb/b/b8/Lesser_Spotted_Jellyfloat_icon.png/36px-Lesser_Spotted_Jellyfloat_icon.png',
  'Man-at-Legs':'https://pikmin.wiki.gallery/images/thumb/b/bc/Man-at-Legs_icon.png/48px-Man-at-Legs_icon.png',
  'Mitite':'https://pikmin.wiki.gallery/images/thumb/2/2b/Mitite_icon.png/36px-Mitite_icon.png',
  'Munge Dweevil':'https://pikmin.wiki.gallery/images/thumb/b/b6/Munge_Dweevil_icon.png/36px-Munge_Dweevil_icon.png',
  'Orange Bulborb':'https://pikmin.wiki.gallery/images/thumb/c/cb/Orange_Bulborb_icon.png/36px-Orange_Bulborb_icon.png',
  'Pileated Snagret':'https://pikmin.wiki.gallery/images/thumb/9/90/Pileated_Snagret_icon.png/48px-Pileated_Snagret_icon.png',
  'Raging Long Legs':'https://pikmin.wiki.gallery/images/thumb/7/7b/Raging_Long_Legs_icon.png/48px-Raging_Long_Legs_icon.png',
  'Ranging Bloyster':'https://pikmin.wiki.gallery/images/thumb/6/6b/Ranging_Bloyster_icon.png/48px-Ranging_Bloyster_icon.png',
  'Ravenous Whiskerpillar':'https://pikmin.wiki.gallery/images/thumb/4/45/Ravenous_Whiskerpillar_icon.png/36px-Ravenous_Whiskerpillar_icon.png',
  'Segmented Crawbster':'https://pikmin.wiki.gallery/images/thumb/a/a4/Segmented_Crawbster_icon.png/48px-Segmented_Crawbster_icon.png',
  'Skitter Leaf':'https://pikmin.wiki.gallery/images/thumb/b/b3/Skitter_Leaf_icon.png/36px-Skitter_Leaf_icon.png',
  'Snow Bulborb':'https://pikmin.wiki.gallery/images/thumb/8/8e/Snow_Bulborb_icon.png/36px-Snow_Bulborb_icon.png',
  'Titan Dweevil':'https://pikmin.wiki.gallery/images/thumb/4/44/Titan_Dweevil_icon.png/48px-Titan_Dweevil_icon.png',
  'Toady Bloyster':'https://pikmin.wiki.gallery/images/thumb/d/d9/Toady_Bloyster_icon.png/36px-Toady_Bloyster_icon.png',
  'Ujadani':'https://pikmin.wiki.gallery/images/thumb/6/68/Ujadani_icon.png/36px-Ujadani_icon.png',
  'Unmarked Spectralids':'https://pikmin.wiki.gallery/images/thumb/8/87/Unmarked_Spectralids_icon.png/36px-Unmarked_Spectralids_icon.png',
  'Volatile Dweevil':'https://pikmin.wiki.gallery/images/thumb/8/88/Volatile_Dweevil_icon.png/36px-Volatile_Dweevil_icon.png',
  'Waterwraith':'https://pikmin.wiki.gallery/images/thumb/c/c3/Waterwraith_icon.png/48px-Waterwraith_icon.png',
  'Watery Blowhog':'https://pikmin.wiki.gallery/images/thumb/4/4b/Watery_Blowhog_icon.png/36px-Watery_Blowhog_icon.png',
  'Withering Blowhog':'https://pikmin.wiki.gallery/images/thumb/1/10/Withering_Blowhog_icon.png/36px-Withering_Blowhog_icon.png',
  // ── PIKMIN 3 ──
  'Arachnode':'https://pikmin.wiki.gallery/images/thumb/5/55/Arachnode_icon.png/36px-Arachnode_icon.png',
  'Arctic Cannon Larva':'https://pikmin.wiki.gallery/images/thumb/6/6b/Arctic_Cannon_Larva_icon.png/36px-Arctic_Cannon_Larva_icon.png',
  'Armored Mawdad':'https://pikmin.wiki.gallery/images/thumb/3/30/Armored_Mawdad_icon.png/48px-Armored_Mawdad_icon.png',
  'Baldy Long Legs':'https://pikmin.wiki.gallery/images/thumb/a/ad/Baldy_Long_Legs_icon.png/48px-Baldy_Long_Legs_icon.png',
  'Bearded Amprat':'https://pikmin.wiki.gallery/images/thumb/9/91/Bearded_Amprat_icon.png/36px-Bearded_Amprat_icon.png',
  'Bug-Eyed Crawmad':'https://pikmin.wiki.gallery/images/thumb/d/df/Bug-Eyed_Crawmad_icon.png/48px-Bug-Eyed_Crawmad_icon.png',
  'Calcified Crushblat':'https://pikmin.wiki.gallery/images/thumb/1/1c/Calcified_Crushblat_icon.png/36px-Calcified_Crushblat_icon.png',
  'Desiccated Skitter Leaf':'https://pikmin.wiki.gallery/images/thumb/5/55/Desiccated_Skitter_Leaf_icon.png/36px-Desiccated_Skitter_Leaf_icon.png',
  'Flighty Joustmite':'https://pikmin.wiki.gallery/images/thumb/0/07/Flighty_Joustmite_icon.png/36px-Flighty_Joustmite_icon.png',
  'Joustmite':'https://pikmin.wiki.gallery/images/thumb/f/f8/Joustmite_icon.png/36px-Joustmite_icon.png',
  'Medusal Slurker':'https://pikmin.wiki.gallery/images/thumb/f/ff/Medusal_Slurker_icon.png/36px-Medusal_Slurker_icon.png',
  'Mysterious Life-Form':'https://pikmin.wiki.gallery/images/thumb/b/b8/Mysterious_Life-Form_icon.png/36px-Mysterious_Life-Form_icon.png',
  'Nectarous Dandelfly':'https://pikmin.wiki.gallery/images/thumb/d/d3/Nectarous_Dandelfly_icon.png/36px-Nectarous_Dandelfly_icon.png',
  'Peckish Aristocrab':'https://pikmin.wiki.gallery/images/thumb/c/c2/Peckish_Aristocrab_icon.png/36px-Peckish_Aristocrab_icon.png',
  'Phosbat':'https://pikmin.wiki.gallery/images/thumb/e/eb/Phosbat_icon.png/36px-Phosbat_icon.png',
  'Phosbat Pod':'https://pikmin.wiki.gallery/images/thumb/8/86/Phosbat_Pod_icon.png/36px-Phosbat_Pod_icon.png',
  'Plasm Wraith':'https://pikmin.wiki.gallery/images/thumb/9/97/Plasm_Wraith_icon.png/48px-Plasm_Wraith_icon.png',
  'Puckering Blinnow':'https://pikmin.wiki.gallery/images/thumb/1/14/Puckering_Blinnow_icon.png/36px-Puckering_Blinnow_icon.png',
  'Pyroclasmic Slooch':'https://pikmin.wiki.gallery/images/thumb/1/1c/Pyroclasmic_Slooch_icon.png/36px-Pyroclasmic_Slooch_icon.png',
  'Quaggled Mireclops':'https://pikmin.wiki.gallery/images/thumb/1/1c/Quaggled_Mireclops_icon.png/48px-Quaggled_Mireclops_icon.png',
  'Red Spectralids':'https://pikmin.wiki.gallery/images/thumb/d/d0/Red_Spectralids_icon.png/36px-Red_Spectralids_icon.png',
  'Sandbelching Meerslug':'https://pikmin.wiki.gallery/images/thumb/f/f9/Sandbelching_Meerslug_icon.png/48px-Sandbelching_Meerslug_icon.png',
  'Scornet':'https://pikmin.wiki.gallery/images/thumb/4/48/Scornet_icon.png/36px-Scornet_icon.png',
  'Scornet Maestro':'https://pikmin.wiki.gallery/images/thumb/e/eb/Scornet_Maestro_icon.png/48px-Scornet_Maestro_icon.png',
  'Shaggy Long Legs':'https://pikmin.wiki.gallery/images/thumb/0/0f/Shaggy_Long_Legs_icon.png/48px-Shaggy_Long_Legs_icon.png',
  'Skeeterskate':'https://pikmin.wiki.gallery/images/thumb/8/80/Skeeterskate_icon.png/36px-Skeeterskate_icon.png',
  'Skutterchuck':'https://pikmin.wiki.gallery/images/thumb/3/3f/Skutterchuck_icon.png/36px-Skutterchuck_icon.png',
  'Sputtlefish':'https://pikmin.wiki.gallery/images/thumb/1/1a/Sputtlefish_icon.png/36px-Sputtlefish_icon.png',
  'Swarming Sheargrub':'https://pikmin.wiki.gallery/images/thumb/6/65/Swarming_Sheargrub_icon.png/36px-Swarming_Sheargrub_icon.png',
  'Vehemoth Phosbat':'https://pikmin.wiki.gallery/images/thumb/4/42/Vehemoth_Phosbat_icon.png/48px-Vehemoth_Phosbat_icon.png',
  'Waddlepus':'https://pikmin.wiki.gallery/images/thumb/3/33/Waddlepus_icon.png/36px-Waddlepus_icon.png',
  'Whiptongue Bulborb':'https://pikmin.wiki.gallery/images/thumb/6/60/Whiptongue_Bulborb_icon.png/36px-Whiptongue_Bulborb_icon.png',
  'White Spectralids':'https://pikmin.wiki.gallery/images/thumb/e/eb/White_Spectralids_icon.png/36px-White_Spectralids_icon.png',
  'Yellow Spectralids':'https://pikmin.wiki.gallery/images/thumb/5/58/Yellow_Spectralids_icon.png/36px-Yellow_Spectralids_icon.png',
  // ── PIKMIN 4 ──
  'Albino Dwarf Bulborb':'https://pikmin.wiki.gallery/images/thumb/7/7a/Albino_Dwarf_Bulborb_P4_icon.png/36px-Albino_Dwarf_Bulborb_P4_icon.png',
  'Ancient Sirehound':'https://pikmin.wiki.gallery/images/thumb/0/00/Ancient_Sirehound_P4_icon.png/48px-Ancient_Sirehound_P4_icon.png',
  'Arctic Cannon Beetle':'https://pikmin.wiki.gallery/images/thumb/b/bb/Arctic_Cannon_Beetle_P4_icon.png/48px-Arctic_Cannon_Beetle_P4_icon.png',
  'Aristocrab Offspring':'https://pikmin.wiki.gallery/images/thumb/f/fb/Aristocrab_Offspring_P4_icon.png/36px-Aristocrab_Offspring_P4_icon.png',
  'Blizzarding Blowhog':'https://pikmin.wiki.gallery/images/thumb/c/ca/Blizzarding_Blowhog_P4_icon.png/48px-Blizzarding_Blowhog_P4_icon.png',
  'Bloomcap Bloyster':'https://pikmin.wiki.gallery/images/thumb/c/c2/Bloomcap_Bloyster_P4_icon.png/48px-Bloomcap_Bloyster_P4_icon.png',
  'Bogswallow':'https://pikmin.wiki.gallery/images/thumb/e/e7/Bogswallow_P4_icon.png/36px-Bogswallow_P4_icon.png',
  'Chillyhop':'https://pikmin.wiki.gallery/images/thumb/f/f4/Chillyhop_P4_icon.png/36px-Chillyhop_P4_icon.png',
  'Crusted Rumpup':'https://pikmin.wiki.gallery/images/thumb/7/74/Crusted_Rumpup_P4_icon.png/48px-Crusted_Rumpup_P4_icon.png',
  'Downy Snagret':'https://pikmin.wiki.gallery/images/thumb/d/d7/Downy_Snagret_P4_icon.png/36px-Downy_Snagret_P4_icon.png',
  'Dwarf Frosty Bulborb':'https://pikmin.wiki.gallery/images/thumb/e/eb/Dwarf_Frosty_Bulborb_P4_icon.png/36px-Dwarf_Frosty_Bulborb_P4_icon.png',
  'Foolix':'https://pikmin.wiki.gallery/images/thumb/e/e9/Foolix_P4_icon.png/48px-Foolix_P4_icon.png',
  'Freezecake':'https://pikmin.wiki.gallery/images/thumb/0/04/Freezecake_P4_icon.png/36px-Freezecake_P4_icon.png',
  'Frosty Bulborb':'https://pikmin.wiki.gallery/images/thumb/8/8d/Frosty_Bulborb_P4_icon.png/36px-Frosty_Bulborb_P4_icon.png',
  'Gildemander':'https://pikmin.wiki.gallery/images/thumb/6/67/Gildemander_P4_icon.png/48px-Gildemander_P4_icon.png',
  'Gildemandwee':'https://pikmin.wiki.gallery/images/thumb/a/a4/Gildemandwee_P4_icon.png/36px-Gildemandwee_P4_icon.png',
  'Groovy Long Legs':'https://pikmin.wiki.gallery/images/thumb/b/b1/Groovy_Long_Legs_P4_icon.png/48px-Groovy_Long_Legs_P4_icon.png',
  'Grubchucker':'https://pikmin.wiki.gallery/images/thumb/a/a0/Grubchucker_P4_icon.png/36px-Grubchucker_P4_icon.png',
  'Horned Cannon Beetle':'https://pikmin.wiki.gallery/images/thumb/c/c6/Horned_Cannon_Beetle_P4_icon.png/48px-Horned_Cannon_Beetle_P4_icon.png',
  'Iceblown Dweevil':'https://pikmin.wiki.gallery/images/thumb/4/46/Iceblown_Dweevil_P4_icon.png/36px-Iceblown_Dweevil_P4_icon.png',
  'Icy Blowhog':'https://pikmin.wiki.gallery/images/thumb/1/17/Icy_Blowhog_P4_icon.png/36px-Icy_Blowhog_P4_icon.png',
  'Jumbo Bulborb':'https://pikmin.wiki.gallery/images/thumb/2/2f/Jumbo_Bulborb_P4_icon.png/48px-Jumbo_Bulborb_P4_icon.png',
  'Mama Sheargrub':'https://pikmin.wiki.gallery/images/thumb/0/08/Mama_Sheargrub_P4_icon.png/36px-Mama_Sheargrub_P4_icon.png',
  'Mammoth Snootwhacker':'https://pikmin.wiki.gallery/images/thumb/d/d4/Mammoth_Snootwhacker_P4_icon.png/48px-Mammoth_Snootwhacker_P4_icon.png',
  'Masterhop':'https://pikmin.wiki.gallery/images/thumb/0/0c/Masterhop_P4_icon.png/48px-Masterhop_P4_icon.png',
  'Miniature Snootwhacker':'https://pikmin.wiki.gallery/images/thumb/2/26/Miniature_Snootwhacker_P4_icon.png/36px-Miniature_Snootwhacker_P4_icon.png',
  'Moldy Dwarf Bulborb':'https://pikmin.wiki.gallery/images/thumb/3/36/Moldy_Dwarf_Bulborb_P4_icon.png/36px-Moldy_Dwarf_Bulborb_P4_icon.png',
  'Moldy Slooch':'https://pikmin.wiki.gallery/images/thumb/a/ad/Moldy_Slooch_P4_icon.png/36px-Moldy_Slooch_P4_icon.png',
  'Moss':'https://pikmin.wiki.gallery/images/thumb/2/23/Moss_P4_icon.png/36px-Moss_P4_icon.png',
  'Muckerskate':'https://pikmin.wiki.gallery/images/thumb/9/9c/Muckerskate_P4_icon.png/36px-Muckerskate_P4_icon.png',
  'Porquillion':'https://pikmin.wiki.gallery/images/thumb/e/ea/Porquillion_P4_icon.png/48px-Porquillion_P4_icon.png',
  'Pricklepuff':'https://pikmin.wiki.gallery/images/thumb/3/34/Pricklepuff_P4_icon.png/36px-Pricklepuff_P4_icon.png',
  'Scorchcake':'https://pikmin.wiki.gallery/images/thumb/2/2d/Scorchcake_P4_icon.png/36px-Scorchcake_P4_icon.png',
  'Shearflea':'https://pikmin.wiki.gallery/images/thumb/0/0d/Shearflea_P4_icon.png/36px-Shearflea_P4_icon.png',
  'Shockcake':'https://pikmin.wiki.gallery/images/thumb/0/08/Shockcake_P4_icon.png/36px-Shockcake_P4_icon.png',
  'Snowy Blowhog':'https://pikmin.wiki.gallery/images/thumb/2/2c/Snowy_Blowhog_P4_icon.png/36px-Snowy_Blowhog_P4_icon.png',
  'Snowfake Fluttertail':'https://pikmin.wiki.gallery/images/thumb/a/a1/Snowfake_Fluttertail_P4_icon.png/48px-Snowfake_Fluttertail_P4_icon.png',
  'Sovereign Bulblax':'https://pikmin.wiki.gallery/images/thumb/8/8b/Sovereign_Bulblax_P4_icon.png/48px-Sovereign_Bulblax_P4_icon.png',
  'Startle Spore':'https://pikmin.wiki.gallery/images/thumb/8/80/Startle_Spore_P4_icon.png/36px-Startle_Spore_P4_icon.png',
  'Sunsquish':'https://pikmin.wiki.gallery/images/thumb/0/04/Sunsquish_P4_icon.png/36px-Sunsquish_P4_icon.png',
  'Titan Blowhog':'https://pikmin.wiki.gallery/images/thumb/e/e3/Titan_Blowhog_P4_icon.png/48px-Titan_Blowhog_P4_icon.png',
  'Toxstool':'https://pikmin.wiki.gallery/images/thumb/4/45/Toxstool_P4_icon.png/48px-Toxstool_P4_icon.png',
  'Tusked Blowhog':'https://pikmin.wiki.gallery/images/thumb/9/9e/Tusked_Blowhog_P4_icon.png/48px-Tusked_Blowhog_P4_icon.png',
  'Venom Dweevil':'https://pikmin.wiki.gallery/images/thumb/2/25/Venom_Dweevil_P4_icon.png/36px-Venom_Dweevil_P4_icon.png',
  'Waddlequaff':'https://pikmin.wiki.gallery/images/thumb/0/00/Waddlequaff_P4_icon.png/36px-Waddlequaff_P4_icon.png',
  // ── HEY! PIKMIN ──
  'Adult Centipare':'https://pikmin.wiki.gallery/images/thumb/4/40/Adult_Centipare_icon.png/36px-Adult_Centipare_icon.png',
  'Armurk':'https://pikmin.wiki.gallery/images/thumb/3/3c/Armurk_icon.png/36px-Armurk_icon.png',
  'Berserk Leech Hydroe':'https://pikmin.wiki.gallery/images/thumb/5/5b/Berserk_Leech_Hydroe_icon.png/36px-Berserk_Leech_Hydroe_icon.png',
  'Blubbug':'https://pikmin.wiki.gallery/images/thumb/f/f9/Blubbug_icon.png/36px-Blubbug_icon.png',
  'Centipare':'https://pikmin.wiki.gallery/images/thumb/b/b3/Centipare_icon.png/36px-Centipare_icon.png',
  'Clicking Slurker':'https://pikmin.wiki.gallery/images/thumb/2/25/Clicking_Slurker_icon.png/36px-Clicking_Slurker_icon.png',
  'Coppeller':'https://pikmin.wiki.gallery/images/thumb/e/eb/Coppeller_icon.png/36px-Coppeller_icon.png',
  'Crammed Wraith':'https://pikmin.wiki.gallery/images/thumb/d/dc/Crammed_Wraith_icon.png/36px-Crammed_Wraith_icon.png',
  'Crested Mockiwi':'https://pikmin.wiki.gallery/images/thumb/8/84/Crested_Mockiwi_icon.png/36px-Crested_Mockiwi_icon.png',
  'Crumbug':'https://pikmin.wiki.gallery/images/thumb/d/d1/Crumbug_icon.png/36px-Crumbug_icon.png',
  'Crystalline Crushblat':'https://pikmin.wiki.gallery/images/thumb/3/3d/Crystalline_Crushblat_icon.png/36px-Crystalline_Crushblat_icon.png',
  'Electric Cottonade':'https://pikmin.wiki.gallery/images/thumb/b/b2/Electric_Cottonade_icon.png/36px-Electric_Cottonade_icon.png',
  'Electric Spectralid':'https://pikmin.wiki.gallery/images/thumb/a/a9/Electric_Spectralid_icon.png/36px-Electric_Spectralid_icon.png',
  'Electripede':'https://pikmin.wiki.gallery/images/thumb/4/47/Electripede_icon.png/36px-Electripede_icon.png',
  'Elongated Crushblat':'https://pikmin.wiki.gallery/images/thumb/3/31/Elongated_Crushblat_icon.png/36px-Elongated_Crushblat_icon.png',
  'Eye-Stalker Bulbeel':'https://pikmin.wiki.gallery/images/thumb/2/2f/Eye-Stalker_Bulbeel_icon.png/36px-Eye-Stalker_Bulbeel_icon.png',
  'Fiery Blowlet':'https://pikmin.wiki.gallery/images/thumb/7/71/Fiery_Blowlet_icon.png/36px-Fiery_Blowlet_icon.png',
  'Fiery Dwarf Bulblax':'https://pikmin.wiki.gallery/images/thumb/4/45/Fiery_Dwarf_Bulblax_icon.png/36px-Fiery_Dwarf_Bulblax_icon.png',
  'Fiery Young Yellow Wollywog':'https://pikmin.wiki.gallery/images/thumb/f/f2/Fiery_Young_Yellow_Wollywog_icon.png/36px-Fiery_Young_Yellow_Wollywog_icon.png',
  'Fireflap Bulborb':'https://pikmin.wiki.gallery/images/thumb/1/18/Fireflap_Bulborb_icon.png/36px-Fireflap_Bulborb_icon.png',
  'Fireflinger Groink':'https://pikmin.wiki.gallery/images/thumb/9/9e/Fireflinger_Groink_icon.png/36px-Fireflinger_Groink_icon.png',
  'Firesnout Beetle':'https://pikmin.wiki.gallery/images/thumb/f/ff/Firesnout_Beetle_icon.png/36px-Firesnout_Beetle_icon.png',
  'Flatterchuck':'https://pikmin.wiki.gallery/images/thumb/9/98/Flatterchuck_icon.png/36px-Flatterchuck_icon.png',
  'Flying Spotted Jellyfloat':'https://pikmin.wiki.gallery/images/thumb/a/a6/Flying_Spotted_Jellyfloat_icon.png/36px-Flying_Spotted_Jellyfloat_icon.png',
  'Grabbit':'https://pikmin.wiki.gallery/images/thumb/6/6c/Grabbit_icon.png/36px-Grabbit_icon.png',
  'Large Splurchin':'https://pikmin.wiki.gallery/images/thumb/e/ec/Large_Splurchin_icon.png/36px-Large_Splurchin_icon.png',
  'Leech Hydroe':'https://pikmin.wiki.gallery/images/thumb/8/89/Leech_Hydroe_icon.png/36px-Leech_Hydroe_icon.png',
  'Long Water Dumple':'https://pikmin.wiki.gallery/images/thumb/b/b5/Long_Water_Dumple_icon.png/36px-Long_Water_Dumple_icon.png',
  'Luring Slurker':'https://pikmin.wiki.gallery/images/thumb/d/d3/Luring_Slurker_icon.png/36px-Luring_Slurker_icon.png',
  'Mockiwi':'https://pikmin.wiki.gallery/images/thumb/a/a1/Mockiwi_icon.png/36px-Mockiwi_icon.png',
  'Muggonfly':'https://pikmin.wiki.gallery/images/thumb/c/c2/Muggonfly_icon.png/36px-Muggonfly_icon.png',
  'Puffstalk':'https://pikmin.wiki.gallery/images/thumb/e/ef/Puffstalk_icon.png/36px-Puffstalk_icon.png',
  'Puffy Blubbug':'https://pikmin.wiki.gallery/images/thumb/2/27/Puffy_Blubbug_icon.png/36px-Puffy_Blubbug_icon.png',
  'Queen Shearwig':'https://pikmin.wiki.gallery/images/thumb/b/bf/Queen_Shearwig_icon.png/36px-Queen_Shearwig_icon.png',
  'Red Bubblimp':'https://pikmin.wiki.gallery/images/thumb/4/43/Red_Bubblimp_icon.png/36px-Red_Bubblimp_icon.png',
  'Seedbagger':'https://pikmin.wiki.gallery/images/thumb/a/a0/Seedbagger_icon.png/36px-Seedbagger_icon.png',
  'Shearblug':'https://pikmin.wiki.gallery/images/thumb/7/71/Shearblug_icon.png/36px-Shearblug_icon.png',
  'Shooting Spiner (Female)':'https://pikmin.wiki.gallery/images/thumb/1/10/Shooting_Spiner_%28Female%29_icon.png/36px-Shooting_Spiner_%28Female%29_icon.png',
  'Shooting Spiner (Male)':'https://pikmin.wiki.gallery/images/thumb/f/f8/Shooting_Spiner_%28Male%29_icon.png/36px-Shooting_Spiner_%28Male%29_icon.png',
  'Sparrowhead':'https://pikmin.wiki.gallery/images/thumb/4/44/Sparrowhead_icon.png/36px-Sparrowhead_icon.png',
  'Speargrub':'https://pikmin.wiki.gallery/images/thumb/7/71/Speargrub_icon.png/36px-Speargrub_icon.png',
  'Spiny Coppeller':'https://pikmin.wiki.gallery/images/thumb/1/12/Spiny_Coppeller_icon.png/36px-Spiny_Coppeller_icon.png',
  'Sporegrub':'https://pikmin.wiki.gallery/images/thumb/5/5c/Sporegrub_icon.png/36px-Sporegrub_icon.png',
  'Spornet':'https://pikmin.wiki.gallery/images/thumb/c/c5/Spornet_icon.png/36px-Spornet_icon.png',
  'Starnacle':'https://pikmin.wiki.gallery/images/thumb/f/fb/Starnacle_icon.png/36px-Starnacle_icon.png',
  'Stony Flint Beetle':'https://pikmin.wiki.gallery/images/thumb/8/83/Stony_Flint_Beetle_icon.png/36px-Stony_Flint_Beetle_icon.png',
  'Stuffed Bellbloom':'https://pikmin.wiki.gallery/images/thumb/c/ca/Stuffed_Bellbloom_icon.png/36px-Stuffed_Bellbloom_icon.png',
  'Widemouthed Anode Beetle':'https://pikmin.wiki.gallery/images/thumb/3/33/Widemouthed_Anode_Beetle_icon.png/36px-Widemouthed_Anode_Beetle_icon.png',
  'Young Yellow Wollywog':'https://pikmin.wiki.gallery/images/thumb/6/6d/Young_Yellow_Wollywog_icon.png/36px-Young_Yellow_Wollywog_icon.png',
};

function getIcon(name) { return iconMap[name] || ''; }

// ─────────────────────────────────────────────────────
//  LOUIE'S NOTES
// ─────────────────────────────────────────────────────
const louieNotes = {
  'Armored Cannon Beetle':'The carapace alone could serve as a soup tureen. The meat inside is remarkably tender — best slow-cooked overnight with cave mushrooms.',
  'Beady Long Legs':'Deceptively lean. The legs present a textural challenge, but when braised for six hours they fall clean from the joint. A creature this tall has a lot of reach — and a lot of flavor.',
  'Breadbug':'The name is not misleading. There is a subtle yeasty quality to the flesh that pairs naturally with butter and a light herbal crust. My grandmother would have loved these.',
  'Bulborb':'The quintessential PNF-404 protein. Abundant, well-marbled, and surprisingly versatile. Whatever you want to cook, this is where you start.',
  'Burrowing Snagret':'The long neck presents portioning challenges, but the beak-adjacent meat is extraordinary — a gamey richness I have found nowhere else in the cosmos. Slice thin, sear hot.',
  'Dwarf Bulbear':'Young, tender, and faintly smoky. Ideal roasted over an open flame.',
  'Dwarf Bulborb':'A miniature cut with concentrated flavor. Best prepared three or four at a time.',
  'Emperor Bulblax':'A creature of this magnitude demands respect at the table. Fourteen hours of preparation minimum. The tongue alone could feed a small crew. Worth every moment.',
  'Female Sheargrub':'Mild, clean, and delicate. Pan-seared with a squeeze of acidic juice is all it needs.',
  'Fiery Blowhog':'The natural internal heat keeps the meat perpetually warm — almost pre-cooked. The trick is removing that heat without losing the smokiness.',
  'Goolix':'A unique challenge. The gelatinous structure suggests cold preparations — set with mineral salts into a savory aspic that trembles magnificently on the plate.',
  'Honeywisp':'Technically edible, though very little of it is substantive. The nectar payload makes an outstanding glaze for other dishes.',
  'Iridescent Flint Beetle':'Crunchy on the outside, surprisingly rich within. The iridescent shell makes for a striking presentation if left on during roasting.',
  'Male Sheargrub':'The mandibles require removal before service, but the body is pleasantly firm. Best marinated overnight.',
  'Mamuta':'Dense and fibrous, but surprisingly sweet when prepared correctly. The flattening motion it uses on Pikmin is, ironically, an excellent tenderizing technique I have since adopted myself.',
  'Mushroom Pikmin':'I will not be providing notes on this one.',
  'Pearly Clamclamp':'The pearl is inedible — a fact I confirmed personally, to my dental misfortune. The interior flesh is extraordinary: briny, rich, and deeply oceanic.',
  'Puffstool':'I have been instructed by legal counsel not to discuss the spores. The cap itself is magnificent — earthy, complex, and unlike any fungus in the known universe.',
  'Puffy Blowhog':'The inflated body is mostly gas, so yield is lower than appearances suggest. What meat exists is pillowy-soft with a faint sweetness.',
  'Shearwig':'The wings make a surprisingly elegant crispy garnish when fried at high temperature.',
  'Smoky Progg':'Smoke-infused from birth. The preparation practically does itself. Handle with thick gloves.',
  'Spotty Bulbear':'Leaner and more aggressive in flavor than the standard Bulborb. The spots correspond to pockets of fat beneath the hide. Render those pockets first.',
  'Swooping Snitchbug':'Erratic behavior in life; consistent quality in the kitchen. The body is lean and takes a marinade beautifully.',
  'Water Dumple':'Aquatic and faintly briny with a firm white flesh. Poached is best. Simple is better.',
  'Wolpole':'Small, abundant, and best cooked by the dozen. A light fry in shallow oil with coarse salt is all the preparation required.',
  'Wollyhop':'The powerful haunches contain the most meat and the most flavor. With proper resting time, they become extraordinary.',
  'Yellow Wollyhop':'A slightly more acidic flavor profile than its standard counterpart. The yellow pigmentation suggests a different diet and the flesh confirms it.',
  'Anode Beetle':'The electrical charge dissipates within moments of defeat, leaving a faint mineral tingle in the meat that no spice has ever replicated.',
  'Anode Dweevil':'The Dweevil body plan offers more meat than the Beetle, distributed across the legs and thorax. Grill over high heat.',
  'Antenna Beetle':'The antennae, when dried, make a passable seasoning. The body itself is nutty and dense.',
  'Armored Cannon Larva':'The larval form is considerably easier to prepare than the adult. Softer shell, more tender flesh.',
  'Bulbmin':'I spent a long time staring at this one before I could bring myself to proceed. In the end: mild, slightly sweet, with an unusual fungal undertone.',
  'Bulborb Larva':'Extremely small and extremely numerous. Best treated as a supplementary ingredient — fried until crisp and scattered over a larger dish.',
  'Bumbling Snitchbug':'Similar to its Swooping cousin but with more body fat, which makes it better suited to slow roasting.',
  'Careening Dirigibug':'The balloon-like sacs release a gas with a mild numbing effect on the palate — useful as a natural anesthetic during bone removal.',
  'Cloaking Burrow-nit':'The camouflage mechanism leaves faint iridescent traces in the fat, which makes the rendered lard visually quite beautiful.',
  'Creeping Chrysanthemum':'Not a plant. The deception extends to the flavor — a distinctly floral bitterness that pairs well with rich braising liquids.',
  'Decorated Cannon Beetle':'Once the creature is still, the decorated carapace makes an excellent serving vessel.',
  'Doodlebug':'Rolls into a ball when threatened, which conveniently pre-shapes it for roasting whole.',
  'Dwarf Orange Bulborb':'Slightly more citrusy than the standard Dwarf — the orange coloration is not merely cosmetic.',
  'Empress Bulblax':'A richer, more complex flavor profile than the Emperor. The maternal physiology redirects resources into fat reserves that are extraordinary in the pan.',
  'Fiery Bulblax':'The heat is internal and persistent. Allow an extended resting period. The caramelization on the hide is already done for you.',
  'Fiery Dweevil':'The flavor profile runs toward char and smoke rather than mineral. An easier cooking proposition than the Anode variant.',
  'Gatling Groink':'The mechanical components are inedible. What remains underneath is surprisingly organic and meaty — almost boar-like.',
  'Giant Breadbug':'Everything the regular Breadbug offers, scaled to a grand occasion. This creature alone could anchor a proper banquet.',
  'Greater Spotted Jellyfloat':'The larger Jellyfloat variant has more mass and a deeper flavor. No heat above a gentle simmer or it collapses entirely.',
  'Hairy Bulborb':'The hair is technically edible but texturally inadvisable. Shear before cooking.',
  'Hermit Crawmad':'Remove the shell casing first. The creature within is a proper crustacean: sweet, dense, and spectacular when boiled with cave herbs.',
  'Hydro Dweevil':'The water-type Dweevil has a noticeably more delicate flavor, almost poached from within.',
  'Iridescent Glint Beetle':'The glinting shell produces a spectacular finish when lacquered and served whole.',
  'Lesser Spotted Jellyfloat':'Translucent and elegant. Set it gently in a cold broth and allow the natural luminescence to do the decorating.',
  'Man-at-Legs':'A dense, protein-rich torso with mechanical limbs that need to come off before anything else happens.',
  'Mitite':'They emerge in numbers large enough to constitute a full ingredient when combined. Toast in a dry pan. They pop like the world\'s smallest, most earnest popcorn.',
  'Munge Dweevil':'Produces a foul-smelling gas in life that vanishes entirely upon cooking. The resulting meat is mild and clean.',
  'Orange Bulborb':'A vibrant coloration that extends to a slightly more acidic flavor than the standard Bulborb.',
  'Pileated Snagret':'The exposed head and neck offer the greatest quantity of meat. The elaborate feather crest makes for an impressive garnish when dried.',
  'Raging Long Legs':'The enraged state creates lactic acid buildup in the muscle fibers. Allow it to calm before proceeding.',
  'Ranging Bloyster':'The eye-stalks make excellent handles during preparation. The body is gelatinous in parts and firm in others.',
  'Ravenous Whiskerpillar':'It eats constantly in life, which means the gut contents must be carefully cleared before cooking.',
  'Segmented Crawbster':'Each segment can be treated as a separate cut — seven distinct preparations from one creature.',
  'Skitter Leaf':'Not actually a leaf, though the disguise is impressive. The flesh is thin but intensely flavored.',
  'Snow Bulborb':'The cold-adapted fat has a high melt point, which means it bastes the meat during roasting naturally.',
  'Titan Dweevil':'The crown jewel of PNF-404 cuisine. Four distinct elemental flavor zones across its body. An entire tasting menu in a single creature. I wept, briefly, with gratitude.',
  'Toady Bloyster':'A smaller, more manageable version of the Ranging Bloyster. The flavor is similarly complex.',
  'Ujadani':'Tiny and easily overlooked. They cluster in groups large enough to constitute an ingredient. A light sauté with salt is the entire recipe.',
  'Unmarked Spectralids':'The body beneath the wings is small but surprisingly dense, with a faint sweetness.',
  'Volatile Dweevil':'I recommend stunning it at a considerable distance first. The explosive chemistry dissipates and what remains is actually quite mild.',
  'Watery Blowhog':'The flesh is cleaner and lighter with a distinct freshwater character. Steamed simply, it is one of the more elegant proteins on this planet.',
  'Withering Blowhog':'The deflating attack tenderizes the creature through muscular exertion. Almost no additional work required.',
  'Waterwraith':'Must be rendered physical before any preparation is possible. Once achieved, the texture is unlike anything I have encountered — extraordinarily silky.',
  'Arachnode':'The body is small but intensely nutty, like a roasted seed with ambitions.',
  'Arctic Cannon Larva':'The flesh has a crystalline quality when raw that transforms into a clean, bright flavor when cooked.',
  'Armored Mawdad':'The shell must be removed in sections. The meat beneath rivals the finest crustaceans available on any planet I have visited.',
  'Baldy Long Legs':'Without the hair of the Shaggy variety, the flavor is slightly more concentrated.',
  'Bearded Amprat':'Once safely inert, the amphibian flesh is rich and slightly nutty, with a persistent warmth.',
  'Bug-Eyed Crawmad':'The enormous eyes contribute nothing to the flavor. Remove them early. The body is excellent: firm, sweet, and structured.',
  'Calcified Crushblat':'Extraordinarily difficult to crack open. I have broken three implements attempting it. I will report back when I succeed.',
  'Desiccated Skitter Leaf':'The dried state concentrates the flavor considerably. Rehydrate before cooking, or crumble directly as a seasoning.',
  'Flighty Joustmite':'The flight muscles are leaner and more developed than the ground-based relative. Ideal for slicing thin.',
  'Joustmite':'Dense, structured meat with a mineral quality from its underground habits. Best treated like a firm game bird.',
  'Medusal Slurker':'Translucent, soft, and deceptively simple. Cold preparations or very gentle warming only.',
  'Mysterious Life-Form':'I recorded it in my notes as "the thing." Its form shifted three times during observation. I am choosing to treat it as a confit candidate and hope for consistency once heat is applied.',
  'Nectarous Dandelfly':'The nectar reserves make this creature self-glazing upon cooking — the sugars caramelize naturally and produce an extraordinary finish.',
  'Peckish Aristocrab':'Large claws, substantial body, sweet dense meat. A proper centrepiece crustacean.',
  'Phosbat':'The bioluminescent tissue is harmless and gives the finished dish a faint, appealing glow.',
  'Phosbat Pod':'The interior pulp is nutrient-dense and mildly sweet. Roast whole until the pod splits.',
  'Plasm Wraith':'A philosophical challenge as much as a culinary one. Where does one begin to season something that has no fixed form? I have ideas. I have also been collecting vessels.',
  'Puckering Blinnow':'Fry quickly — it rewards high heat and confidence.',
  'Pyroclasmic Slooch':'The flesh runs hot from the inside out. A brief resting period is mandatory. The smoky char that results needs no augmentation.',
  'Quaggled Mireclops':'Obtaining this creature requires patience. So does butchering it. So does cooking it. The results justify every minute of all of it.',
  'Red Spectralids':'The wings, dried and ground, make a crimson-tinted spice with a floral heat.',
  'Sandbelching Meerslug':'The sand-filter organ must be removed immediately. Once addressed, the body is a revelation — soft, yielding, and deeply flavored.',
  'Scornet':'The stinger must be removed. The rest is a crispy, protein-rich snack.',
  'Scornet Maestro':'Larger and with a more complex flavor than its subordinates — the cognitive load of leadership, apparently, produces excellent marbling.',
  'Shaggy Long Legs':'The shaggy exterior must be addressed before cooking. More legs means more braising opportunity.',
  'Skeeterskate':'Best eaten lakeside, immediately after preparation, for full effect.',
  'Skutterchuck':'The creature itself is dense and nutty. The rocks are not edible. I checked.',
  'Sputtlefish':'Inks when alarmed, which creates a built-in squid-ink sauce. I consider this generous of the creature, in retrospect.',
  'Swarming Sheargrub':'A flash-fry situation — high heat, brief time, coarse salt.',
  'Vehemoth Phosbat':'Where the small variety glows faintly, this one illuminates a room. The flavor scales up proportionally.',
  'Waddlepus':'Multiple arms mean multiple portions. A gift of anatomy to any serious cook.',
  'Whiptongue Bulborb':'The tongue mechanism is the most interesting component — a fast-twitch muscle unlike anything else on PNF-404. Slice it thin, cook it quickly.',
  'White Spectralids':'Nearly floral. I use the wings as a garnish and the body in a cold preparation where the subtlety can be appreciated.',
  'Yellow Spectralids':'The yellow pigmentation carries through to a mild honeyed quality in the flesh.',
  'Albino Dwarf Bulborb':'A pale, cave-adapted variant. The flesh is unusually white and delicate. Handle gently.',
  'Ancient Sirehound':'I have stared into this creature\'s eyes. It has stared back. We have reached an understanding. I am going to need a very large pot and at least two days.',
  'Arctic Cannon Beetle':'The internal cold storage keeps the meat remarkably fresh. No refrigeration required during transport. Extremely practical.',
  'Aristocrab Offspring':'Young, small, and impossibly tender. The juvenile carapace has not yet hardened.',
  'Blizzarding Blowhog':'The freeze-breath means the meat is essentially pre-chilled from the inside. Bring to temperature slowly.',
  'Bloomcap Bloyster':'The floral cap is edible and mildly sweet. The body is the usual Bloyster quality: gelatinous, complex, worth the effort.',
  'Bogswallow':'Gut-clearing is mandatory before proceeding. Once done, the flesh has a rich, murky depth.',
  'Chillyhop':'A cold-adapted hopper with the muscular haunches of the Wollyhop but a crisper, icier flavor profile.',
  'Crusted Rumpup':'The crusty exterior provides natural armor during roasting — a self-basting shell that keeps the interior moist.',
  'Downy Snagret':'A younger, downy-feathered Snagret with more tender flesh than the adult.',
  'Dwarf Frosty Bulborb':'Cook from frozen — do not allow it to thaw first, as the texture is noticeably better when the cold is cooked out gradually.',
  'Foolix':'Approach it as a cold preparation and allow the natural structure to set the dish.',
  'Freezecake':'The flesh has the consistency of a frozen dessert and a sweetness I cannot fully account for.',
  'Frosty Bulborb':'The fat is harder and more intensely flavored than warm-climate varieties. Render it slowly and use it as a cooking fat for everything else.',
  'Gildemander':'The flavor matches the golden appearance: rich, luxurious, and slightly sweet. A prestige ingredient.',
  'Gildemandwee':'Same golden quality as the adult but more delicate. Best served as a starter.',
  'Groovy Long Legs':'The rhythmic movement in life creates unusually even muscle development. Every cut is identical in texture, which simplifies portion control enormously.',
  'Grubchucker':'The creature itself and its grub ammunition are both edible. I consider the grubs a complimentary amuse-bouche delivered at high velocity.',
  'Horned Cannon Beetle':'The horn is inedible. Everything else is standard Cannon Beetle quality but larger.',
  'Iceblown Dweevil':'The frost within the body keeps the meat cold and fresh far longer than any other Dweevil variety.',
  'Icy Blowhog':'The opposite thermal profile from the Fiery Blowhog. The resulting flavor is remarkably clean and bright.',
  'Jumbo Bulborb':'Everything the standard Bulborb offers but substantially more of it. Feeds a large group with minimal portioning stress.',
  'Mama Sheargrub':'Larger than either variant, with a matronly density of flavor. Rich and full.',
  'Mammoth Snootwhacker':'The snoot must be addressed early in preparation. The body beyond it is enormous and yields generously.',
  'Masterhop':'The most accomplished hopper on PNF-404, which means the most developed musculature. A top-tier ingredient from a top-tier athlete.',
  'Miniature Snootwhacker':'A smaller, more manageable version. The compact size means quicker cooking times.',
  'Moldy Dwarf Bulborb':'The mold must be removed before cooking — this is non-negotiable. Beneath it the flesh carries a faint umami depth from the fungal contact.',
  'Moldy Slooch':'I treat the mold as a crust to be rendered in the pan and the body as the prize beneath.',
  'Moss':'The moss covering makes an excellent herb substitute when dried and ground. The creature beneath is minimal.',
  'Muckerskate':'Lives in mud, which means thorough washing is step one. Quick-cook only — it toughens fast.',
  'Porquillion':'The quills must come off first. This is not a request. The body is extraordinary — pork-like in fat distribution.',
  'Pricklepuff':'The spines are inedible but provide a natural rack to rest the creature on during roasting.',
  'Scorchcake':'The flesh has a warm, toasted quality from within — not unlike a properly made sponge, if a sponge were full of protein.',
  'Shearflea':'Harvested by the handful. A flash-fry produces a crispy, protein-rich ingredient.',
  'Shockcake':'Once properly neutralized, the flesh carries a faint tingle and a clean mineral quality I find addictive.',
  'Snowy Blowhog':'Defrost overnight in a cool environment and cook from cold for best results.',
  'Snowfake Fluttertail':'The flesh is light, almost airy, with a delicate cold sweetness unlike anything else.',
  'Sovereign Bulblax':'The most kingly of the Bulblax family. Pairs magnificently with a Honeywart reduction.',
  'Startle Spore':'Dry the spores, grind them, and use them as a seasoning that produces a brief but pleasant visual reaction in the dish.',
  'Sunsquish':'Round, warm, and full of something that glows faintly from within. I ate one for breakfast once. I have not done it since but I think about it.',
  'Titan Blowhog':'It contains enough heat to cook itself, theoretically, if one is patient and well-insulated.',
  'Toxstool':'The spores are toxic and must be entirely contained during harvest. I developed a technique involving a sealed container and extreme speed.',
  'Tusked Blowhog':'The tusks are excellent for skewering other ingredients, which I appreciate in a creature that is also itself an ingredient.',
  'Venom Dweevil':'The venom sacs must be located and removed before any cutting begins. I have checked this multiple times.',
  'Waddlequaff':'A solid, dependable ingredient. The waddling builds excellent leg muscle.',
  'Adult Centipare':'Each segment is a small, self-contained cut. A patient cook can turn one into a full dinner party course.',
  'Armurk':'Heavily armored and deeply reluctant to be caught. The armor serves as an excellent roasting vessel.',
  'Berserk Leech Hydroe':'Allow it to rest long after harvest. Patience converts the bitterness to complexity.',
  'Blubbug':'The blubber-like exterior renders down into a fat of extraordinary richness.',
  'Centipare':'The creature is essentially a self-portioning delivery mechanism. Separate and season each segment differently.',
  'Clicking Slurker':'The jaw muscles are the most flavorful part. Take them first.',
  'Coppeller':'The body beneath is dense and slightly metallic-tasting. Remove the propeller before eating.',
  'Crammed Wraith':'Richly marbled and almost self-basted. A happy accident of biology.',
  'Crested Mockiwi':'The bird-like body is where the meal is. Slightly gamier than the standard Mockiwi.',
  'Crumbug':'Small and crunchy throughout. Fry whole and scatter generously.',
  'Crystalline Crushblat':'Beneath the crystalline exterior the flesh is soft, cold, and almost mineral in flavor.',
  'Electric Cottonade':'The body is mild and soft once the dangerous exterior is safely removed.',
  'Electric Spectralid':'The charged wings make an excellent natural cooking surface. The body cooks itself, essentially.',
  'Electripede':'Self-portioning and self-seasoning with the mineral tingle. Efficient.',
  'Elongated Crushblat':'More usable cuts, easier to portion, and the flavor runs consistently throughout.',
  'Eye-Stalker Bulbeel':'The eye-stalks are the most interesting cut — a concentrated, gelatinous piece unlike anything from the main body.',
  'Fiery Blowlet':'The youth makes the flesh more yielding. A more refined version of the parent.',
  'Fiery Dwarf Bulblax':'The thermal concentration in a smaller body produces an intense flavor in a manageable portion.',
  'Fiery Young Yellow Wollywog':'The combination of youth, fire, and the muscular development of the Wollyhop line creates something genuinely exceptional.',
  'Fireflap Bulborb':'The creature essentially bastes itself. I have never been more grateful for a creature\'s defense mechanism.',
  'Fireflinger Groink':'The fire-adjacent diet creates an internal smokiness the standard Groink entirely lacks.',
  'Firesnout Beetle':'The body is similar to the standard Flint Beetle but warmer and smokier.',
  'Flatterchuck':'The creature itself is round and dense, which compensates for the inconvenience of the projectile debris.',
  'Flying Spotted Jellyfloat':'The body must support itself against gravity, which translates to better texture.',
  'Grabbit':'Disproportionately excellent meat in the front limbs. Take those first.',
  'Large Splurchin':'The soft interior is pale, briny, and rich. Like a sea urchin that decided to get larger.',
  'Leech Hydroe':'The flesh is dense and rich from a diet of absorbed nutrients. Pre-seasoned by its own lifestyle, in a sense.',
  'Long Water Dumple':'More of a good thing — the elongated variant offers more portionable cuts.',
  'Luring Slurker':'The lure is the most flavorful part. The irony is not lost on me.',
  'Mockiwi':'Dense, dark, and gamey in the best sense — a proper game-bird quality entirely earned by its terrestrial lifestyle.',
  'Muggonfly':'The flight muscles are developed out of proportion to the body size. Those muscles alone constitute a worthwhile ingredient.',
  'Puffstalk':'The cap puffs dramatically in heat, which is visually entertaining.',
  'Puffy Blubbug':'The inflated form contains more fat relative to the standard Blubbug. Good results either way.',
  'Queen Shearwig':'The wings are substantial enough to fry as a main component rather than merely a garnish. A proper regal portion.',
  'Red Bubblimp':'A self-opening package. I admire the efficiency.',
  'Seedbagger':'The creature and its contents constitute two separate ingredients in one collection.',
  'Shearblug':'Plumper and more substantial than the Sheargrub. Better yield per capture.',
  'Shooting Spiner (Female)':'The female has a more developed body with proportionally more meat.',
  'Shooting Spiner (Male)':'The challenge of catching it means the exercise has already done the tenderizing. An athletic ingredient.',
  'Sparrowhead':'The jaw muscles of any creature are always worth attention.',
  'Speargrub':'The grub body is soft, mild, and cooperative. A forgiving ingredient.',
  'Spiny Coppeller':'The risk scales with the reward on this one.',
  'Sporegrub':'The grub body is mild and clean, with none of the complexity one might expect.',
  'Spornet':'The spore payload is the primary hazard and the primary seasoning opportunity once dried.',
  'Starnacle':'Barnacle-adjacent in form and flavor — a fixed creature with a briny, oceanic quality.',
  'Stony Flint Beetle':'What is inside is dense and good.',
  'Stuffed Bellbloom':'The creature almost writes the recipe itself. Remove, season, and stuff it back.',
  'Widemouthed Anode Beetle':'The wider jaw creates larger jaw muscles. Handle dry throughout.',
  'Young Yellow Wollywog':'A seasonal ingredient at its best — the youth means more tender flesh and a brighter, fresher flavor.',
};

function getNote(name) {
  return louieNotes[name] || 'A fascinating specimen. Louie is still formulating the optimal preparation approach. Notes pending next field expedition.';
}

// ─────────────────────────────────────────────────────
//  SERVINGS MAP
// ─────────────────────────────────────────────────────
const servingsMap = {
  'Mitite':1,'Wolpole':1,'Female Sheargrub':1,'Male Sheargrub':1,'Shearwig':1,
  'Shearflea':1,'Ujadani':1,'Doodlebug':1,'Crumbug':1,'Speargrub':1,
  'Sporegrub':1,'Red Spectralids':1,'White Spectralids':1,'Yellow Spectralids':1,
  'Unmarked Spectralids':1,'Electric Spectralid':1,'Ravenous Whiskerpillar':1,
  'Phosbat':1,'Honeywisp':1,'Aristocrab Offspring':1,'Gildemandwee':1,
  'Startle Spore':1,'Moss':1,'Blubbug':1,'Centipare':1,'Muggonfly':1,
  'Red Bubblimp':1,'Spornet':1,'Fiery Blowlet':1,'Scornet':1,
  'Breadbug':2,'Dwarf Bulborb':2,'Dwarf Bulbear':2,'Dwarf Orange Bulborb':2,
  'Dwarf Frosty Bulborb':2,'Albino Dwarf Bulborb':2,'Moldy Dwarf Bulborb':2,
  'Anode Beetle':2,'Antenna Beetle':2,'Iridescent Flint Beetle':2,
  'Iridescent Glint Beetle':2,'Stony Flint Beetle':2,'Widemouthed Anode Beetle':2,
  'Firesnout Beetle':2,'Water Dumple':2,'Long Water Dumple':2,'Wollyhop':2,
  'Yellow Wollyhop':2,'Chillyhop':2,'Masterhop':2,'Skeeterskate':2,'Muckerskate':2,
  'Puckering Blinnow':2,'Arachnode':2,'Bulbmin':2,'Snow Bulborb':2,
  'Hairy Bulborb':2,'Orange Bulborb':2,'Frosty Bulborb':2,'Whiptongue Bulborb':2,
  'Fiery Dwarf Bulblax':2,'Nectarous Dandelfly':2,'Phosbat Pod':2,
  'Flighty Joustmite':2,'Joustmite':2,'Bearded Amprat':2,'Medusal Slurker':2,
  'Pyroclasmic Slooch':2,'Moldy Slooch':2,'Skutterchuck':2,'Flatterchuck':2,
  'Grabbit':2,'Mockiwi':2,'Crested Mockiwi':2,'Spiny Coppeller':2,'Coppeller':2,
  'Puffstalk':2,'Shearblug':2,'Sparrowhead':2,'Starnacle':2,'Freezecake':2,
  'Scorchcake':2,'Shockcake':2,'Sunsquish':2,'Pricklepuff':2,'Grubchucker':2,
  'Young Yellow Wollywog':2,'Fiery Young Yellow Wollywog':2,'Stuffed Bellbloom':2,
  'Seedbagger':2,'Sputtlefish':2,'Adult Centipare':2,'Electripede':2,
  'Leech Hydroe':2,'Luring Slurker':2,'Clicking Slurker':2,'Volatile Dweevil':2,
  'Munge Dweevil':2,'Hydro Dweevil':2,'Anode Dweevil':2,'Fiery Dweevil':2,
  'Iceblown Dweevil':2,'Venom Dweevil':2,'Armored Cannon Larva':2,
  'Arctic Cannon Larva':2,'Bumbling Snitchbug':2,'Careening Dirigibug':2,
  'Shooting Spiner (Female)':2,'Shooting Spiner (Male)':2,'Puffy Blubbug':2,
  'Electric Cottonade':2,'Elongated Crushblat':2,'Crystalline Crushblat':2,
  'Calcified Crushblat':2,'Fireflap Bulborb':2,'Wolpole':2,
  'Bulborb':4,'Fiery Blowhog':4,'Puffy Blowhog':4,'Watery Blowhog':4,
  'Withering Blowhog':4,'Snowy Blowhog':4,'Icy Blowhog':4,'Blizzarding Blowhog':4,
  'Tusked Blowhog':4,'Spotty Bulbear':4,'Swooping Snitchbug':4,'Pearly Clamclamp':4,
  'Mushroom Pikmin':4,'Creeping Chrysanthemum':4,'Toady Bloyster':4,
  'Bloomcap Bloyster':4,'Bogswallow':4,'Downy Snagret':4,'Gatling Groink':4,
  'Fireflinger Groink':4,'Waddlepus':4,'Waddlequaff':4,'Skitter Leaf':4,
  'Hermit Crawmad':4,'Peckish Aristocrab':4,'Lesser Spotted Jellyfloat':4,
  'Cloaking Burrow-nit':4,'Decorated Cannon Beetle':4,'Armored Cannon Beetle':4,
  'Arctic Cannon Beetle':4,'Horned Cannon Beetle':4,'Mama Sheargrub':4,
  'Swarming Sheargrub':4,'Queen Shearwig':4,'Crammed Wraith':4,
  'Eye-Stalker Bulbeel':4,'Puffstool':4,'Toxstool':4,'Fiery Bulblax':4,
  'Mysterious Life-Form':4,'Desiccated Skitter Leaf':4,'Red Bubblimp':4,
  'Large Splurchin':4,'Muggonfly':4,'Bulborb Larva':4,
  'Jumbo Bulborb':6,'Sovereign Bulblax':6,'Burrowing Snagret':6,
  'Pileated Snagret':6,'Armored Mawdad':6,'Vehemoth Phosbat':6,
  'Sandbelching Meerslug':6,'Shaggy Long Legs':6,'Baldy Long Legs':6,
  'Beady Long Legs':6,'Groovy Long Legs':6,'Raging Long Legs':6,
  'Ranging Bloyster':6,'Waterwraith':6,'Segmented Crawbster':6,
  'Bug-Eyed Crawmad':6,'Greater Spotted Jellyfloat':6,'Plasm Wraith':6,
  'Scornet Maestro':6,'Gildemander':6,'Snowfake Fluttertail':6,'Foolix':6,
  'Man-at-Legs':6,'Mamuta':6,'Goolix':6,'Smoky Progg':6,'Porquillion':6,
  'Titan Blowhog':6,'Mammoth Snootwhacker':6,'Miniature Snootwhacker':6,
  'Armurk':6,'Berserk Leech Hydroe':6,'Crusted Rumpup':6,
  'Flying Spotted Jellyfloat':6,'Quaggled Mireclops':6,
  'Emperor Bulblax':12,'Empress Bulblax':14,'Giant Breadbug':12,
  'Titan Dweevil':20,'Ancient Sirehound':18,
};

function getServings(name, isBoss) {
  const n = servingsMap[name];
  if (n === 1)  return 'Serves 1–2';
  if (n === 2)  return 'Serves 2–4';
  if (n === 4)  return 'Serves 4–6';
  if (n === 6)  return 'Serves 6–10';
  if (n === 12) return 'Serves 10–14';
  if (n === 14) return 'Serves 12–18';
  if (n === 18) return 'Serves 16–22';
  if (n === 20) return 'Serves 18–26';
  return isBoss ? 'Serves 8–14' : 'Serves 2–4';
}

// ─────────────────────────────────────────────────────
//  MODAL
// ─────────────────────────────────────────────────────
// recipeData is populated by individual recipe-XX.js files on the recipes page
window.recipeData = window.recipeData || {};

function openModal(name, isBoss, game, iconSrc) {
  const modal   = document.getElementById('modal');
  const overlay = document.getElementById('modalOverlay');
  if (!modal || !overlay) return;

  modal.className = 'modal' + (isBoss ? ' boss-modal' : '');
  document.getElementById('modalName').textContent = name;
  const iconEl = document.getElementById('modalIcon');
  iconEl.src = iconSrc || '';
  iconEl.style.display = iconSrc ? '' : 'none';

  const badges = document.getElementById('modalBadges');
  const meats  = getMeat(name);
  badges.innerHTML = `<span class="modal-game-badge">${game}</span>
    ${meats.map(m => `<span class="meat-tag ${m}" style="margin-left:0.5rem;">${MEAT_LABELS[m]}</span>`).join('')}`;
  if (isBoss) badges.innerHTML += `<span class="modal-boss-badge" style="margin-left:0.5rem;">★ Boss</span>`;

  document.getElementById('modalMeta').innerHTML = `
    <span class="meta-tag">🍽 ${getServings(name, isBoss)}</span>
    <span class="meta-tag">🌍 ${game}</span>
    ${meats.map(m => `<span class="meta-tag meat-tag ${m}">${MEAT_LABELS[m]}</span>`).join('')}
  `;

  // Recipe content from external data file
  const recipeEl = document.getElementById('modalRecipe');
  const recipe = window.recipeData[name];
  if (recipeEl) {
    if (recipe) {
      recipeEl.innerHTML = recipe;
      recipeEl.style.display = '';
      document.getElementById('modalComingSoon').style.display = 'none';
    } else {
      recipeEl.style.display = 'none';
      document.getElementById('modalComingSoon').style.display = '';
    }
  }

  document.getElementById('modalNoteText').textContent = getNote(name);
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModalDirect() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function closeModal(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModalDirect();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModalDirect(); });
