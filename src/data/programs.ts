import progEdu from "@/assets/prog-education.jpg";
import progHealth from "@/assets/prog-health.jpg";
import progEnv from "@/assets/prog-environment.jpg";
import progLive from "@/assets/prog-livelihood.jpg";
import { BookOpen, Stethoscope, Leaf, Sprout, type LucideIcon } from "lucide-react";

export type Program = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  img: string;
  icon: LucideIcon;
  color: string;
  highlights: { title: string; text: string }[];
  stats: { n: string; l: string }[];
};

export const PROGRAMS: Program[] = [
  {
    slug: "education",
    title: "Education",
    tagline: "Every child deserves the chance to learn.",
    summary:
      "Our education programs deliver quality schooling, teacher training, and scholarships to children across underserved communities — building classrooms, libraries, and futures.",
    img: progEdu,
    icon: BookOpen,
    color: "var(--brand-blue)",
    highlights: [
      { title: "Classrooms Built", text: "We construct and rehabilitate schools that give children safe, dignified spaces to learn." },
      { title: "Girls' Education", text: "Targeted scholarships and mentoring so girls can complete their schooling." },
      { title: "Teacher Training", text: "We upskill local teachers so quality learning outlasts our programs." },
      { title: "School Feeding", text: "Daily meals so students can focus on class, not hunger." },
    ],
    stats: [
      { n: "82", l: "Schools Built" },
      { n: "45K+", l: "Students Enrolled" },
      { n: "1,200", l: "Teachers Trained" },
      { n: "18", l: "Countries" },
    ],
  },
  {
    slug: "health",
    title: "Health",
    tagline: "Healthy communities are stronger communities.",
    summary:
      "We strengthen primary healthcare — clinics, mobile units, maternal care, and vaccination campaigns — bringing quality care to families who need it most.",
    img: progHealth,
    icon: Stethoscope,
    color: "var(--brand-orange)",
    highlights: [
      { title: "Maternal Care", text: "Safe pregnancies and childbirth through community midwives and clinics." },
      { title: "Vaccination Drives", text: "Reaching remote villages with life-saving immunizations." },
      { title: "Mobile Clinics", text: "Bringing doctors, medicines, and screenings to doorsteps." },
      { title: "Nutrition Programs", text: "Fighting malnutrition with food support and education." },
    ],
    stats: [
      { n: "36", l: "Clinics Supported" },
      { n: "310K", l: "Patients Treated" },
      { n: "58K", l: "Children Vaccinated" },
      { n: "22", l: "Mobile Units" },
    ],
  },
  {
    slug: "environment",
    title: "Environment",
    tagline: "Protecting the planet for future generations.",
    summary:
      "From clean water to reforestation and climate resilience, our environmental programs help communities steward their land and adapt to a changing climate.",
    img: progEnv,
    icon: Leaf,
    color: "var(--brand-green-dark)",
    highlights: [
      { title: "Clean Water Wells", text: "Safe drinking water for schools, clinics, and villages." },
      { title: "Reforestation", text: "Millions of trees planted to restore land and fight erosion." },
      { title: "Climate Resilience", text: "Drought-resistant crops and community adaptation plans." },
      { title: "Waste Management", text: "Recycling and cleanup drives in growing urban areas." },
    ],
    stats: [
      { n: "1.4M", l: "Trees Planted" },
      { n: "240", l: "Wells Drilled" },
      { n: "62", l: "Communities" },
      { n: "9", l: "Countries" },
    ],
  },
  {
    slug: "livelihood",
    title: "Livelihood",
    tagline: "Skills and opportunities to build stronger futures.",
    summary:
      "We equip women, youth, and farmers with training, micro-grants, and market access — turning skills into stable incomes and thriving small businesses.",
    img: progLive,
    icon: Sprout,
    color: "var(--brand-purple)",
    highlights: [
      { title: "Vocational Training", text: "Tailored courses in tailoring, carpentry, mechanics, and tech." },
      { title: "Women's Cooperatives", text: "Groups that pool skills, savings, and market access." },
      { title: "Micro-Grants", text: "Seed funding to launch and grow small businesses." },
      { title: "Farmer Support", text: "Better seeds, tools, and training for smallholder farms." },
    ],
    stats: [
      { n: "12K", l: "People Trained" },
      { n: "3,400", l: "Businesses Launched" },
      { n: "180", l: "Cooperatives" },
      { n: "$2.1M", l: "In Micro-Grants" },
    ],
  },
];

export function getProgram(slug: string): Program | undefined {
  return PROGRAMS.find((p) => p.slug === slug);
}