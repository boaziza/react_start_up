import { Router } from 'express';
import { getAllPatients, getPatientById, createPatient } from '../models/patients.js';

const router = Router();

router.get('/', async (req, res) => {
  const patients = await getAllPatients();
  res.json(patients);
});

router.get('/:id', async (req, res) => {
  const patient = await getPatientById(req.params.id);
  if (!patient) return res.status(404).json({ error: 'User not found' });
  res.json(patient);
});

router.post('/', async (req, res) => {
  const patient = await createPatient(req.body);
  res.status(201).json(patient);
});

export default router;