import { Router } from 'express';
import { getAllRiders, getRiderById, createRider} from '../models/riders.js';

const router = Router();

router.get('/', async (req, res) => {
  const riders = await getAllRiders();
  res.json(riders);
});

router.get('/:id', async (req, res) => {
  const rider = await getRiderById(req.params.id);
  if (!rider) return res.status(404).json({ error: 'Rider not found' });
  res.json(rider);
});

router.post('/', async (req, res) => {
  const rider = await createRider(req.body);
  res.status(201).json(rider);
});

export default router;