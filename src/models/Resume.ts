import mongoose, { Document, Schema } from 'mongoose';

export type TemplateId =
  | 'minimalist'
  | 'executive'
  | 'creative'
  | 'modern'
  | 'two-column'
  | 'timeline'
  | 'gradient'
  | 'dark'
  | 'elegant'
  | 'compact'
  | 'bold'
  | 'vintage'
  | 'tech'
  | 'cards'
  | 'neon'
  | 'aurora'
  | 'slate'
  | 'mint'
  | 'ocean'
  | 'sunset'
  | 'lavender'
  | 'forest'
  | 'coral'
  | 'onyx'
  | 'pearl'
  | 'amber'
  | 'skyline'
  | 'paper'
  | 'mono'
  | 'script'
  | 'nordic'
  | 'desert'
  | 'rose'
  | 'indigo'
  | 'emerald'
  | 'crimson'
  | 'arctic'
  | 'twilight'
  | 'meadow'
  | 'horizon'
  | 'blush'
  | 'charcoal'
  | 'ivory'
  | 'steel'
  | 'berry'
  | 'honey'
  | 'storm'
  | 'cobalt'
  | 'pine'
  | 'platinum';

const TEMPLATE_IDS: TemplateId[] = [
  'minimalist',
  'executive',
  'creative',
  'modern',
  'two-column',
  'timeline',
  'gradient',
  'dark',
  'elegant',
  'compact',
  'bold',
  'vintage',
  'tech',
  'cards',
  'neon',
  'aurora',
  'slate',
  'mint',
  'ocean',
  'sunset',
  'lavender',
  'forest',
  'coral',
  'onyx',
  'pearl',
  'amber',
  'skyline',
  'paper',
  'mono',
  'script',
  'nordic',
  'desert',
  'rose',
  'indigo',
  'emerald',
  'crimson',
  'arctic',
  'twilight',
  'meadow',
  'horizon',
  'blush',
  'charcoal',
  'ivory',
  'steel',
  'berry',
  'honey',
  'storm',
  'cobalt',
  'pine',
  'platinum',
];

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  template: TemplateId;
  theme: {
    font: string;
    primaryColor: string;
  };
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    headline?: string;
    summary?: string;
    website?: string;
    linkedin?: string;
    avatar?: string;
  };
  workExperience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    major?: string;
    graduationDate: string;
  }>;
  skills: Array<{
    category: string;
    items: Array<{ name: string; proficiency?: 'beginner' | 'intermediate' | 'expert' }>;
  }>;
  projects: Array<{
    title: string;
    technologies: string[];
    link?: string;
    description: string;
  }>;
  customSections: Array<{
    title: string;
    items: string[];
  }>;
  order: {
    workExperience: number;
    education: number;
    skills: number;
    projects: number;
    customSections: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    template: { type: String, enum: TEMPLATE_IDS, default: 'minimalist' },
    theme: {
      font: { type: String, default: 'Inter' },
      primaryColor: { type: String, default: '#3b82f6' },
    },
    personalInfo: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      headline: String,
      summary: String,
      website: String,
      linkedin: String,
      avatar: String,
    },
    workExperience: [
      {
        company: String,
        role: String,
        startDate: String,
        endDate: String,
        description: [String],
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        major: String,
        graduationDate: String,
      },
    ],
    skills: [
      {
        category: String,
        items: [
          {
            name: String,
            proficiency: { type: String, enum: ['beginner', 'intermediate', 'expert'] },
          },
        ],
      },
    ],
    projects: [
      {
        title: String,
        technologies: [String],
        link: String,
        description: String,
      },
    ],
    customSections: [
      {
        title: String,
        items: [String],
      },
    ],
    order: {
      workExperience: { type: Number, default: 0 },
      education: { type: Number, default: 1 },
      skills: { type: Number, default: 2 },
      projects: { type: Number, default: 3 },
      customSections: { type: Number, default: 4 },
    },
  },
  { timestamps: true }
);

export const Resume = mongoose.model<IResume>('Resume', ResumeSchema);
