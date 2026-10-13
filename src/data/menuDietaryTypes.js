export const ALLERGEN_CODES = {
  SHELLFISH: { code: "CRUST-01", label: "Severe Shellfish", color: "text-red-700 bg-red-50 border-red-200" },
  CELIAC: { code: "GLUT-01", label: "Celiac / Gluten-Free", color: "text-amber-800 bg-amber-50 border-amber-200" },
  NUT: { code: "NUT-01", label: "Peanut / Tree Nut", color: "text-red-700 bg-red-50 border-red-200" },
  LACTOSE: { code: "DAIRY-02", label: "Lactose Intolerant", color: "text-stone-700 bg-stone-100 border-stone-200" },
  VEGETARIAN: { code: "VEG-00", label: "Vegetarian", color: "text-emerald-800 bg-emerald-50 border-emerald-200" },
  VEGAN: { code: "VGN-00", label: "Strict Vegan", color: "text-emerald-900 bg-emerald-50 border-emerald-300" },
  PREGNANCY: { code: "PREG-01", label: "Pregnancy Safe (Pasteurized/Well-done)", color: "text-stone-700 bg-stone-100 border-stone-200" },
};

export const COURSE_STAGES = {
  NOT_SEATED: { label: "Not Seated", order: 0, tone: "text-paper-500 bg-paper-100 border-paper-300" },
  WATER_MENUS: { label: "Water & Menus", order: 1, tone: "text-paper-700 bg-paper-200 border-paper-300" },
  FIRST_COURSE: { label: "First Course", order: 2, tone: "text-bistro-ochre bg-amber-50 border-amber-200" },
  MAINS: { label: "Mains Active", order: 3, tone: "text-bistro-sage bg-emerald-50 border-emerald-200" },
  DESSERT: { label: "Dessert / Coffee", order: 4, tone: "text-bistro-brass bg-yellow-50 border-yellow-200" },
  CHECK_DROPPED: { label: "Check Dropped", order: 5, tone: "text-paper-900 bg-stone-200 border-stone-300" }
};
