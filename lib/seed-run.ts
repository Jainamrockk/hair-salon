import { CLIENTS, DEFAULT_HOURS, DEFAULT_RULES, DEFAULT_SITE, PRODUCTS, REVIEWS, SERVICES } from "./seed";
import { addDays, localDate, localToUtc, weekdayKey } from "./time";

type Exec = (text: string, params?: unknown[]) => Promise<Record<string, any>[]>;

export async function seed(exec: Exec) {
  const set = (k: string, v: unknown) =>
    exec(`INSERT INTO settings (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [k, JSON.stringify(v)]);
  await set("hours", DEFAULT_HOURS);
  await set("rules", DEFAULT_RULES);
  await set("site", DEFAULT_SITE);

  let sort = 0;
  for (const [category, name, dur, cents, label, note] of SERVICES) {
    await exec(`INSERT INTO services (category, name, duration_min, price_cents, price_label, note, sort) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [category, name, dur, cents, label ?? null, note ?? null, sort++]);
  }
  for (const pr of PRODUCTS) {
    await exec(`INSERT INTO products (slug, sku, brand, name, category, size, price_cents, image, description, how_to, stock) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [pr.slug, pr.sku, pr.brand, pr.name, pr.category, pr.size, pr.price, pr.img, pr.description, pr.how, 6 + (pr.price % 7)]);
  }
  const clientIds: number[] = [];
  for (const [f, l, phone, email, notes, allergies] of CLIENTS) {
    const r = await exec(`INSERT INTO clients (first_name, last_name, phone, email, notes, allergies, created_at) VALUES ($1,$2,$3,$4,$5,$6, NOW() - INTERVAL '150 days') RETURNING id`,
      [f, l, phone, email, notes, allergies || null]);
    clientIds.push(r[0].id);
  }
  let d = 0;
  for (const [author, rating, body, service] of REVIEWS) {
    await exec(`INSERT INTO reviews (author, rating, body, service, created_at) VALUES ($1,$2,$3,$4, NOW() - ($5 || ' days')::interval)`,
      [author, rating, body, service, String(2 + d * 9)]);
    d++;
  }
  const svc = await exec(`SELECT id, name, category, duration_min, price_cents FROM services`);
  const by = (n: string) => svc.find((s) => s.name === n)!;
  const today = localDate();
  const plan: [number, number, number, string[], string?][] = [
    // [dayOffset, startMinutes, clientIdx, services, status]
    [0, 630, 0, ["Color", "Gloss deep conditioning"]],
    [0, 780, 1, ["Highlights, two colors"]],
    [0, 930, 2, ["Men's haircut & style", "Beard trim"]],
    [0, 1050, 3, ["Root retouch & quick blow dry"], "pending"],
    [1, 660, 4, ["Color", "Toner"]],
    [1, 900, 5, ["Roller set"]],
    [2, 600, 2, ["Men's haircut & style"]],
    [3, 720, 1, ["Women's haircut & full style"]],
    [5, 660, 0, ["Brow wax", "Lip wax"]],
    [-1, 660, 5, ["Shampoo set & style"], "completed"],
    [-2, 630, 4, ["Color"], "completed"],
    [-2, 840, 2, ["Men's haircut & style", "Beard trim"], "completed"],
    [-3, 720, 0, ["Women's haircut & full style"], "completed"],
    [-4, 700, 3, ["Root retouch & quick blow dry"], "completed"],
    [-5, 660, 1, ["Partial highlights, two colors"], "completed"],
    [-6, 900, 5, ["Roller set"], "completed"],
    [-8, 630, 4, ["Color", "Gloss deep conditioning"], "completed"],
    [-9, 780, 0, ["Deep conditioning with botanical oil"], "completed"],
    [-10, 720, 2, ["Men's haircut & style"], "no_show"],
  ];
  for (const [off, start, ci, names, status] of plan) {
    const date = addDays(today, off);
    if (weekdayKey(date) === "sun") continue;
    const items = names.map(by);
    const dur = items.reduce((a, s) => a + s.duration_min, 0);
    const total = items.reduce((a, s) => a + s.price_cents, 0);
    const st = status ?? "confirmed";
    await exec(
      `INSERT INTO appointments (client_id, starts_at, ends_at, status, service_ids, service_names, category, total_cents, deposit_cents, paid_cents, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, NOW() - INTERVAL '5 days')`,
      [clientIds[ci], localToUtc(date, start).toISOString(), localToUtc(date, start + dur).toISOString(), st,
        items.map((s) => s.id), items.map((s) => s.name).join(" + "), items[0].category, total,
        dur >= 90 ? 2000 : 0, st === "completed" ? total : dur >= 90 ? 2000 : 0],
    );
  }
  await exec(`INSERT INTO requests (kind, name, phone, service, preferred, notes) VALUES
    ('after_hours','Kelsey Hart','2085550160','Highlights, two colors','Thu after 7 PM','Work until 6:30 in Boise.'),
    ('waitlist','Ana Ruiz','2085550120','Color',NULL,NULL)`);
  await exec(`UPDATE requests SET days = ARRAY['tue','wed'], times = ARRAY['morning'] WHERE kind = 'waitlist'`);
  await exec(`INSERT INTO orders (name, phone, items, total_cents, status) VALUES
    ('Jenna Albright','2085550133', $1::jsonb, 7000, 'reserved'),
    ('Rosa Medina','2085550199', $2::jsonb, 2400, 'ready')`,
    [JSON.stringify([{ slug: "botanical-hair-oil", name: "Ekklesia Botanical Hair Oil", qty: 1, price: 3200 }, { slug: "restorative-mask", name: "Hair Evolution Restorative Mask", qty: 1, price: 3800 }]),
     JSON.stringify([{ slug: "smoothing-conditioner", name: "Rusk Smoothing Conditioner", qty: 1, price: 2400 }])]);
  await exec(`INSERT INTO messages (client_id, sender, body, read, created_at) VALUES
    ($1,'client','Hi Lee! Could we go a touch darker this time? Thinking cozy winter brunette.', false, NOW() - INTERVAL '3 hours'),
    ($1,'salon','Love that. We will do a 5N with a gloss — see you Tuesday!', true, NOW() - INTERVAL '2 hours'),
    ($2,'client','Running about 10 minutes late, so sorry!', false, NOW() - INTERVAL '20 minutes')`,
    [clientIds[0], clientIds[1]]);
  await exec(`INSERT INTO gift_cards (code, amount_cents, balance_cents, buyer_name, to_name, note) VALUES ('CHE-GIFT-2026', 5000, 5000, 'Demo', 'Friend', 'Happy birthday!')`);
}
