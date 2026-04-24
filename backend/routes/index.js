import { Router } from "express";
import giftsRouter from "./gifts.js";

const router = Router();

router.use("/gifts", giftsRouter);

export default router;
