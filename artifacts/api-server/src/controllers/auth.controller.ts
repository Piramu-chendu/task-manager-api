import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  createUser,
} from "../models/user.model";

export async function register(req: Request, res: Response): Promise<void> {
  const { username, email, password } = req.body as {
    username: string;
    email: string;
    password: string;
  };

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ success: false, message: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { id } = await createUser(username, email, passwordHash, "user");

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { userId: id },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Registration failed", errors: [String(err)] });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const jwtSecret = process.env["JWT_SECRET"];
    if (!jwtSecret) {
      res.status(500).json({ success: false, message: "Server configuration error" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Login failed", errors: [String(err)] });
  }
}
