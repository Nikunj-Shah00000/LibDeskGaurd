import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import seatsRouter from "./seats";
import statsRouter from "./stats";
import activityRouter from "./activity";
import profileRouter from "./profile";
import recommendRouter from "./recommend";
import noiseRouter from "./noise";
import queueRouter from "./queue";
import gamificationRouter from "./gamification";
import lostfoundRouter from "./lostfound";
import forecastRouter from "./forecast";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(recommendRouter);
router.use(seatsRouter);
router.use(statsRouter);
router.use(forecastRouter);
router.use(activityRouter);
router.use(profileRouter);
router.use(noiseRouter);
router.use(queueRouter);
router.use(gamificationRouter);
router.use(lostfoundRouter);

export default router;
