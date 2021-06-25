import supertest from 'supertest';
import app from '../src/app.js';

export async function login () {
    const body ={
        name: "teste", 
        email: "teste@teste.com", 
        password:"abcd12", 
        repeatPassword:"abcd12"
    }
    
    await supertest(app).post("/sign-up").send(body);

    const user = await supertest(app).post("/sign-in").send({email: body.email, password: body.password })
    
    return user.body.token;
}