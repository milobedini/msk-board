import { Router } from "express";
import { getEmployees } from "../data/store.js";

const router = Router();

router.get("/", (_req, res) => {
  const employees = getEmployees();
  res.json({ data: employees });
});

export default router;
