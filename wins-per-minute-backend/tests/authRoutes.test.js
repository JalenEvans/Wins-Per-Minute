// Dependencies
import { describe, expect, it, beforeAll } from "@jest/globals";
import request from 'supertest';
import pool from "../db/db.js";
import dotenv from 'dotenv';

// Server
import app from '../server.js';

dotenv.config()

const testUser1 = {
    username: "testuser1",
    email: "testuser1@email.com",
    password: "Password123!"
}

const testUser2 = {
    username: "testuser2",
    email: "testuser2@email.com",
    password: "Password1234!"
}

beforeAll(async () => {
    await pool.query(`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);

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
        it("should return a status code of 201 with a token and create a new user", async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: testUser1.username,
                    email: testUser1.email,
                    password: testUser1.password
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body.token).toBeDefined();
        });

        it("should return a status code of 409 if the user is already created", async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: testUser1.username,
                    email: testUser1.email,
                    password: testUser1.password
                });
            expect(res.statusCode).toEqual(409);
        });
    });

    describe("POST /login", () => {
        beforeAll(async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: testUser2.username,
                    email: testUser2.email,
                    password: testUser2.password
                })
        });

        it("should return a status code of 200 with a token and log in a user", async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser2.email,
                    password: testUser2.password
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body.token).toBeDefined();
        });

        it("should return a status code of 401 if the user inputed invalid credentials", async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser2.email,
                    password: "Wrong Password"
                });
            expect(res.statusCode).toEqual(401);
        });
    });
})