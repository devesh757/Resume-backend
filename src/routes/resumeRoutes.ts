import express, { Response } from 'express';
import {
  getResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  duplicateResume,
} from '../controllers/resumeController';
import { protect, AuthRequest } from '../middleware/auth';
import { Resume } from '../models/Resume';
import { generatePDF } from '../services/pdfGenerator';

const router = express.Router();

router.use(protect);
router.route('/').get(getResumes).post(createResume);
router.route('/:id').get(getResume).put(updateResume).delete(deleteResume);
router.post('/:id/duplicate', duplicateResume);

router.get('/:id/pdf', async (req: AuthRequest, res: Response) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!resume) return res.status(404).json({ message: 'Not found' });
  const pdf = await generatePDF(resume);
  const filename = resume.title.replace(/[^\w\- ]/g, '').trim() || 'resume';
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
  res.send(pdf);
});

export default router;
