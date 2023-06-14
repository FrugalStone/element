import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5002;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });

app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/home.html');
})

app.get('/sign-up', (req, res)=>{
    res.sendFile(__dirname + '/sign-up.html');
})

app.get('/log-in', (req, res)=>{
    res.sendFile(__dirname + '/log-in.html');
})

app.get('/say-hi', (req, res)=>{
    res.send({'text' : 'hi'});
})

app.get('/say-bye', (req, res)=>{
    res.send({'text' : 'bye'});
})

app.listen(port, ()=>{
    console.log(`Listening to port ${port}`);
})