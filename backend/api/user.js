import { Router } from 'express';
import { getAllUsers, getUserByEmail, getUserById, createUser } from '../models/user.js';

const router = Router();

router.get('/', async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
});

router.get('/email/:email', async (req, res) => {
  const user = await getUserByEmail(req.params.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.get('/:id', async (req, res) => {
  const user = await getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// router.post('/login', async(req,res) =>{
//     const { email, password } = req.body;
  
//     const user = await getUserByEmail(email);

//     if (!user || user.password !== password) {
//         return res.status(401).json({ error: 'Invalid credentials' });
//     } else {
//         res.json(user);
//     }
// })

router.post('/', async (req, res) => {
  const user = await createUser(req.body);
  res.status(201).json(user);
});

export default router;