import express from "express";
import fetch from 'node-fetch'
import cors from "cors"
import knex from 'knex'
import bcrypt from 'bcrypt'
import handleRegister from './controllers/register.js'
import signIn from './controllers/sign.js'
import profile from './controllers/profile.js'
import image from './controllers/image.js'

const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

const app = express() 

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors())

const db= knex({
  client: 'pg',
  connection: {
    connectionString : process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false},
    host : process.env.DATABASE_HOST,
    port: 5432, // add your port number here
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PW,
    database : process.env.DATABASE_DB
  }
});

// Clarifai: use clarifai/main when making inferences outside your app's scope
// PAT (Personal Access Token) from Account → Security; keep in .env as API_CLARIFIA
const PAT = process.env.API_CLARIFIA;
const USER_ID = 'clarifai';
const APP_ID = 'main';
const MODEL_ID = 'face-detection';
const MODEL_VERSION_ID = '45fb9a671625463fa646c3523a3087d5';
const CLARIFAI_API_URL = `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`;

app.post('/api/clarifai', async (req, res) => {
    try {
        const imageUrl = req.body.imageUrl || req.body.url;
        if (!imageUrl) {
            return res.status(400).json({ error: 'imageUrl or url is required' });
        }

        const raw = JSON.stringify({
            user_app_id: {
                user_id: USER_ID,
                app_id: APP_ID,
            },
            inputs: [
                {
                    data: {
                        image: {
                            url: imageUrl,
                        },
                    },
                },
            ],
        });

        const response = await fetch(CLARIFAI_API_URL, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: 'Key ' + process.env.API_CLARIFIA,
                'Content-Type': 'application/json',
            },
            body: raw,
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error communicating with Clarifai API:', error);
        res.status(500).send('Internal Server Error');
    }
}); 


app.post('/signin',(req,res)=>{signIn(req,res,db,bcrypt)})


app.post('/register', (req,res)=>{handleRegister(req,res,db ,bcrypt)})

app.get('/profile/:id',(req,res)=>{profile(req,res,db)})

app.put('/image',(req,res)=>{image(req,res,db)})

app.listen(3000, ()=>{
  console.log('app is running on port 3000')
})

// this is working
// signin -->post = succes/fail
// register-->post = user
// profile/ :userId--> get = user
// image --> put = user 



