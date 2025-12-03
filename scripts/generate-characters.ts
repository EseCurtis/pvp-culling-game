import { prisma } from "../src/lib/prisma";
import {
  generateCharacterInsights,
  type CharacterProfileInput,
  type CharacterInsights,
} from "../src/lib/ai/gemini";

type CharacterTemplate = {
  name: string;
  gender: string;
  style: string;
  demeanor: string;
  origin: string;
  trauma: string;
  mentor: string;
  element: string;
  conduit: string;
  techniqueHook: string;
  innateHook: string;
  maxHook: string;
  domainName: string;
  domainEnvironment: string;
  domainImpact: string;
  reverseMethod: string;
  estimate: string;
  bindingVow: {
    name: string;
    sacrifice: string;
    effect: string;
    limitations: string[];
  };
};

type CharacterSeed = CharacterProfileInput & { userEmail: string };

const templates: CharacterTemplate[] = [
  {
    name: "Akari Tenhou",
    gender: "Female-presenting tactician",
    style:
      "a layered obsidian flight coat trimmed with comet dust fibers and levitating compass charms",
    demeanor:
      "Quiet strategist who sketches orbital equations in the air before speaking",
    origin:
      "Born aboard the Tenhou orbital shrine that circles Sendai where her clan tracked cursed meteor paths for centuries",
    trauma:
      "A corrupted satellite shattered the shrine dome and erased her squad during reentry, leaving her with permanent cosmic tinnitus",
    mentor:
      "General Mei Mei forced her to translate star charts into blade angles during zero-gravity duels until she could cut vacuum itself",
    element: "refracted starlight pressure",
    conduit: "a collapsible astrolabe of glass needles",
    techniqueHook:
      "Orbit Severance folds constellations around opponents and slices along delayed gravity lanes to sever defenses before they notice",
    innateHook:
      "Perigee Sense lets her feel gravitational intent seconds ahead, predicting dodges and parries with eerie calm",
    maxHook:
      "Apogee Cascade rains chained meteor spears while freezing the battlefield in suspended time, punishing any movement",
    domainName: "Atlas Meridian",
    domainEnvironment:
      "a weightless cosmos where luminous gridlines lock every direction and horizon",
    domainImpact:
      "any movement becomes a plotted vector she can cut from multiple angles simultaneously",
    reverseMethod:
      "Condenses stellar residue into warm plasma threads that knit wounds from the inside out",
    estimate: "Special Grade orbital siege-breaker",
    bindingVow: {
      name: "Astral Ledger Oath",
      sacrifice:
        "She must log every casualty from her missions in a cursed ledger and relive them nightly.",
      effect:
        "When honored, her calculations never drift and every plotted strike lands within millimeters.",
      limitations: [
        "Breaking the nightly vigil causes her energy control to collapse for twenty-four hours.",
      ],
    },
  },
  {
    name: "Raijin Ibara",
    gender: "Male-presenting storm zealot",
    style:
      "a tattooed stormproof yukata with copper lightning spines running along both arms",
    demeanor:
      "Loud battlefield preacher who recites weather rites while laughing mid-swing",
    origin:
      "Raised inside an abandoned Kansai hydro plant converted into a thunder shrine for runaway sorcerers",
    trauma:
      "Watched his older brother dissolve when red lightning infected the reservoir and tore through the turbines",
    mentor:
      "Nanami's retired partner drilled him to count currents like overtime ledgers until his rage cooled",
    element: "ionized pressure fronts",
    conduit: "a chain of bronze prayer beads acting as lightning rods",
    techniqueHook:
      "Tempest Covenant stacks storm walls like grinding gears to flay anything caught inside their orbit",
    innateHook:
      "Barometric Pulse senses micro pressure dips to anticipate teleportation feints or hidden blades",
    maxHook:
      "Divine Cyclone Verdict drags a typhoon core through his chest to vaporize everything ahead in holy lightning",
    domainName: "Judgment Squall Cathedral",
    domainEnvironment:
      "rotating thunder altars hanging over endless rain and chanting spirits",
    domainImpact:
      "each raindrop becomes a jury bolt that punishes deception with amplified damage",
    reverseMethod:
      "Turns residual thunderheads into warm steam clouds that cauterize allies while numbing pain",
    estimate: "Special Grade frontline devastator",
    bindingVow: {
      name: "Storm Deacon Pact",
      sacrifice:
        "He forgoes metal weapons outside battle, carrying only the prayer chain as proof of restraint.",
      effect:
        "Typhoon density doubles whenever he defends civilians or escorts evacuations.",
      limitations: [
        "If he attacks out of anger, the storm walls collapse inward on him for the rest of the day.",
      ],
    },
  },
  {
    name: "Sorano Fuse",
    gender: "Nonbinary wind cartographer",
    style:
      "a flowing teal pilot cloak threaded with map vellum and floating compass needles",
    demeanor:
      "Patient archivist who hums wind coordinates under their breath while overlaying diagrams",
    origin:
      "Raised within the Fuse cartography guild that mapped aerial curses above Nagoya using handmade balloons",
    trauma:
      "Their memory was almost erased after being trapped in a vacuum domain for twelve hours without light",
    mentor:
      "Ui Ui taught them to anchor thoughts with origami markers so stolen memories could be rewoven",
    element: "directional vacuum currents",
    conduit: "folded kites reinforced with cursed lacquer and silver thread",
    techniqueHook:
      "Vector Stitching braids razor wind seams that reposition opponents mid-strike and rip momentum away",
    innateHook:
      "Drift Ledger imprints gust history onto their skin, revealing unseen approach angles and safe corridors",
    maxHook:
      "Null Compass Bloom freezes all air for three seconds then releases it as a pulverizing bloom of shattered sound",
    domainName: "Skyfold Archive",
    domainEnvironment:
      "infinite scrolls of wind maps fluttering around an anchor pillar",
    domainImpact:
      "foes are pinned to coordinates that Sorano can rewrite at will, trapping them in looped routes",
    reverseMethod:
      "Rehydrates lungs by channeling stored breezes into gentle pressure that massages organs back online",
    estimate: "Grade 1 aerial controller",
    bindingVow: {
      name: "Compass Balance Vow",
      sacrifice:
        "They must document every battlefield change inside a logbook immediately after each engagement.",
      effect:
        "As long as the log stays current, teleportation inside their domain is impossible.",
      limitations: [
        "A missing log page removes their ability to fly for the next mission.",
      ],
    },
  },
  {
    name: "Kaito Murakumo",
    gender: "Male-presenting blade monk",
    style:
      "ashen monk robes layered over carbon fiber plates etched with sutras that glow when he breathes",
    demeanor:
      "Soft-spoken swordsman who apologizes before decisive cuts and bows to fallen foes",
    origin:
      "Grew up in a mountain monastery guarding the Murakumo sword vault from curse collectors",
    trauma:
      "A betrayal by his abbot unleashed a smog dragon that scorched the archives and orphaned the novices",
    mentor:
      "Gojo's uncle covertly drilled him in blindfold sparring to refine spatial sense beyond sight",
    element: "compressed storm ash",
    conduit: "dual tantō connected by a magnetic spine and prayer beads",
    techniqueHook:
      "Smog Guillotine densifies ash into ribbons that slice intangible curses and leave sealing residue",
    innateHook:
      "Suture Step lets him link footholds in midair to redirect slashes without touching ground even once",
    maxHook:
      "Zenith Severance manifests a single ash blade longer than the shrine itself, erasing whatever he names",
    domainName: "Ashen Cloister",
    domainEnvironment:
      "silent monastery halls filled with floating incense ash and tolling bells",
    domainImpact:
      "opponents breathe in remorseful smoke that slows reactions with every inhale",
    reverseMethod:
      "Filters ash through prayer beads and feeds it back as clean oxygen to mend lungs and veins",
    estimate: "Special Grade executioner",
    bindingVow: {
      name: "Contrition Mantra",
      sacrifice:
        "He must ring a bell for each life he takes before resting that night.",
      effect:
        "When the ritual is kept, his blades never dull regardless of curse density.",
      limitations: [
        "Skipping the bell rite causes his next technique to rebound toward him.",
      ],
    },
  },
  {
    name: "Mizuho Ren",
    gender: "Female-presenting tide warden",
    style:
      "an iridescent dive suit with pearl armor bands and floating hydro glyphs orbiting her shoulders",
    demeanor:
      "Calm negotiator who bargains with rivers and spirits before committing to combat",
    origin:
      "Descendant of the Ren canal keepers tasked with protecting Osaka's floodgates and ghost locks",
    trauma:
      "Lost her childhood district when a curse poisoned the estuary while her clan hesitated to intervene",
    mentor:
      "Utahime refined her choir-based focusing so chants could bind torrents instantly under pressure",
    element: "pressurized lunar tidewater",
    conduit: "a ring of ceramic orbs orbiting her waist like moons",
    techniqueHook:
      "Tidal Arbitration creates rotating water courts that judge opponents and trap them in crushing bubbles",
    innateHook:
      "Hydrostatic Memory remembers every current that ever touched her skin, predicting future surges and ambushes",
    maxHook:
      "Moonfall Tribunal drops twin tidal pillars that crush domains and cleanse lingering poison or smog",
    domainName: "Leviathan Courthouse",
    domainEnvironment:
      "a submerged courtroom surrounded by bioluminescent jurors and echoing verdict drums",
    domainImpact:
      "truthful fighters move freely while liars drown in binding currents that read their intent",
    reverseMethod:
      "Compresses healing water into needles that dissolve inside wounds and flush toxins outward",
    estimate: "Grade 1 defensive anchor",
    bindingVow: {
      name: "Floodgate Accord",
      sacrifice: "She must never deny aid to a drowning or stranded stranger.",
      effect:
        "So long as she obeys, her barriers automatically expand around allies before enemy techniques land.",
      limitations: [
        "If she refuses rescue, her currents refuse to answer for three full battles.",
      ],
    },
  },
  {
    name: "Botan Kirishima",
    gender: "Male-presenting curse botanist",
    style:
      "moss-covered armor interlaced with luminous spores and soft bioluminescent petals",
    demeanor:
      "Gentle researcher who names every vine he breeds and apologizes to trees he prunes",
    origin:
      "Raised inside a greenhouse hidden under Mt. Koya that cultivated plants to consume curses",
    trauma:
      "A corporate raid burned his research and released experimental molds across nearby villages",
    mentor:
      "Shoko supervised his bio alchemy to keep it from mutating into plagues while still scaling",
    element: "cursed chlorophyll threads",
    conduit: "seed grenades stored inside a living satchel of vines",
    techniqueHook:
      "Verdant Guillotine sprouts blades midair that drink cursed energy as fertilizer before detonating",
    innateHook:
      "Mycelium Whisper lets him communicate with any plant touching his spores, granting battlefield surveillance",
    maxHook:
      "Overgrowth Ultimatum floods the field with towering vines that self-detonate into spores and regrow instantly",
    domainName: "Greenwarden Labyrinth",
    domainEnvironment:
      "endless greenhouse corridors that reconfigure like a puzzle box around intruders",
    domainImpact:
      "intruders are rerouted into thorn cages while Botan steps through root shortcuts effortlessly",
    reverseMethod:
      "Directs chlorophyll to accelerate clotting, regrow tissue, and purge venom from bloodstreams",
    estimate: "Grade 1 eco-siege artist",
    bindingVow: {
      name: "Garden Steward Promise",
      sacrifice:
        "He must plant a restorative grove in any town he defends before leaving.",
      effect:
        "Plants grown under the promise can absorb collateral curse damage meant for civilians.",
      limitations: [
        "Neglecting a grove causes his spores to wither until he spends a day tending them.",
      ],
    },
  },
  {
    name: "Hoshiko Arata",
    gender: "Female-presenting astronomer",
    style:
      "glass armor plates that refract light into aurora ribbons trailing behind her steps",
    demeanor:
      "Cheerful observer who narrates cosmic myths mid-fight to steady younger allies",
    origin:
      "Born to Arata comet chasers stationed in Hokkaido under perpetual winter skies",
    trauma:
      "A failed launch scattered cursed shards across her home crater, forcing her to fight barefoot in ice",
    mentor:
      "Ieiri instructed her to bind constellations to acupuncture points so light obeyed her pulse",
    element: "spectrum-harmonic beams",
    conduit: "paired refractor fans tuned to different wavelengths",
    techniqueHook:
      "Aurora Filament weaves color bands that sever nerves while dazzling anyone who looks directly at them",
    innateHook:
      "Parallax Echo records an enemy's previous motion and replays it against them like a mirrored afterimage",
    maxHook:
      "Solaris Bloom summons a miniature sun that pulses controlled flares capable of burning poison away",
    domainName: "Nebula Pavilion",
    domainEnvironment:
      "a crystalline observatory floating within aurora curtains and mirrored floors",
    domainImpact:
      "colors become chains that lock cursed techniques to a single wavelength she can then shatter",
    reverseMethod:
      "Bends soft light into pulse-stitching ribbons that reseal skin and organs delicately",
    estimate: "Special Grade support artillery",
    bindingVow: {
      name: "Aurora Recital",
      sacrifice:
        "She must perform a nightly recital for the spirits of lost astronauts using her refractor fans.",
      effect:
        "Her spectrum beams gain harmonics that bypass reflective shields and illusions.",
      limitations: [
        "Silence during the recital causes the beams to flicker unpredictably for the next day.",
      ],
    },
  },
  {
    name: "Genji Tatsuo",
    gender: "Male-presenting brawler",
    style:
      "a reinforced biker jacket embedded with dragon scales and exhaust pipes along the spine",
    demeanor:
      "Reckless rider who jokes mid-swing and drifts around curses like traffic cones",
    origin:
      "Raised by the Tatsuo biker clan policing abandoned expressways haunted by vehicular spirits",
    trauma:
      "His convoy was ambushed by a kilometer-long centipede curse that devoured half the riders",
    mentor:
      "Toji's associate taught him to weaponize cursed exhaust without burning out his lungs",
    element: "combustion shockwaves",
    conduit: "a cursed engine gauntlet strapped to his dominant arm",
    techniqueHook:
      "Ignition Rush coats his fists in piston-like bursts that detonate on impact and launch foes skyward",
    innateHook:
      "Throttle Sense hears the RPM of every curse nearby, revealing hidden reserves and weak cylinders",
    maxHook:
      "Dragon Apex Wheel creates a flaming circular road that crushes foes with rotational force and backdraft",
    domainName: "Expressway Inferno",
    domainEnvironment:
      "an endless looping highway under neon skies and roaring traffic spirits",
    domainImpact:
      "opponents are forced onto lethal traffic lanes while he controls speed, traction, and collision angles",
    reverseMethod:
      "Vents controlled exhaust to cauterize wounds and jump-start failing hearts with micro detonations",
    estimate: "Grade 2 demolition sprinter",
    bindingVow: {
      name: "Rider's Promise",
      sacrifice: "He must escort any lost traveler he meets until they reach safety.",
      effect:
        "For every person delivered safely, his gauntlet stores an extra detonation charge.",
      limitations: [
        "Breaking the promise stalls his gauntlet for an entire week.",
      ],
    },
  },
  {
    name: "Kaede Sunada",
    gender: "Female-presenting tactician",
    style:
      "a white tactical poncho layered over ceramic plates with calligraphy seams and luminous pockets",
    demeanor:
      "Calm logistician who keeps scorecards mid-fight and speaks through earpiece networks",
    origin:
      "Heir to Sunada supply lines that fed Kyoto sorcerers during the last great purge",
    trauma:
      "Smugglers sabotaged her caravans, starving frontline units and costing dozens of lives",
    mentor:
      "Yaga engineered drones for her that respond to paper charms, forcing her to learn robotics overnight",
    element: "modular paper wards",
    conduit: "stacks of origami shikigami stored in scroll tubes around her waist",
    techniqueHook:
      "Logistics Array summons paper soldiers that reroute attacks like convoys and explode when overburdened",
    innateHook:
      "Inventory Mind tracks every cursed resource within a kilometer, letting her redirect supplies instantly",
    maxHook:
      "Grand Muster deploys a thousand warded cranes that detonate in a perfect grid, carving safe corridors",
    domainName: "Supply Nexus",
    domainEnvironment:
      "floating warehouses connected by luminous bridges and conveyor belts",
    domainImpact:
      "she can redirect incoming techniques into storage rooms for later release or dismantle them entirely",
    reverseMethod:
      "Applies adhesive talismans that accelerate tissue knitting while insulating nerves from pain",
    estimate: "Grade 1 command specialist",
    bindingVow: {
      name: "Quartermaster Pledge",
      sacrifice:
        "She must deliver surplus supplies to nearby civilians after each battle before resting.",
      effect:
        "Stored techniques gain extra stability when released, preventing friendly fire.",
      limitations: [
        "Hoarding power breaks the pledge and locks her storage arrays for two battles.",
      ],
    },
  },
  {
    name: "Riku Onikawa",
    gender: "Male-presenting shadow duelist",
    style:
      "matte black armor with ink tendrils drifting like smoke and mirrors embedded at the joints",
    demeanor:
      "Soft voice reciting poetry before lethal thrusts then vanishing into silhouettes",
    origin:
      "Last survivor of the Onikawa shadow lineage that curated forbidden paintings",
    trauma:
      "His clan was consumed by its own experimental domain that misfired during an eclipse",
    mentor:
      "A cursed painting taught him to split silhouettes and taught discipline through hallucinations",
    element: "liquid ink shadows",
    conduit: "a brush-spear that paints midair sigils and doorways",
    techniqueHook:
      "Night Partition draws dividing lines that separate targets from their shadows, freezing their movement",
    innateHook:
      "Echo Silhouette lets him swap positions with any shadow he painted earlier in the fight",
    maxHook:
      "Grim Gallery manifests framed darkness that erases whatever is displayed inside the portrait",
    domainName: "Tenebris Atelier",
    domainEnvironment:
      "a gallery of endless ink canvases dripping into black seas and whispering curators",
    domainImpact:
      "anyone inside becomes subject to artistic edits that erase limbs, senses, or memories",
    reverseMethod:
      "Repaints wounds with ink light, restoring tissue by filling the outline with raw cursed energy",
    estimate: "Special Grade assassin",
    bindingVow: {
      name: "Silent Exhibit",
      sacrifice:
        "He must never speak above a whisper while the moon is visible, regardless of circumstance.",
      effect:
        "When the vow stands, his shadows remain invisible to detection techniques and sensor barriers.",
      limitations: [
        "Raising his voice instantly collapses all painted portals and seals his ink for a night.",
      ],
    },
  },
  {
    name: "Saki Daiten",
    gender: "Female-presenting artillery mage",
    style:
      "a gilded bombardier suit with floating targeting gyros and vibro thrusters under each heel",
    demeanor:
      "Deadpan mathematician who times jokes with explosions and measures pauses in frames",
    origin:
      "Built siege cannons for the Daiten artillery guild that defended Yokohama",
    trauma:
      "An unstable curse bomb leveled her workshop, forcing her to rebuild her body with prosthetic braces",
    mentor:
      "Principal Gakuganji refined her rhythm-based focusing so she could conduct barrages solo",
    element: "resonant sonic shells",
    conduit: "a pair of hovering drum cannons linked by golden wires",
    techniqueHook:
      "Harmonic Barrage stacks frequencies that shatter domains like glass and rupture cursed cores",
    innateHook:
      "Metronome Vision lets her slow perception to line up shots exactly between enemy blinks",
    maxHook:
      "Cataclysmic Cadenza fires a city-length shockwave that rewrites terrain into perfect circles",
    domainName: "Resonance Citadel",
    domainEnvironment:
      "a fortress of sound panels vibrating in sync with luminous metronomes",
    domainImpact:
      "enemies move in slow motion while she acts on double tempo, making dodging impossible",
    reverseMethod:
      "Uses subsonic hums to stimulate rapid cell repair and recalibrate shattered bones",
    estimate: "Special Grade artillery conductor",
    bindingVow: {
      name: "Tempo Covenant",
      sacrifice:
        "She cannot fire off-beat; every volley must land on a counted rhythm she announces.",
      effect:
        "When honored, her shots bypass reflective barriers and sonic dampeners.",
      limitations: [
        "Missing the beat silences her cannons for ten minutes regardless of need.",
      ],
    },
  },
  {
    name: "Mugen Isei",
    gender: "Male-presenting gambler",
    style: "a sleek suit woven with playing-card sigils and faint neon circuitry",
    demeanor:
      "Smirking tactician who bargains mid-fight and narrates probabilities for fun",
    origin:
      "Ran black-market talisman tables across Shibuya before the culling game collapsed everything",
    trauma:
      "A rigged domain wiped his clientele and nearly trapped him in a looping hour of losses",
    mentor:
      "Hakari taught him controlled probability bursts so he could survive his own games",
    element: "probability-glitched talismans",
    conduit: "a deck of cursed chips orbiting his wrist",
    techniqueHook:
      "House Edge rewrites odds so opponents fumble critical techniques while he cashes in stolen probability",
    innateHook:
      "Stacked Deck stores lucky outcomes and redeals them when cornered, forcing fate to re-roll",
    maxHook:
      "Jackpot Collapse pauses causality, letting him rearrange events from the last three seconds however he wants",
    domainName: "Lux Aeterna Casino",
    domainEnvironment:
      "an infinite casino floor where every tile and chandelier is a wager",
    domainImpact:
      "all actions become bets and he can force rerolls until opponents bankrupt their fate",
    reverseMethod:
      "Turns jackpot energy inward to restore stamina, mend fractures, and purge fatigue like chips cashed in",
    estimate: "Grade 1 disruption mastermind",
    bindingVow: {
      name: "Pit Boss Clause",
      sacrifice:
        "He must pay reparations to any civilian harmed by his gambles before placing a new bet.",
      effect:
        "When balanced, he sees the odds of every attack as floating percentages and can edit them slightly.",
      limitations: [
        "Skipping payment blinds his probability sight for an entire week.",
      ],
    },
  },
  {
    name: "Yori Kanzaki",
    gender: "Nonbinary data scribe",
    style:
      "holographic robes with streams of characters cascading down like rain",
    demeanor:
      "Detached analyst quoting footnotes even in the middle of firefights",
    origin:
      "Worked inside a Tokyo archive storing cursed case files and evidence shards",
    trauma:
      "The archive collapse buried them under data-turned-curses that tried to overwrite their name",
    mentor:
      "Iori Hazenoki taught them to weaponize documentation and narratives themselves",
    element: "data-script light",
    conduit: "floating glyph tablets orbiting their shoulders",
    techniqueHook:
      "Citation Lattice projects references that overwrite enemy techniques with redactions and caveats",
    innateHook:
      "Footnote Sight reveals every hidden condition attached to a curse, exposing forbidden clauses instantly",
    maxHook:
      "Addendum Zero erases a target's recent history, making them forget techniques and motivations",
    domainName: "Archive of Silence",
    domainEnvironment:
      "endless stacks of glowing dossiers that rearrange based on truthfulness",
    domainImpact:
      "spoken lies vanish mid-sentence, and only documented actions persist long enough to matter",
    reverseMethod:
      "Rewrites body logs to restore prior healthy states, effectively undoing recent trauma",
    estimate: "Grade 1 knowledge arbiter",
    bindingVow: {
      name: "Archivist Edict",
      sacrifice: "They must log every battle truthfully within an hour of finishing.",
      effect:
        "Their redactions become permanent seals that even special grade curses struggle to break.",
      limitations: [
        "Missing an entry causes their own name to fade from records, weakening their identity.",
      ],
    },
  },
  {
    name: "Natsume Orochi",
    gender: "Female-presenting serpent dancer",
    style:
      "emerald scales layered over flexible mesh with trailing sashes and jeweled bells",
    demeanor: "Playful duelist who taunts with riddles and acrobatic feints",
    origin:
      "Born in a traveling carnival that hid snake curses under the guise of tricks",
    trauma:
      "A patron unleashed a dragon curse that devoured the troupe mid-performance",
    mentor:
      "Choso taught her to respect blood memory and to weave venom responsibly",
    element: "serpentine blood threads",
    conduit: "twin sai that inject cursed venom and siphon energy",
    techniqueHook:
      "Ouroboros Waltz loops her body through rings of venomous blood blades, punishing anyone who chases",
    innateHook:
      "Scale Slip lets her shed skin mid-combat, slipping out of binds and leaving explosive husks behind",
    maxHook:
      "Hydra Ascension creates eight spectral heads that bite through domains with synchronized strikes",
    domainName: "Serpent Carnival",
    domainEnvironment:
      "spiraling tents dripping venom rain and echoing with calliope music",
    domainImpact:
      "foes are forced onto tightropes patrolled by spectral snakes that strike when lies are spoken",
    reverseMethod:
      "Uses still blood to weave temporary organs and patch pierced arteries while laughing",
    estimate: "Grade 2 infiltration menace",
    bindingVow: {
      name: "Carnival Remembrance",
      sacrifice:
        "She must retell the names of her troupe before unsheathing weapons in any battle.",
      effect:
        "Spectral snakes fight beside her for one minute at battle start, mirroring her motions.",
      limitations: [
        "Forgetting a name causes the spirits to abandon her and dulls her venom mid-fight.",
      ],
    },
  },
  {
    name: "Tsubasa Ryou",
    gender: "Male-presenting aerial lancer",
    style:
      "winged armor with turbine feathers that hiss softly whenever he flexes",
    demeanor:
      "Optimistic ace who cracks pilot humor even while diving through flak",
    origin: "Graduated from the clandestine Jujutsu Air Corps flight academy",
    trauma:
      "Survived a vertical crash that left him deaf for a month and terrified of silence",
    mentor:
      "Inumaki taught him succinct command phrases to coordinate squads without radio chatter",
    element: "sonic wind spears",
    conduit: "a lance with a turbine core spinning at supersonic speed",
    techniqueHook:
      "Mach Lancer pierces with supersonic cones that distort gravity and shred domains from above",
    innateHook:
      "Vector Reversal flips momentum to slingshot midair, letting him fake stalls and instant climbs",
    maxHook:
      "Stratos Breaker dives from orbit leaving a crater of sound that erases lingering curses",
    domainName: "Azure Runway",
    domainEnvironment:
      "a floating airstrip surrounded by thundercloud pylons and landing lights",
    domainImpact:
      "he controls every gust while enemies are stuck tumbling in turbulence loops of his design",
    reverseMethod:
      "Uses harmonic resonance to vibrate bones back into place and purge internal bleeding",
    estimate: "Grade 1 aerial striker",
    bindingVow: {
      name: "Pilot's Log Promise",
      sacrifice: "He must log every casualty list meticulously before sleeping.",
      effect:
        "When updated, his radar senses threats beyond line-of-sight and warns allies in advance.",
      limitations: [
        "Skipping the log grounds him for two missions and removes his radar sense.",
      ],
    },
  },
  {
    name: "Ayame Kurogiri",
    gender: "Female-presenting shadow medic",
    style:
      "a charcoal trench coat lined with medical sutures and faint bioluminescent veins",
    demeanor:
      "Warm triage expert who whispers lullabies while stitching curses closed",
    origin:
      "Operated an underground clinic for curse victims in Osaka's forgotten tunnels",
    trauma:
      "Her clinic was destroyed by a plague curse she failed to contain during a blackout",
    mentor:
      "Shoko shared forbidden regenerative rituals that require absolute composure",
    element: "void silk threads",
    conduit: "suture needles forged from swallowed shadows",
    techniqueHook:
      "Midnight Tourniquet strangles curses while sealing wounds simultaneously, trading pain between targets",
    innateHook:
      "Null Pulse dampens enemy cursed output within touching distance, letting her sedate rampaging foes",
    maxHook:
      "Eclipse Ward blankets the area, pausing all bleeding and enemy casting for ten seconds of eerie quiet",
    domainName: "Chiaroscuro Infirmary",
    domainEnvironment:
      "an endless ward lit only by bioluminescent sutures and steady heartbeats",
    domainImpact:
      "Ayame dictates who can move; enemies feel heavy sedation while allies float weightless toward her",
    reverseMethod:
      "Infuses void silk with borrowed vitality to repair organs even after catastrophic damage",
    estimate: "Grade 1 support suppressor",
    bindingVow: {
      name: "Caretaker's Binding",
      sacrifice:
        "She must treat civilians before allies whenever triage choices arise.",
      effect:
        "So long as she obeys, her wards automatically extend to cover the helpless without being asked.",
      limitations: [
        "Prioritizing an ally first locks her healing techniques for the next day.",
      ],
    },
  },
  {
    name: "Kazen Aoi",
    gender: "Nonbinary tempest sculptor",
    style:
      "a translucent cloak swirling with miniature storms and chisels that orbit their wrists",
    demeanor:
      "Impatient artist who critiques enemy form and rewrites it with gusts",
    origin:
      "Apprenticed under a Kyoto muralist who painted weather curses into public walls",
    trauma:
      "Lost their sight temporarily after painting a storm backward, forcing them to relearn depth",
    mentor:
      "A Sukuna cult defector taught them to carve air without becoming addicted to destruction",
    element: "microburst sculptures",
    conduit: "a set of floating chisels carved from storm glass",
    techniqueHook:
      "Tempest Relief carves storms into solid panels that crash like walls or shatter into razor shrapnel",
    innateHook:
      "Pressure Etching lets them engrave commands into the atmosphere, storing ambush gusts for hours",
    maxHook:
      "Cathedral of Gales summons four colossal walls that grind intruders between rotating winds",
    domainName: "Gale Atelier",
    domainEnvironment:
      "a studio of spinning storm statues and unfinished gust sketches",
    domainImpact:
      "every brushstroke becomes a binding gust, freezing foes inside sculpted air prisons",
    reverseMethod:
      "Shaves away damaged pressure from organs, letting cells inflate back to proper shape",
    estimate: "Grade 1 battlefield shaper",
    bindingVow: {
      name: "Artisan's Etiquette",
      sacrifice:
        "They must complete a sketch of each battlefield once the fight ends.",
      effect:
        "Finished sketches grant advantage the next time they battle in that location.",
      limitations: [
        "Skipping the sketch erases their stored gust commands until they spend a night drawing.",
      ],
    },
  },
  {
    name: "Eiji Morodo",
    gender: "Male-presenting geomancer",
    style:
      "a granite-lined coat with glowing tectonic seams and hovering basalt plates",
    demeanor:
      "Stoic tactician who speaks like a surveyor marking coordinates",
    origin:
      "Hails from a quarry town guarding cursed fault lines deep beneath the earth",
    trauma:
      "An earthquake curse swallowed his parents and left the town collapsing for weeks",
    mentor:
      "Kokichi Muta taught him drone-assisted targeting so his fractures spared civilians",
    element: "seismic glyphs",
    conduit: "floating basalt plates lined with copper veins",
    techniqueHook:
      "Faultline Script writes fractures under foes, popping them into the air and breaking stances",
    innateHook:
      "Tectonic Pulse hears vibrations miles away, feeding battlefield data directly into his nerves",
    maxHook:
      "Continental Divide tears the ground apart in a controlled pattern, isolating enemies on shrinking islands",
    domainName: "Seismic Cartographer",
    domainEnvironment:
      "a massive grid of floating rock slabs with glowing survey markers",
    domainImpact:
      "Eiji controls gravity vectors by rewriting tectonic maps, making footing optional",
    reverseMethod:
      "Uses low-frequency hums to accelerate bone knitting and relieve crushing pressure",
    estimate: "Grade 1 siege architect",
    bindingVow: {
      name: "Surveyor's Bond",
      sacrifice:
        "He must map safe evacuation routes before engaging or accept the civilians' fate as his own.",
      effect:
        "His fractures avoid designated safe lanes even if detonated blindly.",
      limitations: [
        "Skipping the survey makes his fractures unpredictable, endangering allies until he remaps.",
      ],
    },
  },
  {
    name: "Mika Tsukuba",
    gender: "Female-presenting sound illusionist",
    style:
      "a crystal-laced kimono that emits chimes every time she exhales and mirrors on her sleeves",
    demeanor:
      "Playful storyteller who changes voices mid-sentence to confuse enemies",
    origin:
      "Busked in subway tunnels weaponizing reverb before recruiters noticed her potential",
    trauma:
      "A subway collapse trapped her under ringing steel for two days, warping her hearing permanently",
    mentor:
      "Toge Inumaki trained her to encode layered commands inside harmonics without damaging allies",
    element: "resonant illusions",
    conduit: "a fan-shaped tuning fork that glows cobalt when unfolded",
    techniqueHook:
      "Mirage Sonata layers hallucinations over physical attacks, forcing enemies to guard phantom strikes",
    innateHook:
      "Echo Thief steals the last sound an enemy made and weaponizes it as a razor-thin scream",
    maxHook:
      "Symphony of Lies drowns senses in orchestrated hallucinations that keep evolving until she stops conducting",
    domainName: "Chorus Labyrinth",
    domainEnvironment:
      "a maze of mirrors vibrating with sound where footsteps echo forever",
    domainImpact:
      "each note rewrites perception, making allies invisible and enemies dizzy",
    reverseMethod:
      "Sings subharmonics that calm nerves, repair hearing, and reset balance",
    estimate: "Grade 2 illusion vanguard",
    bindingVow: {
      name: "Busker's Oath",
      sacrifice:
        "She must tip street musicians double whatever she earns that day.",
      effect:
        "Her illusions stay stable even under sonic countermeasures or feedback.",
      limitations: [
        "Breaking the oath causes dissonance that lashes back at her allies' ears.",
      ],
    },
  },
  {
    name: "Daisuke Kagura",
    gender: "Male-presenting ritual tactician",
    style:
      "ceremonial armor draped with festival banners and lacquered drum plates",
    demeanor:
      "Stoic priest-warrior who recites sutras as naturally as breathing",
    origin:
      "Served as shrine guardian in rural Tohoku organizing kagura exorcism dances",
    trauma:
      "A festival massacre by a curse disguised as a lion dancer pushed him into relentless duty",
    mentor:
      "A retired Kyoto headmaster taught him ritual choreography that channels entire crowds",
    element: "festival flame sigils",
    conduit: "a giant drum hammer that stores chants within its core",
    techniqueHook:
      "Rite of Kagura ignites sigils that march like dancers to strike foes in rehearsed patterns",
    innateHook:
      "Procession Sense lets him predict crowd motion and enemy placement like choreography",
    maxHook:
      "Divine Parade summons spectral troupes that trample curses while singing ancient verses",
    domainName: "Kagura Processional",
    domainEnvironment:
      "a street-length shrine path lined with lanterns and roaring drums",
    domainImpact:
      "he dictates rhythm and positioning as though directing a parade, forcing enemies into preset steps",
    reverseMethod:
      "Uses lantern fire to cauterize wounds while chanting protective sutras that soothe nerves",
    estimate: "Grade 1 procession commander",
    bindingVow: {
      name: "Festival Guardian Vow",
      sacrifice: "He must keep the shrine lanterns lit weekly no matter the weather.",
      effect:
        "Lantern flames manifest as shields around civilians when he fights within their light.",
      limitations: [
        "Letting the lanterns die weakens his sigils until every lamp is relit.",
      ],
    },
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildAppearance(template: CharacterTemplate) {
  return `${template.name} wears ${template.style}. The outfit hums with traces of ${template.element}, leaving bright motes behind every motion.`;
}

function buildPersonality(template: CharacterTemplate) {
  return `${template.demeanor}. They ground teammates by referencing the promise behind ${template.bindingVow.name} and refuse to let panic touch their tone.`;
}

function buildBackstory(template: CharacterTemplate) {
  return `${template.origin}. ${template.trauma}. ${template.mentor}.`;
}

function buildPowerSystem(template: CharacterTemplate) {
  return `Channels ${template.element} through ${template.conduit}, layering precise pressure patterns before releasing them as adaptive counters.`;
}

function buildCursedTechnique(template: CharacterTemplate) {
  return `${template.techniqueHook} The technique rewards patient setup and punishes reckless foes who underestimate the narrative she writes mid-battle.`;
}

function buildInnateTechnique(template: CharacterTemplate) {
  return `${template.innateHook} The sensation pairs with allied intel, letting them choreograph support routes that feel prophetic.`;
}

function buildMaxTechnique(template: CharacterTemplate) {
  return `${template.maxHook} Once invoked it scars the environment and taxes their body, so allies treat it as a finishing bell.`;
}

function buildDomainExpansion(template: CharacterTemplate) {
  return `${template.domainName} manifests ${template.domainEnvironment}, where ${template.domainImpact}.`;
}

function buildReverseTechnique(template: CharacterTemplate) {
  return `${template.reverseMethod} The method is deliberate but remarkably reliable even when cursed energy runs low.`;
}

function createSeeds(): CharacterSeed[] {
  return templates.map((template, index) => {
    const identity = { name: template.name, gender: template.gender };
    const energyLevel = Math.min(1300 + index * 230, 9200);
    const profile: CharacterProfileInput = {
      identity,
      appearance: buildAppearance(template),
      personality: buildPersonality(template),
      backstory: buildBackstory(template),
      powerSystem: buildPowerSystem(template),
      cursedTechnique: buildCursedTechnique(template),
      innateTechnique: buildInnateTechnique(template),
      maximumTechnique: buildMaxTechnique(template),
      domainExpansion: buildDomainExpansion(template),
      reverseTechnique: buildReverseTechnique(template),
      energyLevel,
      powerLevelEstimate: template.estimate,
      bindingVows: [
        {
          name: template.bindingVow.name,
          sacrifice: template.bindingVow.sacrifice,
          effect: template.bindingVow.effect,
          limitations: template.bindingVow.limitations,
        },
      ],
    };

    return {
      ...profile,
      userEmail: `${slugify(template.name)}-${index + 1}@demo.jjk`,
    };
  });
}

async function main() {
  const seeds = createSeeds();
  let created = 0;

  for (const seed of seeds) {
    const user = await prisma.user.upsert({
      where: { email: seed.userEmail },
      update: { name: seed.identity.name },
      create: {
        name: seed.identity.name,
        email: seed.userEmail,
      },
    });

    const insights = await getInsightsWithRetry(seed);

    await prisma.character.upsert({
      where: { userId: user.id },
      update: {
        name: seed.identity.name,
        gender: seed.identity.gender,
        appearance: seed.appearance,
        personality: seed.personality,
        backstory: seed.backstory,
        powerSystem: seed.powerSystem,
        cursedTechnique: seed.cursedTechnique,
        innateTechnique: seed.innateTechnique,
        maxTechnique: seed.maximumTechnique,
        domainExpansion: seed.domainExpansion,
        reverseTechnique: seed.reverseTechnique ?? null,
        energyLevel: seed.energyLevel,
        powerLevelEstimate: seed.powerLevelEstimate,
        grade: insights.grade,
        weaknesses: insights.weaknesses,
        balancingNotes: insights.balancingNotes ?? [],
        bindingVows: seed.bindingVows ?? [],
      },
      create: {
        userId: user.id,
        name: seed.identity.name,
        gender: seed.identity.gender,
        appearance: seed.appearance,
        personality: seed.personality,
        backstory: seed.backstory,
        powerSystem: seed.powerSystem,
        cursedTechnique: seed.cursedTechnique,
        innateTechnique: seed.innateTechnique,
        maxTechnique: seed.maximumTechnique,
        domainExpansion: seed.domainExpansion,
        reverseTechnique: seed.reverseTechnique ?? null,
        energyLevel: seed.energyLevel,
        powerLevelEstimate: seed.powerLevelEstimate,
        grade: insights.grade,
        weaknesses: insights.weaknesses,
        balancingNotes: insights.balancingNotes ?? [],
        bindingVows: seed.bindingVows ?? [],
      },
    });

    created += 1;
    console.log(
      `[${created}/${seeds.length}] ${seed.identity.name} -> ${insights.grade}`
    );
  }

  console.log(`Finished generating ${created} characters.`);
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function getInsightsWithRetry(
  seed: CharacterProfileInput,
  attempt = 1
): Promise<CharacterInsights> {
  try {
    return await generateCharacterInsights(seed);
  } catch (error) {
    const status = (error as { status?: number })?.status;
    const message = (error as Error)?.message ?? "Unknown error";

    if (status === 429 && attempt < 5) {
      const waitMs = Math.min(1000 * 2 ** attempt, 20000);
      console.warn(
        `Rate limited while generating ${seed.identity.name}. Waiting ${waitMs}ms before retry ${attempt + 1}.`
      );
      await sleep(waitMs);
      return getInsightsWithRetry(seed, attempt + 1);
    }

    console.error(
      `Gemini failed for ${seed.identity.name} on attempt ${attempt}: ${message}`
    );
    throw error;
  }
}

main()
  .catch((error) => {
    console.error("Failed to generate characters", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

