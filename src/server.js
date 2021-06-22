import express from 'express'
import cors from 'cors'
import connection from '../database/database.js'
import signUpSchema from '../schemas/signUpSchema.js'

const app = express()

app.use(express.json());
app.use(cors());

app.post('/sign-up', async (req,res) => {
    const { name, email, password, repeatPassword } = req.body;
    const registerDate = '2021-06-22';

    const { error } = signUpSchema.validate({name: name, email: email, password: password, repeatPassword: repeatPassword, registerDate: registerDate});

    if (error !== undefined) return res.sendStatus(400);

    try{
        const checkEmail = await connection.query(`
            SELECT * FROM users 
            WHERE email = $1`,[email]);

        if(checkEmail !==0) return res.sendStatus(400);

        const register = await connection.query(`
            INSERT INTO users (name, email, password, repeatpassword, registerdate) 
            VALUES ($1, $2, $3, $4, $5)`,
            [name, email, password, repeatPassword, registerDate])
        
        res.sendStatus(201)

    } catch (error){
        console.log(error)
        res.sendStatus(501)
    }
})

app.listen(4000, () => {
    console.log('Server running on port 4000')
})