class AuthService {
  constructor(db, bcrypt, jwt) {
    this.db = db;
    this.bcrypt = bcrypt;
    this.jwt = jwt;
  }

  async register(username, password) {
    if (!username || !password) {
      throw { status: 400, message: "Username and password are required" };
    }
    const userExists = await this.db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userExists.rows.length > 0) {
      throw { status: 400, message: "User with this username already exists" };
    }

    const salt = await this.bcrypt.genSalt(10);
    const hashedPassword = await this.bcrypt.hash(password, salt);

    const newUser = await this.db.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *",
      [username, hashedPassword]
    );

    return newUser.rows[0];
  }

  async login(username, password) {
      if (!username || !password) {
        throw { status: 400, message: "Username and password are required" };
      }

      const userResult = await this.db.query("SELECT * FROM users WHERE username = $1", [username]);
      if (userResult.rows.length === 0) {
        throw { status: 401, message: "Invalid login credentials" };
      }
      
      const user = userResult.rows[0];

      const isMatch = await this.bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        throw { status: 401, message: "Invalid login credentials" };
      }

      const payload = {
        user: {
          id: user.id,
          user_id: user.user_id
        }
      };

      const token = this.jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return token;
    }
}

module.exports = AuthService;