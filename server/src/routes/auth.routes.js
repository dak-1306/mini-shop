import express from "express";
import { register } from "../controller/auth.controller.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", register);

// (sau này thêm /login, /verify, /refresh ...)
export default router;
