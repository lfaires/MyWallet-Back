import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import connection from '../database/database.js'
import signUpSchema from '../schemas/signUpSchema.js'

const app = express()

app.use(express.json());
app.use(cors());

app.post('/', async (req,res) => {
    const { email, password } = req.body;

    try{
        const login = await connection.query(`
            SELECT * FROM users 
            WHERE email = $1`,[email])

        if (login.rows.length === 0) return res.sendStatus(401)
        const user = login.rows[0];

        if(user && bcrypt.compareSync(password, user.password)){
            const token = uuidv4();

            await connection.query(`
            INSERT INTO sessions ("userId", token) 
            VALUES ($1, $2)`, [user.id, token]);

            res.send(token);

        } else {
            res.sendStatus(404)
        }
        
    } catch (error){
        console.log(error)
        res.sendStatus(500)
    }
})

app.post('/sign-up', async (req,res) => {
    const { name, email, password, repeatPassword } = req.body;
    const createdDate = new Date;
    const lastUpdated = createdDate;
    
    const { error } = signUpSchema.validate({name: name, email: email, password: password, repeat_password: repeatPassword});
 
    if (error !== undefined) return res.sendStatus(400);

    try{
        const checkEmail = await connection.query(`
            SELECT * FROM users 
            WHERE email = $1`,[email]);

        if(checkEmail.rows.length !==0) return res.sendStatus(409);

        const hashPassword = bcrypt.hashSync(password,12)
        const register = await connection.query(`
            INSERT INTO users (name, email, password, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5)`,
            [name, email, hashPassword, createdDate, lastUpdated])
        
        res.sendStatus(201)

    } catch (error){
        console.log(error)
        res.sendStatus(501)
    }
})

app.get('/transactions', async (req,res) => {
    const result = await connection.query('SELECT * FROM transactions')
    res.send(result.rows)
})

app.post('/add-transaction/:type', async (req,res) => {
    const { type } = req.params
    const { value, description } = req.body
    const validValue = parseInt(value)*100
    const created_at = new Date;
    const userId = 7;

    try{
        const result = await connection.query(`
        INSERT INTO transactions(description, value, category, "userId", created_at)
        VALUES ($1, $2, $3, $4, $5)`, [description, validValue, type,userId, created_at])
        
        res.sendStatus(201)

    } catch (error){
        console.log(error)
        res.sendStatus(501)
    }
})

app.listen(4000, () => {
    console.log('Server running on port 4000')
})