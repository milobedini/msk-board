import { Router } from 'express';
import { z } from 'zod';

import { getSuggestions, updateSuggestion } from '../data/store.js';
import { AppError } from '../middleware/errorHandler.js';
import { SUGGESTION_STATUSES, SUGGESTION_TYPES } from '../types/index.js';

const router = Router();

const querySchema = z.object({
  status: z.enum(SUGGESTION_STATUSES).optional(),
  type: z.enum(SUGGESTION_TYPES).optional(),
  employeeId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

const updateSchema = z.object({
  status: z.enum(SUGGESTION_STATUSES).optional(),
  notes: z.string().optional()
});

router.get('/', (req, res, next) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', parsed.error.issues[0].message);
    }

    const result = getSuggestions(parsed.data);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', (req, res, next) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, 'VALIDATION_ERROR', parsed.error.issues[0].message);
    }

    const updated = updateSuggestion(req.params.id, parsed.data);
    if (!updated) {
      throw new AppError(404, 'NOT_FOUND', 'Suggestion not found');
    }

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
