import supertest from 'supertest'
import app from '../src/app.js'
import connection from '../database/database.js'
import { login } from './utils.js';

describe('POST /sign-up', () => {
    it('return status 201 for valid params', async () => {
        const body = {
            name: "teste", 
            email: "teste@teste.com", 
            password:"abcd12", 
            repeatPassword:"abcd12"
        }

        const result = await supertest(app).post('/sign-up').send(body);

        expect(result.status).toEqual(201)
    })

    it('return status 400 for invalid params', async () => {
        const body = {
            name: "", 
            email: "teste", 
            password:"abcd12",
            repeatPassword:"abcd1"
        }

        const result = await supertest(app).post('/sign-up').send(body);

        expect(result.status).toEqual(400)
    })

    it('return status 409 for duplicated params', async () => {
        const body = {
            name: "teste", 
            email: "teste@teste.com", 
            password:"abcd12", 
            repeatPassword:"abcd12"
        }

        await supertest(app).post('/sign-up').send(body);
        const result = await supertest(app).post('/sign-up').send(body);

        expect(result.status).toEqual(409)
    })
})

describe('POST /sign-in', () => {
    it('return status 200 for valid params', async () => {
        const body = {
            name: "teste", 
            email: "teste@teste.com", 
            password:"abcd12", 
            repeatPassword:"abcd12"
        }

        await supertest(app).post('/sign-up').send(body);
        const result = await supertest(app).post('/sign-in').send({email: body.email , password: body.password });
        
        expect(result.status).toEqual(200)
        expect(result.body).toEqual(
            expect.objectContaining({
              token: expect.any(String)
            })
          );
    })

    it(`return status 401 when user is registered but password is invalid`, async () => {
        const body = {
            name: "teste", 
            email: "teste@teste.com", 
            password:"abcd12", 
            repeatPassword:"abcd12"
        }

        await supertest(app).post('/sign-up').send(body);
        const result = await supertest(app).post('/sign-in').send({email: body.email, password: 'abc1' });

        expect(result.status).toEqual(401)
    })

    it(`return status 404 when user isn't registered`, async () => {
        const body = {
            name: "teste", 
            email: "teste@teste.com", 
            password:"abcd12", 
            repeatPassword:"abcd12"
        }

        await supertest(app).post('/sign-up').send(body);
        const result = await supertest(app).post('/sign-in').send({email: 'teste@triste.com', password: body.password });

        expect(result.status).toEqual(404)
    })
})

describe('POST /sign-out', () => {
    it('return status 200', async () => {
        const token = await login();

        const result = await supertest(app).post('/sign-out').set('Authorization', `Bearer ${token}`);
        expect(result.status).toEqual(200)
    })

})

beforeEach( async () => {
    await connection.query('DELETE FROM users')  
})
    
afterAll( () => {
    connection.end();
})