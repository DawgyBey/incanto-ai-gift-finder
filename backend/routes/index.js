import { Router } from "express";
import giftsRouter from "./gifts.js";
import usersRouter from "./user.js";
import dataRouter from "./data.js";
import aiRouter from "./ai.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Incanto API v1 is running",
    version: "1.0.0",
    routes: {
      users: "/api/v1/users - User authentication and profile management",
      gifts: "/api/v1/gifts - Gift recommendations and search",
      data: "/api/v1/data - Gift database and metadata",
      ai: "/api/v1/ai - AI-powered gift assistant",
    },
  });
});

router.use("/gifts", giftsRouter);
router.use("/users", usersRouter);
router.use("/data", dataRouter);
router.use("/ai", aiRouter);

export default router;
