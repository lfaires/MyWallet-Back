import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { v4 } from 'uuid';

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
            
            const token = v4();

            await connection.query(`
            DELETE FROM sessions 
            WHERE "userId" = $1`, [user.id]);

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
    const authorization = req.header('Authorization');
    const token = authorization?.replace('Bearer ', '');

    if(!token) return res.sendStatus(401)

    try{
        const user = await connection.query(`
            SELECT * FROM sessions
            JOIN users
            ON sessions."userId" = users.id
            WHERE sessions.token = $1`,[token])

        const { userId, name } = user.rows[0]

        if(name) {
            const result = await connection.query(`
                SELECT transactions.*, users.name as username FROM transactions 
                JOIN users
                ON transactions."userId" = users.id
                WHERE "userId" = $1`,[userId])
            if(result.rows.length === 0){
                res.send({name})
            } else {
                res.send(result.rows)
            }
        } else {
            res.sendStatus(401)
        }
    } catch (error){
        console.log(error)
        res.sendStatus(501)
    }
})

app.post('/transaction/:type', async (req,res) => {
    const authorization = req.header('Authorization');
    const token = authorization?.replace('Bearer ', '');
    const { type } = req.params
    const { value, description } = req.body
    const validValue = parseFloat(value.replace(",",".")*100).toFixed(0)
    const created_at = new Date;    

    if(!token) return res.sendStatus(401)

    try{
        const user = await connection.query(`
        SELECT * FROM sessions
        JOIN users
        ON sessions."userId" = users.id
        WHERE sessions.token = $1`,[token])

        const id = user.rows[0].userId
        if(id){
            const result = await connection.query(`
            INSERT INTO transactions(description, value, category, "userId", created_at)
            VALUES ($1, $2, $3, $4, $5)`, [description, validValue, type,id, created_at])
            
            res.sendStatus(201)
        } else {
            res.sendStatus(401)
        }
    } catch (error){
        console.log(error)
        res.sendStatus(501)
    }
})

app.post('/sign-out', async (req,res) => {
    const authorization = req.header('Authorization');
    const token = authorization?.replace('Bearer ', '');

    if(!token) return res.sendStatus(401)
   
    await connection.query(`
    DELETE FROM sessions
    WHERE token = $1`,[token])

    res.sendStatus(200)
})

app.delete('/transaction/:id', async (req, res) => {
    const { id } = req.params

    try {
        await connection.query(`
        DELETE FROM transactions
        WHERE id = $1`,[id])

        res.sendStatus(200)
    } catch(error){
        console.log(error)
        res.sendStatus(501)
    }
})

app.get('/banana', (req,res) => {
    res.sendStatus(200)
})

export default app;