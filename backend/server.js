import express from 'express';
import 'dotenv/config'
import userRouter from './api/user.js'
import patientRouter from './api/patients.js'
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/user', userRouter)
app.use('/api/patient', patientRouter)

app.get('/health', (req,res) => {
    res.send('ok');
})

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
    
})