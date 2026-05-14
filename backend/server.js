import express from 'express';

const app = express();

app.use(express.json());

app.get('/health', (req,res) => {
    res.send('ok');
})

// PORT = 4000;

app.listen(4000, () => {
    console.log(`Server running on 4000`);
    
})