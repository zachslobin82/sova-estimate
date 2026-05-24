// Procedure catalogue — single source of truth for labels, values, and price ranges.
// Import this wherever you need to display or calculate procedure costs.

export const PROCEDURE_GROUPS = [
  {
    category: 'Breasts',
    items: [
      { value: 'breast_aug',       label: 'Breast Augmentation',                priceMin: 10500, priceMax: 12500 },
      { value: 'breast_lift',      label: 'Breast Lift',                        priceMin: 17000, priceMax: 21000 },
      { value: 'breast_reduction', label: 'Breast Reduction',                   priceMin: 21000, priceMax: 24000 },
      { value: 'breast_revision',  label: 'Breast Implant Exchange / Revision', priceMin: 10000, priceMax: 12000 },
    ],
  },
  {
    category: 'Body',
    items: [
      { value: 'tummy_tuck', label: 'Tummy Tuck',          priceMin: 23000, priceMax: 26000 },
      { value: 'lipo',       label: 'Liposuction',          priceMin: 9000,  priceMax: 12000 },
      { value: 'mommy',      label: 'Mommy Makeover',       priceMin: 33000, priceMax: 36000 },
      { value: 'body_lift',  label: 'Body Lift',            priceMin: 44000, priceMax: 46000 },
      { value: 'bbl',        label: 'Brazilian Butt Lift',  priceMin: 21000, priceMax: 24000 },
    ],
  },
  {
    category: 'Face',
    items: [
      { value: 'facelift',  label: 'Facelift',       priceMin: 20000, priceMax: 22000 },
      { value: 'neck_lift', label: 'Neck Lift',       priceMin: 22000, priceMax: 23000 },
      { value: 'eyelid',    label: 'Eyelid Surgery',  priceMin: 10000, priceMax: 11000 },
      { value: 'brow_lift', label: 'Brow Lift',       priceMin: 12000, priceMax: 12000 },
    ],
  },
  {
    category: 'Other',
    items: [
      { value: 'rhinoplasty',  label: 'Rhinoplasty',          priceMin: 18000, priceMax: 22000 },
      { value: 'gynecomastia', label: 'Gynecomastia',         priceMin: 9000,  priceMax: 12000 },
      { value: 'other',        label: 'Other / Not Sure Yet', priceMin: null,  priceMax: null  },
    ],
  },
]

// Flat lookup map: value → { label, priceMin, priceMax }
export const PROCEDURE_MAP = Object.fromEntries(
  PROCEDURE_GROUPS.flatMap(g => g.items.map(p => [p.value, p]))
)
