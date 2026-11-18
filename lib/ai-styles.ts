// Haircuts offered in the photo-real AI try-on. Each one has a precise description the image model follows,
// plus the menu category it books into. Kept free of server-only imports so the client can list them.
export type AiStyle = { id: string; name: string; who: "women" | "men"; service: string; prompt: string };

export const AI_STYLES: AiStyle[] = [
  // women
  { id: "long-layers", who: "women", service: "cuts", name: "Long layers", prompt: "long, glossy hair falling well past the shoulders with soft face-framing layers and a gentle bend at the ends" },
  { id: "beach-waves", who: "women", service: "cuts", name: "Beach waves", prompt: "shoulder-to-chest length hair styled in loose, lived-in beach waves with a slightly tousled texture" },
  { id: "lob", who: "women", service: "cuts", name: "Collarbone lob", prompt: "a sleek long bob that grazes the collarbone, with a deep side part and a soft bend" },
  { id: "bob-fringe", who: "women", service: "cuts", name: "Blunt bob & fringe", prompt: "a chin-length blunt bob with a full straight fringe that sits just above the eyebrows" },
  { id: "pixie", who: "women", service: "cuts", name: "Textured pixie", prompt: "a short textured pixie cut, slightly longer and swept on top, neat around the ears and nape" },
  { id: "curtain-shag", who: "women", service: "cuts", name: "Shag & curtain bangs", prompt: "a choppy layered shag cut with centre-parted curtain bangs framing the face" },
  { id: "big-curls", who: "women", service: "treatments", name: "Big natural curls", prompt: "voluminous, defined natural curls with a rounded shape and a diffused, frizz-free finish" },
  { id: "sleek-bun", who: "women", service: "cuts", name: "Sleek top bun", prompt: "hair pulled smoothly back into a polished high top bun, with a clean, glossy finish" },
  { id: "balayage", who: "women", service: "highlights", name: "Honey balayage", prompt: "long soft waves with a hand-painted honey-blonde balayage, darker natural roots blending into lighter ends" },
  // men
  { id: "quiff", who: "men", service: "him", name: "Textured quiff", prompt: "a men's textured quiff with volume swept up at the front, short tidy sides" },
  { id: "crop-fade", who: "men", service: "him", name: "French crop & skin fade", prompt: "a men's French crop with a short textured fringe on top and a clean high skin fade on the sides" },
  { id: "side-part", who: "men", service: "him", name: "Classic side part", prompt: "a classic men's side-part haircut, neatly combed with a defined part and a tapered back and sides" },
  { id: "slick-back", who: "men", service: "him", name: "Slicked back", prompt: "a men's slicked-back undercut, medium length on top combed straight back with a light shine, short sides" },
  { id: "curly-fade", who: "men", service: "him", name: "Curly top & fade", prompt: "defined curls on top with a mid fade blended down the sides and back" },
  { id: "buzz", who: "men", service: "him", name: "Buzz cut", prompt: "a short, even men's buzz cut with a crisp hairline" },
  { id: "pompadour", who: "men", service: "him", name: "Pompadour", prompt: "a men's pompadour with height and volume combed up and back at the front, tapered sides" },
  { id: "flow", who: "men", service: "him", name: "Medium flow", prompt: "men's medium-length hair with natural flow, tucked behind the ears and just touching the collar" },
  { id: "beard-fade", who: "men", service: "him", name: "Fade & groomed beard", prompt: "a short tapered men's haircut with a mid fade, plus a neatly groomed, shaped full beard" },
];

export const AI_COLOURS = [
  { id: "natural", name: "Keep my colour", text: "" },
  { id: "espresso", name: "Espresso brown", text: "a rich espresso-brown" },
  { id: "soft-black", name: "Soft black", text: "a soft natural black" },
  { id: "chestnut", name: "Chestnut", text: "a warm chestnut-brown" },
  { id: "copper", name: "Copper", text: "a vivid copper-red" },
  { id: "cherry", name: "Cherry red", text: "a deep cherry red" },
  { id: "honey", name: "Honey blonde", text: "a warm honey blonde" },
  { id: "platinum", name: "Platinum", text: "an icy platinum blonde" },
  { id: "silver", name: "Silver", text: "a polished silver-grey" },
];
