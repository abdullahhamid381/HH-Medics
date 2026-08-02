// Adds a parallel "browse by condition" taxonomy (25 categories) on top of
// the existing catalog, populated with retail-appropriate medicines drawn
// from the WHO Model List of Essential Medicines (23rd List, 2023).
//
// Deliberately excludes anything hospital-only, injectable-only, controlled,
// or cytotoxic (chemotherapy agents, IV anaesthetics, opioids, vaccines,
// blood products) — this app has no prescription-verification step, so
// `requires_prescription` is a display badge only, not a checkout gate.
// Selling those categories of medicine through an unverified checkout isn't
// something this script does, regardless of the badge.
//
// Purely additive: never deletes or modifies existing categories/products.
import { db, genId } from "./index";

function img(seed: string) {
  return `https://picsum.photos/seed/${seed}/640/640`;
}

type Seed = {
  name: string;
  brand: string;
  price: number;
  stock: number;
  unit: string;
  desc: string;
  short: string;
  rx?: boolean;
  rating: number;
  reviews: number;
};

type ConditionCategory = {
  name: string;
  slug: string;
  icon: string;
  description: string;
  products: Seed[];
};

const CATEGORIES: ConditionCategory[] = [
  {
    name: "Eye Conditions",
    slug: "eye-conditions",
    icon: "Eye",
    description: "Eye drops and ointments for common eye infections and conditions.",
    products: [
      { name: "Ofloxacin Eye Drops 0.3%", brand: "Generic", price: 320, stock: 80, unit: "5ml bottle", desc: "Antibacterial eye drops for bacterial conjunctivitis and keratitis.", short: "Antibacterial eye drops", rx: true, rating: 4.3, reviews: 22 },
      { name: "Tetracycline Eye Ointment 1%", brand: "Generic", price: 210, stock: 60, unit: "5g tube", desc: "Antibacterial eye ointment for blepharitis, conjunctivitis and trachoma.", short: "Antibacterial eye ointment", rx: true, rating: 4.1, reviews: 15 },
      { name: "Timolol Eye Drops 0.5%", brand: "Generic", price: 380, stock: 40, unit: "5ml bottle", desc: "Beta-blocker eye drops used to reduce eye pressure in glaucoma.", short: "Glaucoma eye pressure control", rx: true, rating: 4.4, reviews: 18 },
    ],
  },
  {
    name: "Infections",
    slug: "infections",
    icon: "Bug",
    description: "Oral antibiotics and antimicrobials for common bacterial infections.",
    products: [
      { name: "Amoxicillin 500mg Capsules", brand: "Generic", price: 260, stock: 150, unit: "20 capsules", desc: "Broad-spectrum antibiotic for respiratory, ear and urinary infections.", short: "Broad-spectrum antibiotic", rx: true, rating: 4.5, reviews: 64 },
      { name: "Azithromycin 500mg Tablets", brand: "Generic", price: 340, stock: 100, unit: "3 tablets", desc: "Short-course antibiotic for respiratory and skin infections.", short: "3-day course antibiotic", rx: true, rating: 4.6, reviews: 58 },
      { name: "Ciprofloxacin 500mg Tablets", brand: "Generic", price: 220, stock: 110, unit: "10 tablets", desc: "Antibiotic for urinary tract and gastrointestinal infections.", short: "UTI & GI infection antibiotic", rx: true, rating: 4.3, reviews: 41 },
      { name: "Metronidazole 400mg Tablets", brand: "Generic", price: 150, stock: 130, unit: "20 tablets", desc: "Antibiotic and antiprotozoal for anaerobic and parasitic infections.", short: "Anaerobic infection treatment", rx: true, rating: 4.2, reviews: 33 },
    ],
  },
  {
    name: "Heart Conditions",
    slug: "heart-conditions",
    icon: "HeartPulse",
    description: "Oral medicines for blood pressure, cholesterol and heart rhythm management.",
    products: [
      { name: "Amlodipine 5mg Tablets", brand: "Generic", price: 190, stock: 140, unit: "30 tablets", desc: "Calcium channel blocker for high blood pressure and angina.", short: "Blood pressure control", rx: true, rating: 4.5, reviews: 72 },
      { name: "Bisoprolol 5mg Tablets", brand: "Generic", price: 240, stock: 100, unit: "30 tablets", desc: "Beta-blocker for hypertension, angina and heart failure.", short: "Heart rate & BP control", rx: true, rating: 4.4, reviews: 47 },
      { name: "Simvastatin 20mg Tablets", brand: "Generic", price: 310, stock: 90, unit: "30 tablets", desc: "Statin for lowering high cholesterol and cardiovascular risk.", short: "Cholesterol-lowering statin", rx: true, rating: 4.3, reviews: 39 },
      { name: "Isosorbide Dinitrate 5mg Sublingual", brand: "Generic", price: 180, stock: 70, unit: "25 tablets", desc: "Fast-acting sublingual tablet for angina attacks.", short: "Angina relief, sublingual", rx: true, rating: 4.2, reviews: 21 },
    ],
  },
  {
    name: "Pain Arthritis",
    slug: "pain-arthritis",
    icon: "Bone",
    description: "Pain relief and anti-inflammatory medicines for everyday aches and arthritis.",
    products: [
      { name: "Ibuprofen 400mg Tablets", brand: "Generic", price: 150, stock: 260, unit: "20 tablets", desc: "Anti-inflammatory relief for muscle pain, arthritis and menstrual cramps.", short: "Anti-inflammatory pain relief", rating: 4.4, reviews: 88 },
      { name: "Paracetamol 500mg Tablets", brand: "Generic", price: 90, stock: 300, unit: "20 tablets", desc: "Everyday relief from headache, fever and mild-to-moderate pain.", short: "Fever & pain relief", rating: 4.6, reviews: 110 },
      { name: "Acetylsalicylic Acid 300mg Tablets", brand: "Generic", price: 100, stock: 200, unit: "20 tablets", desc: "Pain, fever and inflammation relief; also used for low-dose cardioprotection.", short: "Pain & inflammation relief", rating: 4.1, reviews: 36 },
      { name: "Allopurinol 100mg Tablets", brand: "Generic", price: 200, stock: 90, unit: "30 tablets", desc: "Reduces uric acid to prevent gout flare-ups.", short: "Gout prevention", rx: true, rating: 4.3, reviews: 27 },
    ],
  },
  {
    name: "Lung Disorders",
    slug: "lung-disorders",
    icon: "Wind",
    description: "Inhalers and respiratory medicines for asthma and COPD.",
    products: [
      { name: "Salbutamol Inhaler 100mcg", brand: "Generic", price: 420, stock: 70, unit: "1 inhaler", desc: "Fast-acting reliever inhaler for asthma and COPD symptoms.", short: "Fast-acting asthma reliever", rx: true, rating: 4.6, reviews: 53 },
      { name: "Budesonide Inhaler 200mcg", brand: "Generic", price: 650, stock: 45, unit: "1 inhaler", desc: "Corticosteroid preventer inhaler for long-term asthma control.", short: "Asthma preventer inhaler", rx: true, rating: 4.4, reviews: 31 },
      { name: "Ipratropium Bromide Inhaler", brand: "Generic", price: 480, stock: 40, unit: "1 inhaler", desc: "Bronchodilator inhaler used for COPD symptom relief.", short: "COPD bronchodilator", rx: true, rating: 4.2, reviews: 19 },
    ],
  },
  {
    name: "Other Medicines",
    slug: "other-medicines",
    icon: "Package",
    description: "Everyday essential supplements and general-use medicines.",
    products: [
      { name: "Folic Acid 5mg Tablets", brand: "Generic", price: 80, stock: 200, unit: "30 tablets", desc: "Folic acid supplement for anaemia support and general health.", short: "Folic acid supplement", rating: 4.5, reviews: 40 },
      { name: "Ferrous Sulfate 200mg Tablets", brand: "Generic", price: 110, stock: 180, unit: "30 tablets", desc: "Iron supplement for iron-deficiency anaemia.", short: "Iron supplement", rating: 4.3, reviews: 35 },
      { name: "Zinc Sulfate 20mg Tablets", brand: "Generic", price: 95, stock: 160, unit: "20 tablets", desc: "Zinc supplement supporting immunity and recovery from diarrhoea.", short: "Zinc supplement", rating: 4.2, reviews: 24 },
    ],
  },
  {
    name: "Kidney Disease",
    slug: "kidney-disease",
    icon: "Droplet",
    description: "Diuretics and medicines for managing fluid balance and kidney-related conditions.",
    products: [
      { name: "Furosemide 40mg Tablets", brand: "Generic", price: 130, stock: 100, unit: "20 tablets", desc: "Loop diuretic for fluid retention linked to kidney or heart conditions.", short: "Fluid retention relief", rx: true, rating: 4.2, reviews: 28 },
      { name: "Spironolactone 25mg Tablets", brand: "Generic", price: 210, stock: 80, unit: "30 tablets", desc: "Potassium-sparing diuretic for fluid retention and heart failure.", short: "Potassium-sparing diuretic", rx: true, rating: 4.1, reviews: 20 },
      { name: "Amiloride 5mg Tablets", brand: "Generic", price: 170, stock: 70, unit: "30 tablets", desc: "Diuretic that helps the body retain potassium while reducing fluid.", short: "Fluid balance support", rx: true, rating: 4.0, reviews: 14 },
    ],
  },
  {
    name: "Liver Disease",
    slug: "liver-disease",
    icon: "Activity",
    description: "Oral medicines for chronic hepatitis and liver support.",
    products: [
      { name: "Entecavir 0.5mg Tablets", brand: "Generic", price: 890, stock: 30, unit: "30 tablets", desc: "Antiviral tablet for chronic hepatitis B management.", short: "Hepatitis B antiviral", rx: true, rating: 4.4, reviews: 12 },
      { name: "Tenofovir Disoproxil Fumarate 300mg", brand: "Generic", price: 950, stock: 28, unit: "30 tablets", desc: "Antiviral tablet used for chronic hepatitis B treatment.", short: "Hepatitis B antiviral", rx: true, rating: 4.3, reviews: 10 },
      { name: "Lactulose Oral Solution", brand: "Generic", price: 260, stock: 60, unit: "200ml bottle", desc: "Oral solution used to support digestion and bowel regularity.", short: "Digestive support solution", rating: 4.1, reviews: 17 },
    ],
  },
  {
    name: "Bone Metabolism",
    slug: "bone-metabolism",
    icon: "Bone",
    description: "Calcium and vitamin D supplements for bone health.",
    products: [
      { name: "Calcium 500mg Tablets", brand: "Generic", price: 150, stock: 200, unit: "30 tablets", desc: "Elemental calcium supplement supporting bone strength.", short: "Bone health calcium supplement", rating: 4.5, reviews: 60 },
      { name: "Vitamin D3 1000IU Tablets", brand: "Generic", price: 180, stock: 180, unit: "30 tablets", desc: "Vitamin D3 supplement supporting calcium absorption and bone health.", short: "Vitamin D3 supplement", rating: 4.6, reviews: 71 },
      { name: "Calcium + Vitamin D3 Combo Tablets", brand: "Generic", price: 260, stock: 120, unit: "30 tablets", desc: "Combined calcium and vitamin D3 for daily bone support.", short: "Calcium + D3 combo", rating: 4.5, reviews: 44 },
    ],
  },
  {
    name: "ENT",
    slug: "ent",
    icon: "Ear",
    description: "Medicines for ear, nose and throat conditions.",
    products: [
      { name: "Xylometazoline Nasal Spray 0.05%", brand: "Generic", price: 160, stock: 150, unit: "10ml bottle", desc: "Decongestant nasal spray for blocked nose relief.", short: "Nasal decongestant spray", rating: 4.3, reviews: 45 },
      { name: "Budesonide Nasal Spray", brand: "Generic", price: 480, stock: 60, unit: "10ml bottle", desc: "Corticosteroid nasal spray for allergic rhinitis and sinus symptoms.", short: "Allergy nasal spray", rx: true, rating: 4.4, reviews: 29 },
      { name: "Ciprofloxacin Ear Drops 0.3%", brand: "Generic", price: 240, stock: 55, unit: "5ml bottle", desc: "Antibacterial ear drops for outer and middle ear infections.", short: "Ear infection drops", rx: true, rating: 4.2, reviews: 16 },
    ],
  },
  {
    name: "Energy Hydration",
    slug: "energy-hydration",
    icon: "GlassWater",
    description: "Rehydration salts and vitamins for energy and fluid balance.",
    products: [
      { name: "Oral Rehydration Salts (ORS)", brand: "Generic", price: 60, stock: 300, unit: "Sachet, 1L", desc: "WHO-formula rehydration salts to restore fluids and electrolytes.", short: "Rehydration salts", rating: 4.7, reviews: 95 },
      { name: "Ascorbic Acid (Vitamin C) 50mg Tablets", brand: "Generic", price: 100, stock: 220, unit: "30 tablets", desc: "Vitamin C supplement supporting immunity and energy metabolism.", short: "Vitamin C supplement", rating: 4.5, reviews: 66 },
      { name: "ORS + Zinc Sulfate Co-Pack", brand: "Generic", price: 110, stock: 140, unit: "Co-pack", desc: "Rehydration salts paired with zinc for diarrhoea recovery support.", short: "Rehydration + zinc co-pack", rating: 4.6, reviews: 38 },
    ],
  },
  {
    name: "Skin Conditions",
    slug: "skin-conditions",
    icon: "Sparkles",
    description: "Creams and ointments for common skin conditions.",
    products: [
      { name: "Hydrocortisone Cream 1%", brand: "Generic", price: 190, stock: 130, unit: "15g tube", desc: "Mild corticosteroid cream for eczema and skin irritation.", short: "Mild anti-itch cream", rating: 4.4, reviews: 52 },
      { name: "Betamethasone Cream 0.1%", brand: "Generic", price: 250, stock: 90, unit: "15g tube", desc: "Corticosteroid cream for more persistent skin inflammation.", short: "Stronger anti-inflammatory cream", rx: true, rating: 4.3, reviews: 34 },
      { name: "Clotrimazole Cream 1%", brand: "Generic", price: 170, stock: 140, unit: "20g tube", desc: "Antifungal cream for ringworm, athlete's foot and yeast infections.", short: "Antifungal skin cream", rating: 4.5, reviews: 61 },
      { name: "Miconazole Cream 2%", brand: "Generic", price: 180, stock: 110, unit: "20g tube", desc: "Antifungal cream for common fungal skin infections.", short: "Antifungal skin cream", rating: 4.3, reviews: 29 },
    ],
  },
  {
    name: "Blood Disorder",
    slug: "blood-disorder",
    icon: "Droplets",
    description: "Supplements and oral medicines supporting blood health.",
    products: [
      { name: "Ferrous Salt + Folic Acid Tablets", brand: "Generic", price: 130, stock: 170, unit: "30 tablets", desc: "Combined iron and folic acid supplement for anaemia support.", short: "Iron + folic acid supplement", rating: 4.5, reviews: 48 },
      { name: "Folic Acid 5mg Tablets", brand: "Generic", price: 80, stock: 200, unit: "30 tablets", desc: "Folic acid supplement supporting healthy red blood cell production.", short: "Folic acid supplement", rating: 4.4, reviews: 33 },
      { name: "Hydroxyurea 500mg Capsules", brand: "Generic", price: 420, stock: 40, unit: "20 capsules", desc: "Oral capsule used long-term in sickle cell disease management.", short: "Sickle cell disease management", rx: true, rating: 4.1, reviews: 9 },
    ],
  },
  {
    name: "Gastrointestinal Diseases",
    slug: "gastrointestinal-diseases",
    icon: "Salad",
    description: "Medicines for acid reflux, ulcers and digestive conditions.",
    products: [
      { name: "Omeprazole 20mg Capsules", brand: "Generic", price: 190, stock: 160, unit: "14 capsules", desc: "Proton pump inhibitor for acid reflux, heartburn and ulcers.", short: "Acid reflux relief", rx: true, rating: 4.6, reviews: 77 },
      { name: "Ranitidine 150mg Tablets", brand: "Generic", price: 140, stock: 100, unit: "20 tablets", desc: "H2-receptor blocker reducing stomach acid production.", short: "Stomach acid reducer", rx: true, rating: 4.2, reviews: 26 },
      { name: "Sulfasalazine 500mg Tablets", brand: "Generic", price: 310, stock: 55, unit: "30 tablets", desc: "Anti-inflammatory used for inflammatory bowel conditions.", short: "IBD anti-inflammatory", rx: true, rating: 4.0, reviews: 13 },
    ],
  },
  {
    name: "Stomach And Bowels Disorders",
    slug: "stomach-bowels-disorders",
    icon: "Utensils",
    description: "Relief for diarrhoea, constipation, nausea and bowel discomfort.",
    products: [
      { name: "Loperamide 2mg Capsules", brand: "Generic", price: 100, stock: 180, unit: "10 capsules", desc: "Fast relief from acute diarrhoea symptoms.", short: "Anti-diarrhoeal", rating: 4.4, reviews: 54 },
      { name: "Senna 7.5mg Tablets", brand: "Generic", price: 90, stock: 150, unit: "20 tablets", desc: "Gentle stimulant laxative for occasional constipation.", short: "Laxative tablets", rating: 4.2, reviews: 31 },
      { name: "Metoclopramide 10mg Tablets", brand: "Generic", price: 120, stock: 90, unit: "20 tablets", desc: "Relieves nausea, vomiting and indigestion.", short: "Nausea relief", rx: true, rating: 4.1, reviews: 22 },
      { name: "Ondansetron 4mg Tablets", brand: "Generic", price: 220, stock: 70, unit: "10 tablets", desc: "Effective relief from nausea and vomiting.", short: "Anti-nausea tablets", rx: true, rating: 4.5, reviews: 37 },
    ],
  },
  {
    name: "Endocrine Diseases",
    slug: "endocrine-diseases",
    icon: "Gauge",
    description: "Oral medicines for diabetes and thyroid conditions.",
    products: [
      { name: "Metformin 500mg Tablets", brand: "Generic", price: 130, stock: 200, unit: "30 tablets", desc: "First-line oral medicine for type 2 diabetes management.", short: "Type 2 diabetes control", rx: true, rating: 4.6, reviews: 83 },
      { name: "Gliclazide 60mg Tablets", brand: "Generic", price: 210, stock: 110, unit: "30 tablets", desc: "Oral medicine helping the body release more insulin.", short: "Blood sugar control", rx: true, rating: 4.3, reviews: 40 },
      { name: "Levothyroxine 100mcg Tablets", brand: "Generic", price: 150, stock: 130, unit: "30 tablets", desc: "Thyroid hormone replacement for underactive thyroid.", short: "Thyroid hormone replacement", rx: true, rating: 4.5, reviews: 51 },
      { name: "Methimazole 10mg Tablets", brand: "Generic", price: 180, stock: 70, unit: "30 tablets", desc: "Reduces thyroid hormone production in overactive thyroid.", short: "Overactive thyroid treatment", rx: true, rating: 4.1, reviews: 18 },
    ],
  },
  {
    name: "Memory Disorder",
    slug: "memory-disorder",
    icon: "Brain",
    description: "Vitamin support for nerve and cognitive health.",
    products: [
      { name: "Pyridoxine (Vitamin B6) 25mg Tablets", brand: "Generic", price: 90, stock: 160, unit: "30 tablets", desc: "Vitamin B6 supplement supporting nerve function.", short: "Nerve health supplement", rating: 4.3, reviews: 28 },
      { name: "Thiamine (Vitamin B1) 50mg Tablets", brand: "Generic", price: 95, stock: 150, unit: "30 tablets", desc: "Vitamin B1 supplement supporting nervous system health.", short: "Nervous system support", rating: 4.2, reviews: 21 },
    ],
  },
  {
    name: "Brain Disorders",
    slug: "brain-disorders",
    icon: "BrainCog",
    description: "Antiseizure and neurological medicines.",
    products: [
      { name: "Carbamazepine 200mg Tablets", brand: "Generic", price: 210, stock: 80, unit: "30 tablets", desc: "Antiseizure medicine for epilepsy management.", short: "Antiseizure medicine", rx: true, rating: 4.2, reviews: 24 },
      { name: "Sodium Valproate 200mg Tablets", brand: "Generic", price: 240, stock: 70, unit: "30 tablets", desc: "Antiseizure medicine used for epilepsy and bipolar disorder.", short: "Antiseizure medicine", rx: true, rating: 4.1, reviews: 19 },
      { name: "Levetiracetam 500mg Tablets", brand: "Generic", price: 380, stock: 55, unit: "30 tablets", desc: "Modern antiseizure medicine for epilepsy management.", short: "Antiseizure medicine", rx: true, rating: 4.4, reviews: 22 },
    ],
  },
  {
    name: "Movement Disorders",
    slug: "movement-disorders",
    icon: "Footprints",
    description: "Medicines for Parkinson's disease and movement conditions.",
    products: [
      { name: "Levodopa + Carbidopa 100mg/25mg Tablets", brand: "Generic", price: 420, stock: 40, unit: "30 tablets", desc: "Standard oral treatment for Parkinson's disease symptoms.", short: "Parkinson's disease treatment", rx: true, rating: 4.3, reviews: 15 },
      { name: "Biperiden 2mg Tablets", brand: "Generic", price: 190, stock: 45, unit: "30 tablets", desc: "Helps manage tremor and stiffness in parkinsonism.", short: "Tremor & stiffness relief", rx: true, rating: 4.0, reviews: 10 },
    ],
  },
  {
    name: "Surgery",
    slug: "surgery",
    icon: "Stethoscope",
    description: "Antiseptics and pre/post-surgical care essentials.",
    products: [
      { name: "Povidone Iodine Solution 10%", brand: "Generic", price: 150, stock: 200, unit: "100ml bottle", desc: "Antiseptic solution for skin disinfection before and after minor procedures.", short: "Antiseptic solution", rating: 4.6, reviews: 70 },
      { name: "Chlorhexidine Solution 5%", brand: "Generic", price: 170, stock: 160, unit: "100ml bottle", desc: "Antiseptic solution for skin and wound cleaning.", short: "Antiseptic wound cleaner", rating: 4.5, reviews: 58 },
      { name: "Amoxicillin + Clavulanic Acid Tablets", brand: "Generic", price: 480, stock: 70, unit: "10 tablets", desc: "Antibiotic commonly used for surgical infection prevention.", short: "Surgical-care antibiotic", rx: true, rating: 4.4, reviews: 25 },
    ],
  },
  {
    name: "Cancer",
    slug: "cancer",
    icon: "Radiation",
    description: "Supportive care medicines for symptom relief during cancer treatment.",
    products: [
      { name: "Ondansetron 8mg Tablets", brand: "Generic", price: 260, stock: 60, unit: "10 tablets", desc: "Relieves nausea and vomiting associated with treatment.", short: "Treatment-related nausea relief", rx: true, rating: 4.4, reviews: 20 },
      { name: "Allopurinol 300mg Tablets", brand: "Generic", price: 220, stock: 50, unit: "30 tablets", desc: "Helps manage uric acid levels during treatment.", short: "Uric acid management", rx: true, rating: 4.1, reviews: 11 },
      { name: "Dexamethasone 4mg Tablets", brand: "Generic", price: 150, stock: 55, unit: "10 tablets", desc: "Corticosteroid used for symptom and inflammation support.", short: "Symptom support corticosteroid", rx: true, rating: 4.2, reviews: 14 },
    ],
  },
  {
    name: "Oral Conditions",
    slug: "oral-conditions",
    icon: "Smile",
    description: "Dental and oral hygiene essentials.",
    products: [
      { name: "Fluoride Toothpaste", brand: "Generic", price: 220, stock: 220, unit: "100g tube", desc: "Daily toothpaste supporting cavity protection.", short: "Cavity-protection toothpaste", rating: 4.6, reviews: 90 },
      { name: "Chlorhexidine Mouthwash 0.2%", brand: "Generic", price: 260, stock: 140, unit: "200ml bottle", desc: "Antiseptic mouthwash for gum health and oral hygiene.", short: "Antiseptic mouthwash", rating: 4.4, reviews: 56 },
      { name: "Nystatin Oral Liquid", brand: "Generic", price: 240, stock: 50, unit: "30ml bottle", desc: "Antifungal oral liquid for oral thrush.", short: "Oral thrush treatment", rx: true, rating: 4.2, reviews: 12 },
    ],
  },
  {
    name: "Skin Damage",
    slug: "skin-damage",
    icon: "Flame",
    description: "Care for burns, wounds and damaged skin.",
    products: [
      { name: "Silver Sulfadiazine Cream 1%", brand: "Generic", price: 260, stock: 70, unit: "25g tube", desc: "Antibacterial cream used for burn wound care.", short: "Burn wound care cream", rx: true, rating: 4.4, reviews: 18 },
      { name: "Urea Cream 10%", brand: "Generic", price: 200, stock: 110, unit: "50g tube", desc: "Intensive moisturizing cream for very dry or damaged skin.", short: "Intensive moisturizing cream", rating: 4.5, reviews: 47 },
      { name: "Calamine Lotion", brand: "Generic", price: 130, stock: 150, unit: "100ml bottle", desc: "Soothing lotion for itchy, irritated or sunburned skin.", short: "Soothing skin lotion", rating: 4.3, reviews: 39 },
    ],
  },
  {
    name: "Gynaecology Obstetrics",
    slug: "gynaecology-obstetrics",
    icon: "Baby",
    description: "Prenatal supplements and women's health essentials.",
    products: [
      { name: "Folic Acid 400mcg Tablets (Prenatal)", brand: "Generic", price: 80, stock: 200, unit: "30 tablets", desc: "Prenatal folic acid supplement supporting healthy pregnancy.", short: "Prenatal folic acid", rating: 4.7, reviews: 64 },
      { name: "Ferrous Salt + Folic Acid Tablets (Prenatal)", brand: "Generic", price: 130, stock: 170, unit: "30 tablets", desc: "Combined iron and folic acid supplement for pregnancy support.", short: "Prenatal iron + folic acid", rating: 4.6, reviews: 55 },
      { name: "Clotrimazole Vaginal Tablet 100mg", brand: "Generic", price: 190, stock: 90, unit: "6 tablets", desc: "Antifungal vaginal tablet for yeast infections.", short: "Antifungal vaginal treatment", rating: 4.3, reviews: 26 },
    ],
  },
  {
    name: "Hair Conditions",
    slug: "hair-conditions",
    icon: "Scissors",
    description: "Support for scalp health and dandruff control.",
    products: [
      { name: "Selenium Sulfide Shampoo 2%", brand: "Generic", price: 280, stock: 100, unit: "120ml bottle", desc: "Medicated shampoo for dandruff and fungal scalp conditions.", short: "Anti-dandruff shampoo", rating: 4.4, reviews: 42 },
      { name: "Zinc Sulfate Hair & Nail Support Tablets", brand: "Generic", price: 150, stock: 130, unit: "30 tablets", desc: "Zinc supplement supporting healthy hair and nails.", short: "Hair & nail supplement", rating: 4.2, reviews: 30 },
    ],
  },
];

async function main() {
  const { data: existingCats, error: catFetchErr } = await db
    .from("categories")
    .select("slug, sort_order");
  if (catFetchErr) throw new Error(catFetchErr.message);

  const existingSlugs = new Set((existingCats ?? []).map((c) => c.slug));
  let nextSort = Math.max(0, ...(existingCats ?? []).map((c) => c.sort_order)) + 1;

  let categoriesAdded = 0;
  let productsAdded = 0;

  for (const cat of CATEGORIES) {
    if (existingSlugs.has(cat.slug)) {
      console.log(`skip category (exists): ${cat.slug}`);
      continue;
    }
    const categoryId = genId("cat");
    const { error: catErr } = await db.from("categories").insert({
      id: categoryId,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      sort_order: nextSort++,
    });
    if (catErr) throw new Error(`category ${cat.slug}: ${catErr.message}`);
    categoriesAdded++;

    const rows = cat.products.map((p) => {
      const slug = `${p.name}-${cat.slug}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const seed = slug;
      const id = genId("prod");
      return {
        id,
        name: p.name,
        slug,
        description: p.desc,
        short_description: p.short,
        category_id: categoryId,
        brand: p.brand,
        type: "medicine",
        price: p.price,
        compare_at_price: null,
        cost_price: Math.round(p.price * 0.6),
        stock: p.stock,
        sku: `SKU-${id.toUpperCase()}`,
        unit: p.unit,
        image: img(seed),
        images: null,
        requires_prescription: p.rx ? 1 : 0,
        rating: p.rating,
        reviews_count: p.reviews,
        featured: 0,
        status: "active",
        tags: null,
      };
    });

    const { error: prodErr } = await db.from("products").insert(rows);
    if (prodErr) throw new Error(`products for ${cat.slug}: ${prodErr.message}`);
    productsAdded += rows.length;
  }

  console.log(`Done. Categories added: ${categoriesAdded}. Products added: ${productsAdded}.`);
}

main();
