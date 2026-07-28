import bcrypt from "bcryptjs";
import { db, genId } from "./index";

function img(seed: string) {
  return `https://picsum.photos/seed/${seed}/640/640`;
}

async function deleteAll(table: string) {
  const { error } = await db.from(table).delete().neq("id", "__never_matches__");
  if (error) throw new Error(`Failed to clear ${table}: ${error.message}`);
}

async function reset() {
  // FK-safe order: children before parents.
  for (const table of [
    "returns",
    "order_items",
    "orders",
    "reviews",
    "addresses",
    "products",
    "categories",
    "coupons",
    "users",
  ]) {
    await deleteAll(table);
  }
}

async function insertAll(table: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const { error } = await db.from(table).insert(rows);
  if (error) throw new Error(`Failed to seed ${table}: ${error.message}`);
}

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

async function seed() {
  await reset();

  // --- Users -------------------------------------------------------------
  const adminPass = await bcrypt.hash("Admin@123", 10);
  const demoPass = await bcrypt.hash("Demo@123", 10);

  const adminId = genId("user");
  const demoId = genId("user");

  // A handful more customers so the admin customer list / reports look real.
  const extraCustomerSeeds = [
    { name: "Ahmed Raza", email: "ahmed@medistore.test", phone: "0301-2223344", line1: "Flat 7, Clifton Block 2", city: "Karachi", state: "Sindh", postal: "75600" },
    { name: "Fatima Noor", email: "fatima@medistore.test", phone: "0302-3334455", line1: "House 45, Model Town", city: "Lahore", state: "Punjab", postal: "54700" },
    { name: "Bilal Hussain", email: "bilal@medistore.test", phone: "0303-4445566", line1: "Street 9, G-11", city: "Islamabad", state: "Islamabad Capital Territory", postal: "44000" },
    { name: "Ayesha Malik", email: "ayesha@medistore.test", phone: "0304-5556677", line1: "House 22, DHA Phase 5", city: "Lahore", state: "Punjab", postal: "54810" },
    { name: "Usman Tariq", email: "usman@medistore.test", phone: "0305-6667788", line1: "Plot 14, Gulshan-e-Iqbal", city: "Karachi", state: "Sindh", postal: "75300" },
    { name: "Hira Shahid", email: "hira@medistore.test", phone: "0306-7778899", line1: "House 3, Sector F-8", city: "Islamabad", state: "Islamabad Capital Territory", postal: "44220" },
  ];

  const customers: { id: string; name: string; phone: string; line1: string; city: string; state: string; postal: string }[] = [
    { id: demoId, name: "Sara Khan", phone: "0300-1234567", line1: "House 12, Street 4, F-10", city: "Islamabad", state: "Islamabad Capital Territory", postal: "44000" },
    ...extraCustomerSeeds.map((c) => ({ id: genId("user"), ...c })),
  ];

  await insertAll("users", [
    { id: adminId, name: "Store Admin", email: "admin@medistore.test", password_hash: adminPass, provider: "credentials", role: "admin", email_verified: 1 },
    { id: demoId, name: "Sara Khan", email: "sara@medistore.test", password_hash: demoPass, provider: "credentials", role: "customer", email_verified: 1 },
    ...customers.slice(1).map((c, i) => ({
      id: c.id,
      name: c.name,
      email: extraCustomerSeeds[i].email,
      password_hash: demoPass,
      provider: "credentials",
      role: "customer",
      email_verified: 1,
    })),
  ]);

  await insertAll(
    "addresses",
    customers.map((c) => ({
      id: genId("addr"),
      user_id: c.id,
      full_name: c.name,
      phone: c.phone,
      line1: c.line1,
      city: c.city,
      state: c.state,
      postal_code: c.postal,
      is_default: 1,
    }))
  );

  // --- Categories ----------------------------------------------------------
  const categories = [
    { name: "Medicines", slug: "medicines", icon: "Pill", description: "OTC and prescription medicines for everyday health needs." },
    { name: "Supplements & Vitamins", slug: "supplements", icon: "Leaf", description: "Vitamins, minerals and wellness supplements." },
    { name: "Face Wash & Cleansers", slug: "face-wash", icon: "Droplets", description: "Gentle to deep-cleaning face washes for every skin type." },
    { name: "Serums & Treatments", slug: "serums", icon: "FlaskConical", description: "Targeted serums for brightening, anti-aging and hydration." },
    { name: "Cosmetics & Beauty", slug: "cosmetics", icon: "Sparkles", description: "Makeup and beauty essentials." },
  ];
  const catIds: Record<string, string> = {};
  categories.forEach((c) => {
    catIds[c.slug] = genId("cat");
  });
  await insertAll(
    "categories",
    categories.map((c, i) => ({
      id: catIds[c.slug],
      name: c.name,
      slug: c.slug,
      description: c.description,
      icon: c.icon,
      sort_order: i,
    }))
  );

  // --- Products --------------------------------------------------------
  type Seed = {
    name: string; type: string; cat: string; brand: string; price: number; compare?: number;
    stock: number; rx?: boolean; unit: string; desc: string; short: string; featured?: boolean; rating: number; reviews: number;
  };

  const products: Seed[] = [
    { name: "Panadol Extra 500mg", type: "medicine", cat: "medicines", brand: "GSK", price: 180, stock: 240, unit: "20 tablets", desc: "Fast-acting relief from headache, fever and body aches with added caffeine for enhanced effect. For adults and children over 12.", short: "Fast pain & fever relief, 20 tablets", featured: true, rating: 4.6, reviews: 128 },
    { name: "Augmentin 625mg", type: "medicine", cat: "medicines", brand: "GSK", price: 850, stock: 60, unit: "10 tablets", rx: true, desc: "Broad-spectrum antibiotic for bacterial infections. Requires a valid prescription — our pharmacist will verify before dispatch.", short: "Broad-spectrum antibiotic (Rx required)", rating: 4.4, reviews: 42 },
    { name: "Brufen 400mg", type: "medicine", cat: "medicines", brand: "Abbott", price: 210, stock: 190, unit: "30 tablets", desc: "Anti-inflammatory pain reliever for muscle pain, arthritis and menstrual cramps.", short: "Anti-inflammatory pain relief", rating: 4.3, reviews: 76 },
    { name: "ORS Rehydration Sachets", type: "medicine", cat: "medicines", brand: "Getz Pharma", price: 60, stock: 400, unit: "Pack of 10", desc: "Oral rehydration salts to restore fluids and electrolytes lost through dehydration, diarrhea or heat exhaustion.", short: "Electrolyte rehydration, pack of 10", rating: 4.7, reviews: 54 },
    { name: "Cetirizine Allergy Relief", type: "medicine", cat: "medicines", brand: "Barrett Hodgson", price: 140, stock: 220, unit: "10 tablets", desc: "Non-drowsy antihistamine for seasonal allergies, hay fever, hives and itching.", short: "Non-drowsy 24h allergy relief", rating: 4.5, reviews: 61 },
    { name: "Digital Infrared Thermometer", type: "medicine", cat: "medicines", brand: "Rossmax", price: 3200, stock: 35, unit: "1 unit", desc: "Contactless infrared thermometer with instant readings and fever alarm, suitable for the whole family.", short: "Contactless fever thermometer", rating: 4.5, reviews: 33, featured: true },

    { name: "Vitamin D3 5000IU", type: "supplement", cat: "supplements", brand: "NatureWell", price: 1450, stock: 150, unit: "60 softgels", desc: "High-potency Vitamin D3 to support bone health, immune function and mood, especially during low-sunlight months.", short: "High-potency bone & immune support", featured: true, rating: 4.8, reviews: 214 },
    { name: "Omega-3 Fish Oil 1000mg", type: "supplement", cat: "supplements", brand: "NatureWell", price: 1980, stock: 110, unit: "90 softgels", desc: "Molecularly distilled fish oil rich in EPA and DHA to support heart, brain and joint health.", short: "EPA/DHA for heart & brain health", rating: 4.7, reviews: 176 },
    { name: "Multivitamin Daily Complete", type: "supplement", cat: "supplements", brand: "VitaCore", price: 1650, stock: 130, unit: "30 tablets", desc: "A complete multivitamin covering 23 essential vitamins and minerals for everyday energy and immunity.", short: "23 vitamins & minerals, daily dose", rating: 4.5, reviews: 98 },
    { name: "Biotin 10,000mcg Hair & Nails", type: "supplement", cat: "supplements", brand: "VitaCore", price: 1350, stock: 140, unit: "60 capsules", desc: "High-strength biotin formulated to support stronger hair, healthier skin and nails.", short: "Hair, skin & nail support", featured: true, rating: 4.6, reviews: 152 },
    { name: "Magnesium Glycinate 400mg", type: "supplement", cat: "supplements", brand: "PureLeaf", price: 2100, stock: 90, unit: "60 capsules", desc: "Highly absorbable magnesium to support muscle relaxation, better sleep and nervous system health.", short: "Sleep & muscle recovery support", rating: 4.6, reviews: 87 },
    { name: "Collagen Peptides Powder", type: "supplement", cat: "supplements", brand: "PureLeaf", price: 3400, stock: 70, unit: "300g", desc: "Hydrolyzed collagen peptides that mix easily into any drink to support skin elasticity, joints and hair.", short: "Skin, joint & hair collagen support", rating: 4.7, reviews: 121 },
    { name: "Probiotic 20 Billion CFU", type: "supplement", cat: "supplements", brand: "GutBalance", price: 2650, stock: 65, unit: "30 capsules", desc: "A 6-strain probiotic blend to support digestive comfort and gut microbiome balance.", short: "6-strain gut health formula", rating: 4.4, reviews: 58 },

    { name: "Salicylic Acid Acne Face Wash", type: "facewash", cat: "face-wash", brand: "DermaPure", price: 890, stock: 160, unit: "150ml", desc: "2% salicylic acid cleanser that unclogs pores, reduces breakouts and controls excess oil without over-drying.", short: "Unclogs pores, controls breakouts", featured: true, rating: 4.6, reviews: 189 },
    { name: "Hydrating Gel Cleanser", type: "facewash", cat: "face-wash", brand: "DermaPure", price: 750, stock: 180, unit: "150ml", desc: "A soap-free gel cleanser with hyaluronic acid that cleanses without stripping the skin's moisture barrier.", short: "Soap-free, moisture-locking cleanse", rating: 4.7, reviews: 143 },
    { name: "Charcoal Deep Clean Face Wash", type: "facewash", cat: "face-wash", brand: "PureSkin", price: 680, stock: 200, unit: "120ml", desc: "Activated charcoal formula that draws out impurities, excess oil and pollution build-up for a matte finish.", short: "Detoxifying charcoal cleanse", rating: 4.4, reviews: 96 },
    { name: "Gentle Foaming Cleanser (Sensitive Skin)", type: "facewash", cat: "face-wash", brand: "DermaPure", price: 820, stock: 140, unit: "150ml", desc: "Fragrance-free, pH-balanced foaming cleanser formulated for sensitive and reactive skin types.", short: "Fragrance-free, pH-balanced formula", rating: 4.8, reviews: 112 },
    { name: "Vitamin C Brightening Face Wash", type: "facewash", cat: "face-wash", brand: "GlowLab", price: 950, stock: 120, unit: "150ml", desc: "Antioxidant-rich cleanser with stabilized vitamin C to brighten dullness and even out tone over time.", short: "Brightens dull, uneven skin tone", rating: 4.5, reviews: 84 },

    { name: "Niacinamide 10% + Zinc Serum", type: "serum", cat: "serums", brand: "GlowLab", price: 1250, stock: 175, unit: "30ml", desc: "Reduces the appearance of blemishes and pore size while balancing oil production — a daily essential for combination and oily skin.", short: "Oil control & pore refining", featured: true, rating: 4.7, reviews: 268 },
    { name: "Hyaluronic Acid 2% Hydration Serum", type: "serum", cat: "serums", brand: "GlowLab", price: 1380, stock: 150, unit: "30ml", desc: "Multi-weight hyaluronic acid that draws moisture into the skin for a plump, dewy complexion.", short: "Deep, all-day hydration", rating: 4.8, reviews: 231, featured: true },
    { name: "Vitamin C 15% Brightening Serum", type: "serum", cat: "serums", brand: "GlowLab", price: 1650, stock: 130, unit: "30ml", desc: "A stable vitamin C and ferulic acid blend that brightens, fades dark spots and boosts collagen production.", short: "Brightens & fades dark spots", rating: 4.6, reviews: 197 },
    { name: "Retinol 0.3% Renewal Serum", type: "serum", cat: "serums", brand: "DermaPure", price: 1980, stock: 95, unit: "30ml", desc: "An entry-level retinol serum that smooths fine lines and improves texture with nightly use. Start slow, patch test first.", short: "Smooths fine lines overnight", rating: 4.5, reviews: 142 },
    { name: "Alpha Arbutin + Kojic Acid Serum", type: "serum", cat: "serums", brand: "PureSkin", price: 1420, stock: 110, unit: "30ml", desc: "A targeted brightening duo that fades hyperpigmentation and post-acne marks without harsh irritation.", short: "Fades pigmentation & acne marks", rating: 4.5, reviews: 88 },

    { name: "Matte Liquid Lipstick", type: "cosmetic", cat: "cosmetics", brand: "BlushBar", price: 990, stock: 210, unit: "1 unit", desc: "Long-wear, transfer-resistant liquid lipstick with a soft-matte finish in a universally flattering shade range.", short: "Long-wear soft-matte finish", rating: 4.5, reviews: 156 },
    { name: "HD Full Coverage Foundation", type: "cosmetic", cat: "cosmetics", brand: "BlushBar", price: 1850, stock: 130, unit: "30ml", desc: "Buildable, full-coverage foundation with a natural satin finish that lasts up to 16 hours.", short: "16-hour full coverage wear", featured: true, rating: 4.6, reviews: 203 },
    { name: "Waterproof Volumizing Mascara", type: "cosmetic", cat: "cosmetics", brand: "LashLine", price: 780, stock: 240, unit: "1 unit", desc: "A smudge-proof, waterproof mascara that adds dramatic volume and length without clumping.", short: "Smudge-proof volume & length", rating: 4.4, reviews: 118 },
    { name: "Everyday Glow Highlighter Palette", type: "cosmetic", cat: "cosmetics", brand: "BlushBar", price: 1550, stock: 100, unit: "1 palette", desc: "A 4-shade highlighter palette that blends seamlessly for a natural, lit-from-within glow.", short: "4-shade natural luminous glow", rating: 4.7, reviews: 92 },
    { name: "Precision Brow Pencil Duo", type: "cosmetic", cat: "cosmetics", brand: "LashLine", price: 650, stock: 190, unit: "1 unit", desc: "Dual-ended brow pencil with a fine tip for hair-like strokes and a spoolie for effortless blending.", short: "Hair-like strokes, effortless blend", rating: 4.3, reviews: 71 },
    { name: "SPF 50+ Tinted Sunscreen", type: "cosmetic", cat: "cosmetics", brand: "GlowLab", price: 1290, stock: 160, unit: "50ml", desc: "Broad-spectrum SPF 50+ with a sheer tint that doubles as a light base — no white cast, non-greasy.", short: "Broad-spectrum SPF, no white cast", featured: true, rating: 4.8, reviews: 244 },
  ];

  const rand = (n: number) => Math.floor(Math.random() * n);
  const productIds: { id: string; price: number; cost: number; name: string; image: string; stock: number }[] = [];

  const productRows = products.map((p, i) => {
    const id = genId("prod");
    const slug = `${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
    const compare = p.compare ?? (i % 4 === 0 ? Math.round(p.price * 1.2) : null);
    // cost sits at 55-72% of retail price, varied per product for realistic margins
    const cost = Math.round(p.price * (0.55 + rand(18) / 100));
    const image = img(slug);
    productIds.push({ id, price: p.price, cost, name: p.name, image, stock: p.stock });
    return {
      id, name: p.name, slug, description: p.desc, short_description: p.short,
      category_id: catIds[p.cat], brand: p.brand, type: p.type,
      price: p.price, compare_at_price: compare, cost_price: cost, stock: p.stock,
      sku: `SKU-${1000 + i}`, unit: p.unit, image,
      images: JSON.stringify([image, img(slug + "-2")]),
      requires_prescription: p.rx ? 1 : 0,
      rating: p.rating, reviews_count: p.reviews, featured: p.featured ? 1 : 0,
      status: "active", tags: JSON.stringify([p.type, p.brand]),
    };
  });
  await insertAll("products", productRows);

  // --- Coupons -----------------------------------------------------------
  await insertAll("coupons", [
    { id: genId("cpn"), code: "WELCOME10", discount_percent: 10, active: 1 },
    { id: genId("cpn"), code: "HEALTH20", discount_percent: 20, active: 1 },
  ]);

  // --- Demo orders across the last ~45 days for analytics -----------------
  const statuses = ["delivered", "delivered", "delivered", "shipped", "processing", "pending", "cancelled"];
  const reasons = ["Damaged on arrival", "Wrong item received", "Changed my mind", "Product didn't suit me"];
  const returnStatuses = ["requested", "approved", "refunded", "rejected"];

  const orderRows: Record<string, unknown>[] = [];
  const orderItemRows: Record<string, unknown>[] = [];
  const returnRows: Record<string, unknown>[] = [];

  for (let i = 0; i < 120; i++) {
    const daysAgo = rand(45);
    const orderId = genId("order");
    const orderNumber = `MS-${10001 + i}`;
    const itemCount = 1 + rand(3);
    let subtotal = 0;
    const chosenItems: { product: (typeof productIds)[number]; qty: number; itemId: string }[] = [];
    for (let j = 0; j < itemCount; j++) {
      const product = productIds[rand(productIds.length)];
      const qty = 1 + rand(2);
      subtotal += product.price * qty;
      chosenItems.push({ product, qty, itemId: genId("item") });
    }
    const discount = i % 5 === 0 ? Math.round(subtotal * 0.1) : 0;
    const shipping = subtotal > 3000 ? 0 : 200;
    const total = subtotal - discount + shipping;
    const status = statuses[rand(statuses.length)];
    const customer = customers[rand(customers.length)];
    const createdAt = daysAgoIso(daysAgo);

    orderRows.push({
      id: orderId, order_number: orderNumber, user_id: customer.id, status,
      payment_method: i % 3 === 0 ? "card" : "cod",
      payment_status: status === "cancelled" ? "unpaid" : i % 3 === 0 ? "paid" : "unpaid",
      subtotal, discount, shipping_fee: shipping, total,
      full_name: customer.name, phone: customer.phone,
      address_line1: customer.line1, city: customer.city, state: customer.state, postal_code: customer.postal,
      created_at: createdAt, updated_at: createdAt,
    });

    for (const { product, qty, itemId } of chosenItems) {
      orderItemRows.push({
        id: itemId, order_id: orderId, product_id: product.id, name: product.name,
        image: product.image, price: product.price, quantity: qty, cost_price: product.cost,
      });
    }

    // occasional return/refund request on delivered orders
    if (status === "delivered" && i % 6 === 0) {
      const firstItem = chosenItems[0];
      const rStatus = returnStatuses[rand(returnStatuses.length)];
      returnRows.push({
        id: genId("ret"), return_number: `RT-${5001 + i}`, order_id: orderId,
        order_item_id: firstItem.itemId, user_id: customer.id,
        reason: reasons[rand(reasons.length)],
        comment: "Requesting a refund for this item.",
        quantity: 1, status: rStatus, refund_amount: firstItem.product.price,
        created_at: daysAgoIso(Math.max(daysAgo - 2, 0)),
        resolved_at:
          rStatus === "refunded" || rStatus === "approved" || rStatus === "rejected"
            ? new Date().toISOString()
            : null,
      });
    }
  }

  await insertAll("orders", orderRows);
  await insertAll("order_items", orderItemRows);
  await insertAll("returns", returnRows);

  console.log("Seed complete:");
  console.log(`  Admin login:  admin@medistore.test / Admin@123`);
  console.log(`  Demo login:   sara@medistore.test / Demo@123 (all seeded customers share this password)`);
  console.log(`  Categories: ${categories.length}, Products: ${products.length}, Customers: ${customers.length}`);
}

seed().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
