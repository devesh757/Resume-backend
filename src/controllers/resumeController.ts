import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Resume } from '../models/Resume';

export const getResumes = async (req: AuthRequest, res: Response) => {
  const resumes = await Resume.find({ userId: req.user._id }).sort({ updatedAt: -1 });
  res.json(resumes);
};

export const getResume = async (req: AuthRequest, res: Response) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!resume) return res.status(404).json({ message: 'Resume not found' });
  res.json(resume);
};

export const createResume = async (req: AuthRequest, res: Response) => {
  const { title, template, theme } = req.body;
  const newResume = new Resume({
    userId: req.user._id,
    title: title || 'Untitled Resume',
    template,
    theme: {
      font: theme?.font || 'Inter',
      primaryColor: theme?.primaryColor || '#3b82f6',
    },
    personalInfo: { firstName: '', lastName: '', email: '', phone: '' },
    workExperience: [],
    education: [],
    skills: [],
    projects: [],
    customSections: [],
    order: { workExperience: 0, education: 1, skills: 2, projects: 3, customSections: 4 },
  });
  await newResume.save();
  res.status(201).json(newResume);
};

export const updateResume = async (req: AuthRequest, res: Response) => {
  const updated = await Resume.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!updated) return res.status(404).json({ message: 'Resume not found' });
  res.json(updated);
};

export const deleteResume = async (req: AuthRequest, res: Response) => {
  const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!resume) return res.status(404).json({ message: 'Resume not found' });
  res.json({ message: 'Resume deleted' });
};

export const duplicateResume = async (req: AuthRequest, res: Response) => {
  const original = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!original) return res.status(404).json({ message: 'Resume not found' });

  const newResume = new Resume({
    ...original.toObject(),
    _id: undefined,
    title: `${original.title} (Copy)`,
    createdAt: undefined,
    updatedAt: undefined,
  });
  await newResume.save();
  res.status(201).json(newResume);
};
