import { Router } from "express";
import { register, login, logout, resetPassword , setNewPassword } from "../controllers/authController.js";
const router = Router();

import {
  validateRegisterInput,
  validateLoginInput,
  validateResetPasswordUserInput,
  validateSetNewPasswordInput
} from "../middleware/validationMiddleware.js";

router.post("/register", validateRegisterInput, register);
router.post("/login", validateLoginInput, login);
router.post("/reset", validateResetPasswordUserInput, resetPassword);
router.post("/set-new-password", validateSetNewPasswordInput, setNewPassword); // Add new route
router.get("/logout", logout);

export default router;
