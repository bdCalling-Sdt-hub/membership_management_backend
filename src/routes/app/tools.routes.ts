import { Router } from "express";
import { access_file, tools } from "@controllers/tools";

const router = Router();

// Tools
router.get("/", tools);
router.get("/access-file/:id", access_file);

export default router;
