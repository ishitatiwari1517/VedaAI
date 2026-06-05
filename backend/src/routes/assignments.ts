import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Assignment from '../models/Assignment';
import GeneratedPaper from '../models/GeneratedPaper';
import { getGenerationQueue } from '../queues/generationQueue';
import { setJobState } from '../queues/redisConnection';
import { emitJobQueued } from '../socket/socketServer';

const router = Router();

// POST /api/assignments — Create assignment and enqueue generation job
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      subject,
      className,
      duration,
      totalMarks,
      dueDate,
      questionTypes,
      additionalInfo,
      schoolName = 'Delhi Public School',
      teacherName = 'John Doe',
    } = req.body;

    // Validate required fields
    if (!title || !subject || !className || !duration || !totalMarks || !dueDate || !questionTypes?.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for duplicate question types
    const types = questionTypes.map((qt: any) => qt.type);
    const uniqueTypes = new Set(types);
    if (uniqueTypes.size !== types.length) {
      return res.status(400).json({ error: 'Duplicate question types are not allowed' });
    }

    // Create assignment document
    const assignment = await Assignment.create({
      title,
      subject,
      className,
      duration,
      totalMarks,
      dueDate,
      questionTypes,
      additionalInfo: additionalInfo || '',
      schoolName,
      teacherName,
      status: 'queued',
    });

    const jobId = uuidv4();
    await Assignment.findByIdAndUpdate(assignment._id, { jobId });

    // Enqueue job
    const queue = getGenerationQueue();
    const job = await queue.add(
      'generate-paper',
      {
        assignmentId: assignment._id.toString(),
        jobId,
        form: {
          title,
          subject,
          className,
          duration,
          totalMarks,
          dueDate,
          questionTypes,
          additionalInfo: additionalInfo || '',
          schoolName,
          teacherName,
        },
      },
      { jobId }
    );

    await setJobState(jobId, { status: 'queued', assignmentId: assignment._id.toString() });

    // Get queue position
    const waiting = await queue.getWaitingCount();
    emitJobQueued(jobId, waiting);

    res.status(201).json({
      assignmentId: assignment._id,
      jobId,
      position: waiting,
    });
  } catch (error) {
    console.error('[Routes] Create assignment error:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// GET /api/assignments — List all assignments
router.get('/', async (_req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// GET /api/assignments/:id — Get single assignment
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// GET /api/assignments/:id/paper — Get generated paper for assignment
router.get('/:id/paper', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    if (!assignment.paperId) {
      return res.status(404).json({ error: 'Paper not yet generated', status: assignment.status });
    }

    const paper = await GeneratedPaper.findById(assignment.paperId).lean();
    if (!paper) return res.status(404).json({ error: 'Paper not found' });

    res.json({ assignment, paper });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch paper' });
  }
});

// GET /api/assignments/paper/:paperId — Get paper directly
router.get('/paper/:paperId', async (req: Request, res: Response) => {
  try {
    const paper = await GeneratedPaper.findById(req.params.paperId)
      .populate('assignmentId')
      .lean();
    if (!paper) return res.status(404).json({ error: 'Paper not found' });
    res.json(paper);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch paper' });
  }
});

// DELETE /api/assignments/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    if (assignment.paperId) {
      await GeneratedPaper.findByIdAndDelete(assignment.paperId);
    }

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

export default router;
