import express from 'express'
import cors from 'cors'

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
            WHERE email = $1
            AND password = $2`,[email, password])

        if (login.rows.length === 0) return res.sendStatus(401)

        res.sendStatus(200)
        
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

        const register = await connection.query(`
            INSERT INTO users (name, email, password, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5)`,
            [name, email, password, createdDate, lastUpdated])
        
        res.sendStatus(201)

    } catch (error){
        console.log(error)
        res.sendStatus(501)
    }
})

app.listen(4000, () => {
    console.log('Server running on port 4000')
})