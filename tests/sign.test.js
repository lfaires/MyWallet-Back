//axios não serve pq precisariamos subir o server
import supertest from 'supertest'
import app from '../src/app.js'
import connection from '../database/database.js'

afterAll( async () => {
    await connection.query('DELETE FROM users') 
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

