import supertest from 'supertest'
import app from '../src/app.js'
import connection from '../database/database.js'
//tem que trocar a database de financial_data para financial_data_test

afterAll( async () => {
    await connection.query('DELETE FROM users')
    await connection.query('DELETE FROM sessions')
    connection.end();
})

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

        const result = await supertest(app).post('/sign-up').send(body);

        expect(result.status).toEqual(409)
    })
})

describe('POST /sign-in', () => {
    it('return status 200 for valid params', async () => {
        const body = {
            email: "teste@teste.com",
            password: "abcd12"
        }

        const result = await supertest(app).post('/sign-in').send(body);
        
        expect(result.status).toEqual(200)
    })

    it('return status 401 for invalid params', async () => {
        const body = {
            email: "teste", 
            password:"abcd12",
        }

        const result = await supertest(app).post('/sign-in').send(body);

        expect(result.status).toEqual(401)
    })
})

describe('POST /sign-out', () => {
    it('return status 200 for valid params', async () => {
        const result = await supertest(app).post('/sign-out').set('Authorization', 'Bearer 6c479e18-5b38-4306-97ac-7316ac74b089');
        expect(result.status).toEqual(200)
    })
})