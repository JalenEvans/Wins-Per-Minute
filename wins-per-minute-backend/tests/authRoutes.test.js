// Dependencies
import { describe, expect, it, beforeAll } from "@jest/globals";
import request from 'supertest';
import pool from "../db/db.js";
import dotenv from 'dotenv';

// Server
import app from '../server.js';

dotenv.config()

beforeAll(async () => {
    await pool.query(`TRUNCATE TABLE users RESTART IDENTITY CASCADE`)

    process.on('unhandledRejection', (reason) => {
        console.error('Unhandled rejection:', reason);
    });

    process.on('uncaughtException', (err) => {
        console.error('Uncaught exception:', err);
    });
})

afterAll(async () => {
    await pool.end();
})

describe("Authentication Routes", () => {
    describe("POST /register", () => {
        it("should return a status code of 201 with a token", async () => {
            console.log(`Database URL: ${process.env.DATABASE_URL}`)
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: "testuser",
                    email: "testuser@email.com",
                    password: "Password123!"
                })
            expect(res.statusCode).toEqual(201);
            expect(res.body.token).toBeDefined();
        })
    })
})