import express from 'express';
import multer from 'multer';
import { uploadMasterResume, optimizeResume } from '../controllers/resumeController.js';

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

router.post('/upload-master', upload.single('resume'), uploadMasterResume);
router.post('/optimize', optimizeResume);

export default router;