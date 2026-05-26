import { Router } from 'express';
import { getAllDeliveries, getDeliveryById, createDelivery, assignRiderToDelivery, confirmDelivery } from '../models/deliveries.js';

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

router.patch('/:id/assign-rider', async (req, res) => {
  const { riderId } = req.body;
  if (!riderId) return res.status(400).json({ error: 'riderId is required' });
  const delivery = await assignRiderToDelivery(req.params.id, riderId);
  if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
  res.json(delivery);
});

router.patch('/:id/confirm', async (req, res) => {
  const delivery = await confirmDelivery(req.params.id);
  if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
  res.json(delivery);
});

export default router;