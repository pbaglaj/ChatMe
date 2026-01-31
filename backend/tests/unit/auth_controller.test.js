const authController = require('../../controllers/auth_controller');
const db = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../../config/db');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller - Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            cookies: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should return 400 if password or username is missing', async () => {
            req.body = { username: 'testuser' };

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('required')
            }));
        });

        it('should register a user if data is valid', async () => {
            req.body = { username: 'nowy', password: '123' };
            
            db.query.mockResolvedValueOnce({ rows: [] }); 
            db.query.mockResolvedValueOnce({ rows: [{ id: 1, username: 'nowy' }] });

            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashed_pass');

            await authController.register(req, res);

            expect(db.query).toHaveBeenCalledTimes(2);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'User successfully registered'
            }));
        });
    });

    describe('login', () => {
        it('should log in and set a cookie with correct data', async () => {
            req.body = { username: 'janusz', password: 'password' };
            const fakeUser = { id: 1, username: 'janusz', password_hash: 'hashed' };

            db.query.mockResolvedValue({ rows: [fakeUser] });

            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('fake_token_123');

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.cookie).toHaveBeenCalledWith('auth_token', 'fake_token_123', expect.anything());
        });

        it('should reject login with incorrect password', async () => {
            req.body = { username: 'janusz', password: 'wrong_password' };
            
            db.query.mockResolvedValue({ rows: [{ id: 1, password_hash: 'hashed' }] });
            bcrypt.compare.mockResolvedValue(false);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
        });
    });
});