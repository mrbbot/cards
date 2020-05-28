import consola from "consola";
import { compare, hash } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { NextFunction, Request, Response } from "express";
import { pool } from "./index";

// @ts-ignore
const saltRounds = parseInt(process.env.CARDS_SALT_ROUNDS);
// @ts-ignore
const jwtSecret: string = process.env.CARDS_JWT_SECRET;

export interface User {
  username: string;
  password?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface AuthenticatedRequest extends Request {
  user: User;
}

function createAccessToken(username: string): string {
  return sign({ sub: username }, jwtSecret, {
    expiresIn: "1h"
  });
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse | null> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const userRes = await client.query<User>(
      "SELECT username, password FROM card_user WHERE username = $1",
      [username]
    );
    if (userRes.rowCount === 0) {
      await client.query("COMMIT");
      // run a bcrypt hash anyways so a user can't determine if a username exists by timing
      await hash(password, saltRounds);
      return null;
    }

    if (
      userRes.rows[0].password &&
      (await compare(password, userRes.rows[0].password))
    ) {
      const accessToken = createAccessToken(username);
      const refreshTokenId = uuidv4();
      const refreshToken = sign(
        { sub: username, jti: refreshTokenId },
        jwtSecret
      );

      await client.query(
        "INSERT INTO card_user_refresh_token(id, username, token) VALUES ($1, $2, $3)",
        [refreshTokenId, username, refreshToken]
      );

      await client.query("COMMIT");
      return {
        user: { username },
        accessToken,
        refreshToken
      };
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
  return null;
}

export async function refresh(
  refreshToken: string
): Promise<RefreshResponse | null> {
  try {
    verify(refreshToken, jwtSecret);
  } catch (e) {
    return null;
  }

  const refreshTokenRes = await pool.query<User>(
    "SELECT username FROM card_user_refresh_token WHERE token = $1",
    [refreshToken]
  );
  if (refreshTokenRes.rowCount === 0) {
    return null;
  }

  return {
    accessToken: createAccessToken(refreshTokenRes.rows[0].username)
  };
}

export async function logout(username: string): Promise<any> {
  await pool.query<User>(
    "DELETE FROM card_user_refresh_token WHERE username = $1",
    [username]
  );
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const auth = (req.headers.authorization || "").split(" ");
  if (auth.length === 2 && auth[0] === "Bearer") {
    try {
      // @ts-ignore
      const token: { sub: string } = verify(auth[1], jwtSecret);
      (req as AuthenticatedRequest).user = { username: token.sub };
      next();
      return;
    } catch (e) {
      consola.warn("Error verifying JWT: ", e);
    }
  }
  consola.warn("Invalid authorization");
  res.status(401);
  res.json(false);
}
