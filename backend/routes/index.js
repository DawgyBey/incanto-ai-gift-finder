import { Router } from "express";
import giftsRouter from "./gifts.js";
import usersRouter from "./user.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Incanto API v1 is running",
    routes: {
      users: "/api/v1/users",
      gifts: "/api/v1/gifts",
    },
  });
});

router.use("/gifts", giftsRouter);
router.use("/users", usersRouter);

export default router;
