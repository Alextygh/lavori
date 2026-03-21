/* ══════════════════════════════════════════════════════
   recipes-p1.js — Recipe data for Pikmin 1 enemies
   ══════════════════════════════════════════════════════

   HOW TO USE THIS FILE
   ─────────────────────
   Each entry in window.recipeData maps an enemy name (exactly as it appears
   on the site) to an HTML string that will be injected into the recipe modal.

   Use the template below for every enemy. The HTML supports:
     <h3>Section Title</h3>
     <p>Paragraph text</p>
     <ul><li>Bullet item</li></ul>
     <ol><li>Numbered step</li></ol>

   The "Louie's Note" quote block is added automatically from main.js —
   you do NOT need to include it here.

   Duplicate this file for each game:
     recipes-p2.js  → Pikmin 2 unique enemies
     recipes-p3.js  → Pikmin 3 unique enemies
     recipes-p4.js  → Pikmin 4 unique enemies
     recipes-hp.js  → Hey! Pikmin unique enemies

   All files must be loaded in recipes.html via <script> tags.
   ══════════════════════════════════════════════════════ */

window.recipeData = window.recipeData || {};

Object.assign(window.recipeData, {

  /* ─── TEMPLATE ────────────────────────────────────────
  'Enemy Name Here': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>1 whole [Enemy], cleaned and dressed</li>
        <li>...</li>
      </ul>

      <h3>Preparation</h3>
      <p>...</p>

      <h3>Method</h3>
      <ol>
        <li>...</li>
        <li>...</li>
      </ol>

      <h3>To Serve</h3>
      <p>...</p>
    </div>
  `,
  ─────────────────────────────────────────────────── */

  /* ─── EXAMPLE ENTRY (Bulborb) ─── */
  'Bulborb': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>1 whole Spotty Bulborb (approx. 18–22 kg dressed weight)</li>
        <li>4 tbsp rendered cave-root fat or unsalted butter</li>
        <li>2 heads of wild garlic, crushed</li>
        <li>1 bundle dried bog herbs (rosemary, thyme, or local equivalent)</li>
        <li>Coarse mineral salt and cracked black pepper</li>
        <li>500 ml cave-spring water or light stock</li>
        <li>2 tbsp fermented berry reduction (for basting)</li>
      </ul>

      <h3>Preparation</h3>
      <p>Remove the hide carefully along the dorsal seam — the spotted pattern is tough and will not render down pleasantly. Reserve the subcutaneous fat layer separately; it is excellent for basting. Portion the haunches, shoulders, and loin into manageable roasting sections. Score the surface of each piece deeply and rub with salt, pepper, and the crushed garlic.</p>
      <p>Allow to rest uncovered in a cool, dry environment for a minimum of four hours. Twelve is better. Overnight is ideal.</p>

      <h3>Method</h3>
      <ol>
        <li>Bring the roasting surface to high heat. Sear each section in the reserved fat until deeply browned on all sides — approximately 4 minutes per face.</li>
        <li>Transfer to a covered vessel with the cave-spring water and bog herbs. Reduce heat to low.</li>
        <li>Braise for 3–4 hours, basting with the fermented berry reduction every 45 minutes.</li>
        <li>Remove the lid for the final 30 minutes to allow the surface to caramelise.</li>
        <li>Rest for at least 20 minutes before carving.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Carve against the grain and arrange on a serving board. Deglaze the braising vessel with a splash of water and reduce the resulting liquid by half for a simple pan sauce. Serves 4–6 comfortably, with accompaniments.</p>
    </div>
  `,

  /* ─── ADD YOUR RECIPES BELOW ───────────────────────
     Copy the template above, replace 'Enemy Name Here'
     with the exact name, and fill in the details.
  ─────────────────────────────────────────────────── */

  'Armored Cannon Beetle': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>1 Armored Cannon Beetle, carapace sections removed and reserved</li>
        <li>3 tbsp cave-root fat or lard</li>
        <li>4 cloves wild garlic, minced</li>
        <li>1 sprig dried bog thyme</li>
        <li>Coarse mineral salt and black pepper</li>
        <li>300 ml cave-spring water</li>
        <li>2 tbsp bitter root reduction (for deglazing)</li>
      </ul>

      <h3>Preparation</h3>
      <p>The carapace must be removed methodically. Work a sturdy implement along the seam between the dorsal plate and the underbelly, prying each section free. Reserve the largest carapace plates — they make exceptional serving vessels and retain heat remarkably well. The exposed meat beneath is pale and densely fibrous. Cut into portions along the natural muscle groupings: the thorax yields the largest single cuts, while the leg joints offer smaller, more intensely flavoured pieces.</p>
      <p>Season generously with salt and pepper. Allow to rest for two hours before cooking — the meat is dense and benefits from time.</p>

      <h3>Method</h3>
      <ol>
        <li>Heat the cave-root fat in a heavy pan over high heat until it begins to smoke.</li>
        <li>Sear each portion hard for 3–4 minutes per side until a deep crust forms. Do not rush this step.</li>
        <li>Reduce heat to low. Add the garlic and thyme directly to the pan and cook for one minute.</li>
        <li>Add the cave-spring water, cover, and braise slowly for 2.5 hours.</li>
        <li>Uncover and deglaze with the bitter root reduction. Raise heat briefly to reduce the liquid to a thick, glossy sauce.</li>
        <li>Rest the meat for 15 minutes before serving.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Arrange the portions inside the reserved carapace sections for presentation. Spoon the reduced pan sauce over each piece. The carapace retains heat well, keeping the meat warm throughout a long meal. Serves 4.</p>
    </div>
  `,

  'Beady Long Legs': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>1 Beady Long Legs, legs separated from the central body sac</li>
        <li>6 tbsp unsalted butter, divided</li>
        <li>1 head wild garlic, halved</li>
        <li>2 sprigs bog rosemary</li>
        <li>Coarse mineral salt and white pepper</li>
        <li>400 ml cave-spring water</li>
        <li>1 tbsp fermented berry reduction</li>
        <li>Handful of foraged cave herbs, for finishing</li>
      </ul>

      <h3>Preparation</h3>
      <p>The legs are the primary cut. Detach each leg at the joint closest to the body sac using a firm downward snap — they come free cleanly if the creature has been properly stilled. Each leg should be treated as an individual portion: score the outer surface at 2 cm intervals to allow the braising liquid to penetrate the surprisingly thick cuticle. The central body sac contains a small amount of softer meat and is best reserved for a separate preparation such as a broth or terrine.</p>
      <p>Season the legs and allow to rest for at least one hour.</p>

      <h3>Method</h3>
      <ol>
        <li>Melt 3 tbsp butter in a wide, deep pan over medium-high heat. Add the legs in batches, browning thoroughly on all sides — approximately 5 minutes per batch.</li>
        <li>Transfer all legs back to the pan. Add the garlic halves cut-side down, the rosemary, and the cave-spring water.</li>
        <li>Cover tightly and braise over very low heat for 6 hours. The meat should be falling from the cuticle when done.</li>
        <li>Remove the legs carefully. Strain the braising liquid and reduce by two thirds over high heat.</li>
        <li>Finish the sauce with the remaining 3 tbsp butter and the fermented berry reduction, whisking until glossy.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Arrange two legs per plate. Spoon the sauce generously over and around. Scatter foraged cave herbs to finish. The meat pulls cleanly from the cuticle with minimal effort after the long braise. Serves 8.</p>
    </div>
  `,

  'Breadbug': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>3–4 Breadbugs, cleaned</li>
        <li>60 g unsalted butter</li>
        <li>2 cloves wild garlic, thinly sliced</li>
        <li>1 tsp coarse mineral salt</li>
        <li>½ tsp dried bog thyme</li>
        <li>1 tbsp cave-spring honey or nectar glaze</li>
        <li>Crusty foraged flatbread, to serve</li>
      </ul>

      <h3>Preparation</h3>
      <p>The Breadbug requires minimal preparation — its shell is soft enough that it need not be removed before cooking, though many prefer to split the creature lengthways and cook it open-faced. The flesh inside carries a distinctly yeasty, almost bready quality that intensifies with gentle heat. Do not overcook. Split the creatures and season the exposed flesh with salt and thyme.</p>

      <h3>Method</h3>
      <ol>
        <li>Melt the butter in a pan over medium heat until foaming. Add the sliced garlic and cook for 30 seconds.</li>
        <li>Place the Breadbugs flesh-side down in the pan. Cook for 3 minutes until the cut surface is golden and beginning to caramelise.</li>
        <li>Flip and cook for a further 2 minutes on the shell side.</li>
        <li>Drizzle with honey or nectar glaze, cover the pan, and allow to steam for 1 minute off the heat.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Serve immediately on warm flatbread. The pan butter and honey make a natural sauce — pour it directly over the creatures. The yeasty flesh and the bread beneath create a pleasant, unified flavour that my grandmother would have recognised immediately. Serves 1–2.</p>
    </div>
  `,

  'Burrowing Snagret': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>1 Burrowing Snagret, beak removed, neck and body cleaned</li>
        <li>5 tbsp cave-root fat</li>
        <li>1 whole head wild garlic, cloves separated</li>
        <li>3 sprigs bog rosemary</li>
        <li>2 bay leaves (local equivalent)</li>
        <li>Coarse mineral salt and cracked black pepper</li>
        <li>600 ml cave-spring water</li>
        <li>3 tbsp fermented berry reduction</li>
        <li>1 tbsp bitter root paste</li>
      </ul>

      <h3>Preparation</h3>
      <p>The Burrowing Snagret presents a unique portioning challenge due to the extreme length of its neck. After removing the beak — which is inedible but an excellent skewering implement — divide the neck into 15 cm sections. Each section is a self-contained cut of lean, dense, gamey meat with a pronounced richness near the skull. The body cavity is small but yields a soft, fattier meat that cooks faster than the neck sections and should be treated separately.</p>
      <p>Rub each neck section thoroughly with salt, pepper, and a smear of bitter root paste. Rest overnight if possible — a minimum of four hours is required to allow the seasoning to penetrate the dense muscle.</p>

      <h3>Method</h3>
      <ol>
        <li>Heat the cave-root fat in a large, deep vessel over very high heat. Sear the neck sections hard in batches — 4 minutes per side — until deeply browned. Set aside.</li>
        <li>In the same vessel, cook the garlic cloves whole until golden, about 2 minutes.</li>
        <li>Return all the meat to the vessel. Add rosemary, bay, and cave-spring water. The liquid should come halfway up the meat.</li>
        <li>Cover and cook over the lowest possible heat for 5 hours.</li>
        <li>Add the body cavity portions in the final 90 minutes — they require less time.</li>
        <li>Remove all meat and strain the cooking liquid. Reduce the liquid by half, then stir in the fermented berry reduction.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Arrange the neck sections standing upright on a wide platter — they hold their shape impressively after the long braise. Place the body meat in the centre. Spoon the sauce over everything generously. Serves 6.</p>
    </div>
  `,

  'Dwarf Bulbear': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>2 Dwarf Bulbears, cleaned and split along the spine</li>
        <li>3 tbsp cave-root fat</li>
        <li>4 cloves wild garlic, crushed</li>
        <li>1 tsp coarse mineral salt</li>
        <li>1 tsp smoked ground pepper</li>
        <li>1 tbsp fermented berry reduction</li>
        <li>Fresh bog herbs, to finish</li>
      </ul>

      <h3>Preparation</h3>
      <p>The Dwarf Bulbear is young, which means the fat has not yet fully developed — but what is there is faintly smoky and extraordinary. Split each creature along the spine to create two halves. Score the skin side in a crosshatch pattern to allow the fat to render during cooking. Season with salt and smoked pepper on both sides and allow to rest for one hour at minimum.</p>

      <h3>Method</h3>
      <ol>
        <li>Build a fire or heat a flat cooking surface to high heat. Rub with cave-root fat.</li>
        <li>Place the Dwarf Bulbears skin-side down directly on the heat. Cook undisturbed for 6–8 minutes until the skin is deeply charred and the fat has rendered.</li>
        <li>Flip and cook the flesh side for 4 minutes.</li>
        <li>Rest the meat, tented loosely, for 10 minutes.</li>
        <li>While resting, warm the crushed garlic in any remaining fat for 1 minute. Add the fermented berry reduction and stir to combine.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Serve each half whole, skin side up. Drizzle with the garlic and berry pan sauce. Scatter fresh bog herbs over the top. The smokiness of the young fat does much of the work — resist the urge to over-season. Serves 2.</p>
    </div>
  `,

  'Dwarf Bulborb': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>3–4 Dwarf Bulborbs, cleaned</li>
        <li>2 tbsp cave-root fat</li>
        <li>3 cloves wild garlic, minced</li>
        <li>½ tsp coarse mineral salt</li>
        <li>½ tsp cracked black pepper</li>
        <li>1 tsp dried bog thyme</li>
        <li>100 ml cave-spring water</li>
        <li>1 tsp fermented berry reduction</li>
      </ul>

      <h3>Preparation</h3>
      <p>Dwarf Bulborbs are small enough to cook whole, which simplifies preparation considerably. Remove the hide along the dorsal seam — it is tough and will not soften even with extended cooking. The meat beneath is compact and well-marbled for a creature of this size. Season all surfaces generously with salt, pepper, and thyme. Allow to rest for 30 minutes.</p>

      <h3>Method</h3>
      <ol>
        <li>Heat the cave-root fat in a pan over medium-high heat.</li>
        <li>Brown the Dwarf Bulborbs on all sides — approximately 3 minutes per side. They are small, so this goes quickly.</li>
        <li>Add the garlic and cook for 30 seconds.</li>
        <li>Add the cave-spring water, cover, and cook over low heat for 45 minutes.</li>
        <li>Uncover, raise heat, and reduce the liquid to a glaze. Stir in the fermented berry reduction.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Serve two per plate with the glaze spooned over. They are best alongside something absorbent — foraged root vegetables or flatbread work well. Concentrated and satisfying for their size. Serves 2.</p>
    </div>
  `,

  'Emperor Bulblax': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>1 Emperor Bulblax, sectioned into haunch, loin, shoulder, and tongue</li>
        <li>8 tbsp rendered cave-root fat, divided</li>
        <li>3 whole heads wild garlic, cloves separated</li>
        <li>5 sprigs bog rosemary</li>
        <li>4 bay leaves</li>
        <li>Coarse mineral salt and cracked black pepper, generously applied</li>
        <li>1.5 litres cave-spring water</li>
        <li>5 tbsp fermented berry reduction</li>
        <li>2 tbsp bitter root paste</li>
        <li>Foraged root vegetables and cave mushrooms, to accompany</li>
      </ul>

      <h3>Preparation</h3>
      <p>The Emperor Bulblax is a two-day project and should be treated as such. Begin by separating the creature into its primary sections — the haunches are the prize, yielding enormous, well-marbled cuts of exceptional quality. The loin runs along the dorsal ridge and is leaner but intensely flavoured. The shoulders are tougher and best suited to the longest braising. The tongue is a unique delicacy: remove it carefully, peel the outer membrane, and treat it as a separate preparation.</p>
      <p>Rub every surface with bitter root paste, salt, and pepper. Wrap and rest in a cool environment for a full 12 hours. Do not skip this step.</p>

      <h3>Method</h3>
      <ol>
        <li>Day one: remove the meat from its resting wrap and allow it to come to ambient temperature for two hours.</li>
        <li>Heat 4 tbsp cave-root fat in the largest vessel available over maximum heat. Sear the haunches and loin in batches — 5 minutes per side — until deeply, almost blackly crusted. Set aside.</li>
        <li>In the same vessel, brown the garlic cloves in the remaining fat. Add the shoulders, rosemary, bay, and cave-spring water. The liquid should come halfway up the shoulders. Cover and cook over very low heat for 8 hours.</li>
        <li>Add the haunches and loin to the vessel in the final 3 hours of cooking.</li>
        <li>Meanwhile, cook the tongue separately: simmer in salted cave-spring water for 4 hours, peel while warm, then slice and sear in a hot pan with butter until caramelised on both sides.</li>
        <li>Remove all meat from the cooking vessel. Strain the liquid and reduce aggressively over high heat until it coats a spoon. Stir in the fermented berry reduction.</li>
        <li>Rest the large cuts for a minimum of 30 minutes before carving.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Carve the haunches and loin at the table if possible — the presentation alone is extraordinary. Arrange sliced tongue alongside. Serve with roasted root vegetables and cave mushrooms. Ladle the sauce generously. This is a meal for a large gathering and should be treated as a formal occasion. Serves 12–14.</p>
    </div>
  `,

  'Female Sheargrub': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>6–8 Female Sheargrubs, cleaned</li>
        <li>2 tbsp unsalted butter</li>
        <li>2 cloves wild garlic, thinly sliced</li>
        <li>Juice of half a sour cave-fruit (or equivalent acidic liquid)</li>
        <li>Fine mineral salt and white pepper</li>
        <li>Fresh bog herbs, to finish</li>
      </ul>

      <h3>Preparation</h3>
      <p>The Female Sheargrub is the more culinarily cooperative of the two Sheargrub variants — without the male's mandibles to contend with, preparation is straightforward. Remove the outer carapace by applying gentle pressure at the head end and peeling back. The white flesh beneath is delicate and will tear if handled too roughly. Season very lightly — this creature has a clean, mild flavour that excessive seasoning will overwhelm.</p>

      <h3>Method</h3>
      <ol>
        <li>Heat the butter in a wide pan over medium heat until foaming but not browned.</li>
        <li>Add the sliced garlic and cook for 20 seconds — do not allow to colour.</li>
        <li>Lay the Sheargrubs in the pan in a single layer. Cook for 2 minutes without moving.</li>
        <li>Flip carefully. Cook for a further 90 seconds.</li>
        <li>Squeeze the sour cave-fruit juice directly into the pan and immediately remove from heat. The residual heat will finish the cooking.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Transfer to plates immediately. Spoon the pan butter and juices over each portion. Finish with a scattering of fresh bog herbs. Do not allow to sit — this dish must be eaten hot, within moments of cooking. Serves 1–2.</p>
    </div>
  `,

  'Fiery Blowhog': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>1 Fiery Blowhog, venting mechanism safely discharged, cleaned</li>
        <li>2 tbsp cave-root fat</li>
        <li>3 cloves wild garlic, crushed</li>
        <li>1 tsp coarse mineral salt</li>
        <li>½ tsp cracked black pepper</li>
        <li>1 sprig bog rosemary</li>
        <li>150 ml cave-spring water</li>
        <li>1 tbsp fermented berry reduction</li>
      </ul>

      <h3>Preparation</h3>
      <p>The Fiery Blowhog is one of the few ingredients on PNF-404 that arrives partially pre-cooked. The internal thermal mechanism keeps the flesh at an elevated temperature long after the creature has been stilled — this is an advantage, not a problem. Do not attempt to cool the meat before cooking. Remove the flame-producing snout gland — it is inedible and will continue producing heat independently if left attached. The body meat is dense, slightly smoky throughout, and benefits from a short preparation time relative to its size.</p>
      <p>Season the outer surface and rest for one hour. The internal heat will begin to work the seasoning inward during this time.</p>

      <h3>Method</h3>
      <ol>
        <li>Heat the cave-root fat in a pan over high heat.</li>
        <li>Sear the Blowhog body on all sides — 3 minutes per side. The pre-existing internal heat means the cooking time is significantly reduced compared to a cold cut of equivalent size.</li>
        <li>Add the garlic and rosemary to the pan and cook for 1 minute.</li>
        <li>Add the cave-spring water, cover, and cook over low heat for 1.5 hours.</li>
        <li>Remove the meat. Reduce the liquid by half and stir in the fermented berry reduction.</li>
        <li>Rest for 10 minutes before carving — the interior will still be quite warm.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Carve in thick slices. The natural smokiness of the flesh requires no augmentation — serve the sauce on the side rather than over the meat, so diners can apply it to taste. The smoky character is the point. Serves 4.</p>
    </div>
  `,

  'Goolix': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>1 Goolix, collected in a sealed vessel immediately upon defeat</li>
        <li>15 g fine mineral salt</li>
        <li>8 g setting agent (concentrated cave-mineral extract or equivalent)</li>
        <li>400 ml cold cave-spring water, divided</li>
        <li>2 tbsp cave-spring honey or nectar glaze</li>
        <li>Fresh bog herbs and edible cave-flowers, to garnish</li>
        <li>Chilled stone slabs or deep dishes, for setting</li>
      </ul>

      <h3>Preparation</h3>
      <p>The Goolix presents a challenge that is entirely conceptual before it is culinary: what one is working with has no fixed structure, no muscle, no bone, and no conventional texture. The approach must be cold. Heat causes the Goolix mass to disperse irreversibly. The goal is to capture and set it into a form that can be presented and consumed with dignity.</p>
      <p>Transfer the collected Goolix mass to a wide, cold vessel immediately. Work quickly — it will attempt to spread. Add the fine mineral salt and stir slowly. The salting will begin to firm the outer layer.</p>

      <h3>Method</h3>
      <ol>
        <li>Dissolve the setting agent in 100 ml of cold cave-spring water. Stir until completely clear.</li>
        <li>Combine with the remaining 300 ml cold water and pour slowly into the Goolix mass, stirring constantly in one direction.</li>
        <li>Add the honey or nectar glaze and continue stirring for 3 minutes. The mixture should begin to show resistance.</li>
        <li>Pour carefully into chilled moulds or deep dishes. The depth should not exceed 4 cm for even setting.</li>
        <li>Transfer to the coldest available environment and allow to set for a minimum of 4 hours.</li>
        <li>The finished aspic should tremble when the mould is gently shaken but hold its form when unmoulded onto a cold surface.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Unmould each portion onto a chilled plate. Garnish with bog herbs and cave-flowers pressed gently into the surface. Serve immediately — the aspic is temperature-sensitive. The flavour is clean, mineral, and subtly savoury, with a finish that lingers pleasantly. Serves many — yield depends on mould size.</p>
    </div>
  `,

  'Honeywisp': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>4–5 Honeywisps, nectar payload extracted and reserved</li>
        <li>The gelatinous body of each Honeywisp, collected carefully</li>
        <li>1 tbsp fine mineral salt</li>
        <li>6 g setting agent</li>
        <li>200 ml cold cave-spring water</li>
        <li>Reserved nectar payload (from above)</li>
        <li>Additional cave-spring honey, to taste</li>
        <li>Edible cave-flowers, to garnish</li>
      </ul>

      <h3>Preparation</h3>
      <p>The Honeywisp is primarily valuable for its nectar payload, which is a superb glaze and sweetener applicable to dozens of other preparations. However, the gelatinous body itself is edible — delicate, faintly sweet, and almost entirely without structural integrity on its own. The approach is to use the body as a component of a cold set preparation, with the nectar acting as both sweetener and flavouring agent. Puncture the nectar sac carefully over a bowl before handling the body. Reserve every drop.</p>

      <h3>Method</h3>
      <ol>
        <li>Dissolve the setting agent in the cold cave-spring water. Stir until clear.</li>
        <li>Add the fine mineral salt and the reserved nectar. Stir to combine. Taste — it should be pleasantly sweet and lightly savoury. Adjust with additional honey if needed.</li>
        <li>Add the Honeywisp body material to the liquid, distributing it evenly.</li>
        <li>Pour into small, shallow moulds. Set in the coldest available environment for 3 hours minimum.</li>
        <li>The finished portions should be translucent with the Honeywisp body visible within, suspended in the set nectar jelly.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Unmould onto cold plates. Garnish with cave-flowers. These are best served as a small first course or palate cleanser — their delicacy makes them unsuitable as a main. The nectar jelly glistens in a way that is genuinely impressive for something that took almost no effort to produce. Serves 2–3 as a starter.</p>
    </div>
  `,

  'Iridescent Flint Beetle': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>2–3 Iridescent Flint Beetles, cleaned</li>
        <li>3 tbsp cave-root fat</li>
        <li>2 cloves wild garlic, thinly sliced</li>
        <li>½ tsp coarse mineral salt</li>
        <li>¼ tsp cracked black pepper</li>
        <li>1 tsp cave-spring honey</li>
        <li>Fresh bog herbs, to finish</li>
      </ul>

      <h3>Preparation</h3>
      <p>The iridescent shell of the Flint Beetle is not merely decorative — when roasted at sufficient heat, it lacquers into a spectacular crust that catches the light and seals the moisture inside the creature perfectly. Do not remove the shell before cooking. Score the underside lightly to allow heat to penetrate. Season only the underside — the shell will season itself through the cooking process.</p>

      <h3>Method</h3>
      <ol>
        <li>Heat the cave-root fat in a pan until very nearly smoking.</li>
        <li>Place the Flint Beetles shell-side down. Press gently to ensure full contact with the pan surface.</li>
        <li>Cook shell-side down for 5–6 minutes without moving. The shell should develop a deep, lacquered sheen.</li>
        <li>Flip carefully. Add the garlic to the pan and cook for 1 minute on the flesh side.</li>
        <li>Drizzle with the cave-spring honey. Cover the pan and cook for a further 2 minutes off direct heat.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Serve shell-side up. The iridescent lacquered surface makes for a striking presentation. Crack the shell at the table — it splits cleanly — to reveal the rich, nutty meat within. Scatter fresh bog herbs. The honey and garlic pan juices spoon naturally over the exposed flesh. Serves 1–2.</p>
    </div>
  `,

  'Male Sheargrub': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>4–6 Male Sheargrubs, mandibles removed, cleaned</li>
        <li>3 tbsp cave-root fat</li>
        <li>3 cloves wild garlic, minced</li>
        <li>½ tsp coarse mineral salt</li>
        <li>½ tsp cracked black pepper</li>
        <li>1 tbsp bitter root reduction</li>
        <li>100 ml cave-spring water</li>
        <li>Fresh bog herbs, to finish</li>
      </ul>

      <h3>Preparation</h3>
      <p>The mandibles must be removed before anything else — they are sharp, they are inedible, and they will continue to be problematic even after the creature is stilled. Grip each mandible at the base and twist sharply. Once removed, the Sheargrub is straightforward. The body is firmer than the female's and has more pronounced flavour — a denser, earthier quality that takes a marinade well. Score the surface and rub with salt and pepper. Marinate in the bitter root reduction for a minimum of two hours.</p>

      <h3>Method</h3>
      <ol>
        <li>Remove the Sheargrubs from the marinade and pat dry.</li>
        <li>Heat the cave-root fat in a pan over medium-high heat.</li>
        <li>Brown the Sheargrubs on all sides — approximately 3 minutes per side.</li>
        <li>Add the garlic and cook for 30 seconds.</li>
        <li>Add the cave-spring water, cover, and braise over low heat for 1 hour.</li>
        <li>Uncover, raise heat, and reduce the liquid to a glaze.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Plate two or three per portion. Spoon the glaze over each one and finish with fresh bog herbs. The earthier character of the male holds up well to stronger accompaniments — cave mushrooms or roasted root vegetables work excellently alongside. Serves 1–2.</p>
    </div>
  `,

  'Mamuta': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>1 Mamuta, sectioned — arms, torso, and lower body treated separately</li>
        <li>4 tbsp cave-root fat</li>
        <li>1 head wild garlic, cloves left whole</li>
        <li>3 sprigs bog rosemary</li>
        <li>Coarse mineral salt and cracked black pepper</li>
        <li>500 ml cave-spring water</li>
        <li>2 tbsp cave-spring honey</li>
        <li>1 tbsp bitter root paste</li>
      </ul>

      <h3>Preparation</h3>
      <p>The Mamuta's most useful anatomical feature — from a culinary standpoint — is the enormous, flat striking arms. These, when removed and laid flat, are essentially self-tenderizing: the muscle structure developed for their signature flattening motion is already broken down to a degree that produces unusually tender slices after relatively brief cooking. Remove the arms first. The torso is denser and requires significantly more time. Rub everything with bitter root paste, salt, and pepper. The sweetness of the cave-spring honey counterbalances the fibrous density of the torso meat when used as a marinade component.</p>
      <p>Rest all sections for at least 3 hours.</p>

      <h3>Method</h3>
      <ol>
        <li>Heat the cave-root fat in a wide vessel over high heat. Sear the torso sections first — 5 minutes per side. Set aside.</li>
        <li>In the same vessel, sear the arm sections for 2 minutes per side — they require much less time due to the pre-broken-down muscle structure.</li>
        <li>Add the whole garlic cloves and rosemary. Cook for 1 minute.</li>
        <li>Return the torso sections only. Add the cave-spring water and honey. Cover and braise over very low heat for 4 hours.</li>
        <li>Add the arm sections in the final 30 minutes.</li>
        <li>Remove all meat. Reduce the liquid to a sauce consistency.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Slice the arm meat thinly and arrange fanned across the plate. Place the torso meat alongside in larger chunks. Spoon the honey-braising sauce generously over everything. The sweetness cuts beautifully through the fibrous density. Serves 6.</p>
    </div>
  `,

  'Mushroom Pikmin': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>—</li>
      </ul>

      <h3>Preparation</h3>
      <p>No.</p>

      <h3>Method</h3>
      <p>I have been asked to include an entry for this creature and I have declined. Several times. The legal department has been informed. Captain Olimar has been informed. The matter is closed.</p>

      <h3>To Serve</h3>
      <p>It does not serve. It is not served. We are moving on.</p>
    </div>
  `,

  'Pearly Clamclamp': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>1 Pearly Clamclamp, pearl discarded, interior flesh extracted</li>
        <li>4 tbsp unsalted butter, divided</li>
        <li>3 cloves wild garlic, minced</li>
        <li>Fine mineral salt and white pepper</li>
        <li>Juice of one sour cave-fruit</li>
        <li>100 ml cave-spring water</li>
        <li>Fresh bog herbs, to finish</li>
        <li>The reserved shell halves, for serving</li>
      </ul>

      <h3>Preparation</h3>
      <p>The pearl is inedible. I cannot stress this sufficiently, as I discovered at some personal cost during my initial investigation. Set it aside — it has decorative value, if nothing else. The interior flesh of the Clamclamp is the true prize: briny, dense, and deeply oceanic in flavour, it resembles nothing else available on PNF-404. Extract the flesh carefully using a flat implement worked around the inner edge of the shell. Separate the adductor muscle — the firmer cylindrical section — from the softer mantle. Both are excellent but require different cooking times. Season lightly with salt and white pepper only. The brine already present in the flesh provides most of the seasoning needed.</p>

      <h3>Method</h3>
      <ol>
        <li>Heat 2 tbsp butter in a wide pan over high heat until foaming.</li>
        <li>Add the adductor muscle sections first. Sear for 2 minutes per side until golden. Remove and set aside.</li>
        <li>Add the remaining 2 tbsp butter to the pan. Add the garlic and cook for 20 seconds.</li>
        <li>Add the mantle sections. Cook for 90 seconds — they need very little time.</li>
        <li>Return the adductor sections to the pan. Add the sour cave-fruit juice and cave-spring water.</li>
        <li>Cover for 1 minute to allow the steam to finish the cooking.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Arrange the flesh back inside one of the cleaned shell halves for presentation. Spoon the butter and juice pan sauce directly over. Finish with fresh bog herbs. The shell retains heat well and makes an exceptional serving vessel. Serves 4.</p>
    </div>
  `,

  'Puffstool': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>1 Puffstool cap, spore glands fully evacuated and sealed before collection</li>
        <li>4 tbsp unsalted butter</li>
        <li>4 cloves wild garlic, minced</li>
        <li>2 sprigs bog thyme</li>
        <li>Fine mineral salt and black pepper</li>
        <li>150 ml cave-spring water</li>
        <li>1 tbsp fermented berry reduction</li>
        <li>Foraged cave mushrooms, to accompany</li>
      </ul>

      <h3>Preparation</h3>
      <p>Legal counsel has requested that I note the following: the spore-producing glands of the Puffstool must be rendered completely inert before the cap is handled or prepared. The method I use involves a sealed collection vessel and working entirely from the stalk end, away from the spore distribution mechanism. Once the glands are safely addressed, the cap itself is an extraordinary ingredient — earthy, complex, and with a depth of flavour I have not encountered in any fungus from any planet I have visited. Slice the cap into thick sections. Season with salt and pepper. The underside gill structure holds butter and seasoning exceptionally well.</p>

      <h3>Method</h3>
      <ol>
        <li>Melt the butter in a wide pan over medium-high heat. Add the garlic and thyme. Cook for 30 seconds.</li>
        <li>Place the Puffstool cap sections gill-side down in the pan. Cook without moving for 4 minutes.</li>
        <li>Flip. The top surface should be deep golden. Cook for a further 3 minutes.</li>
        <li>Add the cave-spring water. Cover and cook for 5 minutes over low heat.</li>
        <li>Remove the cap sections. Reduce the liquid by half and stir in the fermented berry reduction to make a sauce.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Arrange the cap sections on a plate alongside foraged cave mushrooms. Spoon the sauce generously over everything. The Puffstool's flavour is the centrepiece — keep accompaniments simple and subordinate. Serves 4.</p>
    </div>
  `,

  'Puffy Blowhog': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>1 Puffy Blowhog, carefully deflated and cleaned</li>
        <li>3 tbsp cave-root fat</li>
        <li>3 cloves wild garlic, sliced</li>
        <li>2 sprigs bog rosemary</li>
        <li>Fine mineral salt and white pepper</li>
        <li>200 ml cave-spring water</li>
        <li>1 tbsp cave-spring honey</li>
        <li>Fresh bog herbs, to finish</li>
      </ul>

      <h3>Preparation</h3>
      <p>The Puffy Blowhog must be deflated before cooking — if this step is omitted the inflation gas expands rapidly with heat and the result is catastrophic and wasteful. Locate the inflation valve on the underside and press firmly to release. The creature will reduce to roughly one third of its apparent volume, which is a more accurate representation of the actual meat yield. The flesh is pillowy-soft with a faint natural sweetness — handle it gently throughout and use light seasoning only.</p>

      <h3>Method</h3>
      <ol>
        <li>Heat the cave-root fat in a pan over medium heat — not high. This creature needs gentle treatment.</li>
        <li>Season the deflated Blowhog lightly and place in the pan. Cook for 3 minutes per side over medium heat.</li>
        <li>Add the garlic and rosemary. Cook for 30 seconds.</li>
        <li>Add the cave-spring water and honey. Cover and cook over very low heat for 1 hour.</li>
        <li>Remove the Blowhog. Reduce the liquid gently to a light sauce.</li>
        <li>Rest for 10 minutes before portioning.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Carve into thick slices. The pale, soft meat looks delicate on the plate — serve the honey sauce alongside in a small vessel so diners can apply it themselves. Fresh bog herbs over the top. The sweetness of the flesh and the honey complement each other without becoming cloying. Serves 4.</p>
    </div>
  `,

  'Shearwig': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>6–8 Shearwigs, wings separated from bodies</li>
        <li>3 tbsp cave-root fat, divided</li>
        <li>2 cloves wild garlic, thinly sliced</li>
        <li>Fine mineral salt and black pepper</li>
        <li>1 tsp cave-spring honey</li>
        <li>Fresh bog herbs, to finish</li>
      </ul>

      <h3>Preparation</h3>
      <p>The Shearwig is best understood as two separate ingredients that happen to share an origin. The wings, when removed and dried briefly, fry into a spectacular crispy garnish — translucent, light, and with a satisfying crunch that provides textural contrast to almost any dish. The body is the denser, more substantive component: small but flavourful, with an earthy, slightly mineral quality. Separate the wings from each body at the base. Pat the wings completely dry. Season the bodies with salt and pepper.</p>

      <h3>Method</h3>
      <ol>
        <li>Heat 2 tbsp cave-root fat in a pan over very high heat until smoking. Add the wings in a single layer and fry for 90 seconds until crisp and translucent-golden. Remove immediately and drain. Season with fine salt while still hot.</li>
        <li>In the same pan, reduce heat to medium and add the remaining 1 tbsp fat.</li>
        <li>Add the garlic and cook for 20 seconds.</li>
        <li>Add the Shearwig bodies. Cook for 2 minutes per side.</li>
        <li>Drizzle with honey, cover, and cook for 1 further minute off the heat.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Arrange the bodies on a plate and place the crispy wings upright against them. The visual contrast between the golden wings and the darker bodies is appealing. Scatter fresh bog herbs. The wings can also be used as a garnish on other dishes — they hold their crispness for up to 20 minutes. Serves 1–2.</p>
    </div>
  `,

  'Smoky Progg': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>1 Smoky Progg, handled with thick insulated gloves throughout</li>
        <li>Coarse mineral salt</li>
        <li>Cracked black pepper</li>
        <li>2 sprigs bog rosemary</li>
        <li>1 tbsp fermented berry reduction</li>
        <li>Foraged root vegetables, to accompany</li>
      </ul>

      <h3>Preparation</h3>
      <p>The Smoky Progg requires no conventional cooking. The creature is smoke-saturated at a cellular level — the flesh has been cold-smoking itself throughout its entire existence and arrives at the kitchen in a state of preparation that would take 48 hours to replicate artificially. Handle with thick gloves throughout — the outer surface retains heat and residual smokiness that can transfer unpleasantly to the hands. The preparation is simple: season the surface with coarse salt and cracked black pepper and allow to rest for two hours. The internal heat will work the seasoning into the outer layer without any application of external heat.</p>

      <h3>Method</h3>
      <ol>
        <li>After resting, place the Smoky Progg in a covered vessel with the bog rosemary.</li>
        <li>Allow to rest in the covered vessel for a further hour. The trapped warmth will continue the cooking process gently.</li>
        <li>Remove and allow to cool slightly before slicing — approximately 15 minutes.</li>
        <li>Slice against the natural grain of the smoke-infiltrated flesh. The interior should be fully cooked through by its own heat.</li>
        <li>Warm the fermented berry reduction gently and serve alongside.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Arrange slices on a plate with roasted root vegetables. The smoke flavour is profound and pervasive — no additional flavouring is needed or welcome. The fermented berry reduction provides acidity to cut through the richness. Serve in thin slices; the intensity of flavour means a little goes a considerable way. Serves 6.</p>
    </div>
  `,

  'Spotty Bulbear': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>1 Spotty Bulbear, hide removed, fat pockets reserved</li>
        <li>4 tbsp cave-root fat</li>
        <li>1 head wild garlic, cloves separated</li>
        <li>3 sprigs bog rosemary</li>
        <li>Coarse mineral salt and cracked black pepper</li>
        <li>400 ml cave-spring water</li>
        <li>2 tbsp fermented berry reduction</li>
      </ul>

      <h3>Preparation</h3>
      <p>The spotted pattern on the Spotty Bulbear's hide corresponds to concentrations of subcutaneous fat — locate these pockets during hide removal and reserve them separately. They render into an exceptionally flavoured cooking fat that should be used in the first stage of cooking. The meat itself is leaner and more aggressively flavoured than the standard Bulborb — it benefits from longer braising and a strong hand with seasoning. Portion into haunches and shoulders. Season generously — this creature can take it.</p>

      <h3>Method</h3>
      <ol>
        <li>Render the reserved fat pockets in a dry pan over medium heat until they release their fat. Remove the solids and raise heat to high.</li>
        <li>Sear the Bulbear portions in the rendered fat — 4 minutes per side until deeply crusted.</li>
        <li>Add the whole garlic cloves and rosemary. Cook for 1 minute.</li>
        <li>Add the cave-spring water. Cover and braise over low heat for 3.5 hours.</li>
        <li>Remove the meat. Reduce the braising liquid, then stir in the fermented berry reduction.</li>
        <li>Rest the meat for 20 minutes before carving.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Carve in thick slices and arrange on a board. Spoon the rich, reduced sauce alongside. The Spotty Bulbear's assertive flavour rewards bold accompaniments — pickled cave vegetables or strongly flavoured foraged roots work well. Serves 4–6.</p>
    </div>
  `,

  'Swooping Snitchbug': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>2–3 Swooping Snitchbugs, wings removed, cleaned</li>
        <li>3 tbsp cave-root fat</li>
        <li>3 cloves wild garlic, minced</li>
        <li>½ tsp coarse mineral salt</li>
        <li>½ tsp cracked black pepper</li>
        <li>2 tbsp fermented berry reduction</li>
        <li>100 ml cave-spring water</li>
        <li>Fresh bog herbs, to finish</li>
      </ul>

      <h3>Preparation</h3>
      <p>The wings are inedible and must be removed. The body is compact and lean — deceptively so, given the creature's apparent size in flight. Once the wings are off, what remains is a modest but well-flavoured cut that takes a marinade extremely well. Score the body surface in a crosshatch pattern and rub with salt and pepper. Marinate in the fermented berry reduction for at least two hours. The acidity of the reduction begins to work the exterior and introduces flavour into the lean flesh that it would otherwise lack.</p>

      <h3>Method</h3>
      <ol>
        <li>Remove the Snitchbugs from the marinade and pat dry. Reserve the marinade.</li>
        <li>Heat the cave-root fat in a pan over high heat.</li>
        <li>Brown the bodies on all sides — approximately 3 minutes per side.</li>
        <li>Add the garlic. Cook for 30 seconds.</li>
        <li>Add the reserved marinade and the cave-spring water. Cover and braise over low heat for 1.5 hours.</li>
        <li>Uncover and reduce the liquid to a glaze.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Plate one per person. Spoon the glaze over each body. Finish with fresh bog herbs. The fermented berry reduction used in the marinade carries through into the final sauce and gives the dish a pleasant acidity that lifts the lean meat. Serves 2–3.</p>
    </div>
  `,

  'Water Dumple': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>2 Water Dumples, cleaned and filleted</li>
        <li>3 tbsp unsalted butter</li>
        <li>2 cloves wild garlic, thinly sliced</li>
        <li>Fine mineral salt and white pepper</li>
        <li>Juice of one sour cave-fruit</li>
        <li>200 ml cave-spring water</li>
        <li>Fresh bog herbs, to finish</li>
      </ul>

      <h3>Preparation</h3>
      <p>The Water Dumple yields a firm, white, lightly briny flesh that behaves similarly to a dense freshwater fish. Fillet along the lateral line, removing the skin — it does not soften in cooking and is best discarded. The fillets should be patted dry and seasoned lightly with fine salt and white pepper only. This creature's flavour is delicate and clean; anything more aggressive will overwhelm it. Poaching is the recommended method.</p>

      <h3>Method</h3>
      <ol>
        <li>In a wide, shallow pan, bring the cave-spring water, garlic, and a pinch of salt to a gentle simmer. Do not boil.</li>
        <li>Lower the fillets into the liquid. The liquid should just cover them. If it does not, add more water.</li>
        <li>Poach over very low heat for 8–10 minutes. The flesh should be just opaque throughout and flake when pressed gently.</li>
        <li>Remove the fillets carefully. Strain and reserve 100 ml of the poaching liquid.</li>
        <li>In a separate small pan, melt the butter over medium heat. Add the sour cave-fruit juice and the reserved poaching liquid. Reduce by half to make a light sauce.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Place each fillet on a warm plate. Spoon the butter sauce over and around. Finish with fresh bog herbs. Simple. Clean. The aquatic flavour of the Water Dumple needs no embellishment beyond what is here. Serves 2.</p>
    </div>
  `,

  'Wolpole': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>12–16 Wolpoles, cleaned</li>
        <li>4 tbsp cave-root fat</li>
        <li>Coarse mineral salt</li>
        <li>Cracked black pepper</li>
        <li>1 tsp dried bog thyme</li>
        <li>Sour cave-fruit juice, to serve</li>
      </ul>

      <h3>Preparation</h3>
      <p>The Wolpole is harvested by the dozen — individual preparation is unnecessary and impractical at this scale. Wash thoroughly in cold cave-spring water. Pat completely dry — any moisture will cause the fat to spit violently during frying. Season in bulk: toss all the Wolpoles in a large vessel with the salt, pepper, and dried thyme until evenly coated. They are ready to cook.</p>

      <h3>Method</h3>
      <ol>
        <li>Heat the cave-root fat in a wide, deep pan over very high heat until it begins to shimmer.</li>
        <li>Add the Wolpoles in a single layer — work in batches if necessary. Do not crowd the pan.</li>
        <li>Fry for 2–3 minutes without moving, until the undersides are deeply golden.</li>
        <li>Toss or flip and fry for a further 2 minutes.</li>
        <li>Drain briefly on any absorbent surface and season immediately with additional coarse salt while still hot.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Serve in a pile on a shared plate — this is communal eating. A squeeze of sour cave-fruit juice over the top is all that is needed. The tails add a pleasant chew that contrasts with the crisper body. Best eaten immediately, standing over the pan if necessary. Serves 1–2.</p>
    </div>
  `,

  'Wollyhop': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>1 Wollyhop, haunches removed and prepared separately from the body</li>
        <li>4 tbsp cave-root fat</li>
        <li>1 head wild garlic, cloves separated and lightly crushed</li>
        <li>3 sprigs bog rosemary</li>
        <li>Coarse mineral salt and cracked black pepper</li>
        <li>300 ml cave-spring water</li>
        <li>2 tbsp fermented berry reduction</li>
      </ul>

      <h3>Preparation</h3>
      <p>The Wollyhop's haunches are the reason for the entire enterprise. The muscular development from constant ground-impact jumping produces meat of exceptional density and marbling — but that same development means the muscle fibres are tightly wound and require time to relax into tenderness. Remove the haunches at the hip joint. Separate each haunch into the upper and lower sections. Score the surface deeply and season generously. Allow to rest for a minimum of 4 hours.</p>
      <p>The body meat is secondary but still worthwhile — it is leaner and better suited to a braise than a roast.</p>

      <h3>Method</h3>
      <ol>
        <li>Heat the cave-root fat in a wide vessel over very high heat. Sear the haunch sections — 5 minutes per side — until deeply crusted. Set aside.</li>
        <li>Brown the garlic cloves in the same fat for 2 minutes.</li>
        <li>Return the haunches to the vessel. Add the rosemary and cave-spring water.</li>
        <li>Cover and braise over the lowest possible heat for 4 hours. The meat should be nearly falling apart when done.</li>
        <li>Remove the haunches. Reduce the braising liquid to a sauce. Stir in the fermented berry reduction.</li>
        <li>Rest the meat for 20 minutes before portioning.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Serve the haunches whole or pulled apart in large pieces. Spoon the reduced sauce over generously. The braised garlic cloves can be squeezed from their skins directly onto the meat. Serves 4–6.</p>
    </div>
  `,

  'Yellow Wollyhop': `
    <div class="recipe-content">
      <h3>Ingredients</h3>
      <ul>
        <li>1 Yellow Wollyhop, haunches and body sectioned</li>
        <li>4 tbsp cave-root fat</li>
        <li>1 head wild garlic, cloves separated</li>
        <li>2 sprigs bog thyme</li>
        <li>Coarse mineral salt and cracked black pepper</li>
        <li>300 ml cave-spring water</li>
        <li>Juice of one sour cave-fruit</li>
        <li>1 tbsp cave-spring honey</li>
      </ul>

      <h3>Preparation</h3>
      <p>The Yellow Wollyhop differs from its standard counterpart in one significant culinary respect: the flesh carries a mild but distinct acidity — a brightness that the standard Wollyhop entirely lacks. This quality means the Yellow variety benefits from preparation methods that complement rather than overpower it. Avoid heavily fermented marinades — the creature provides its own acidic character. Season simply with salt and pepper only. Prepare the haunches as with the standard Wollyhop: score, season, and rest for 3 hours minimum.</p>

      <h3>Method</h3>
      <ol>
        <li>Heat the cave-root fat over high heat and sear the haunch sections — 5 minutes per side until deeply crusted.</li>
        <li>Add the garlic cloves and thyme. Cook for 1 minute.</li>
        <li>Add the cave-spring water. Cover and braise over very low heat for 3.5 hours.</li>
        <li>Remove the meat. To the braising liquid, add the sour cave-fruit juice and honey. Reduce by half over high heat — the sauce should be lightly sweet and pleasantly tart.</li>
        <li>Rest the meat for 20 minutes before portioning.</li>
      </ol>

      <h3>To Serve</h3>
      <p>Serve the haunches in large pieces with the sweet-tart sauce spooned over. The honey in the sauce echoes and balances the natural acidity in the flesh in a way that makes this preparation more interesting than the standard Wollyhop preparation. The Yellow variety is worth seeking out specifically for this reason. Serves 4–6.</p>
    </div>
  `,

});
