import { Router } from 'express';
import { getAllDeliveries, getDeliveryById, createDelivery, updateDelivery } from '../models/deliveries.js';

const router = Router();

router.get('/', async (req, res) => {
  const deliveries = await getAllDeliveries();
  res.json(deliveries);
});

router.get('/:id', async (req, res) => {
  const delivery = await getDeliveryById(req.params.id);
  if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
  res.json(delivery);
});

router.post('/', async (req, res) => {
  const delivery = await createDelivery(req.body);
  res.status(201).json(delivery);
});

router.patch('/:id', async (req, res) => {
  const delivery = await updateDelivery(req.params.id, req.body);
  if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
  res.json(delivery);
});

export default router;