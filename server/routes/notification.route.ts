import { Router } from "express";
import notificationController from "../controllers/notification.controller";

const notificationRouter = Router();

notificationRouter.post("/", notificationController.sendNotification);

// alertRouter.post("/", alertController.createAlert);
// alertRouter.get("/all", alertController.getAllAlerts);
// alertRouter.get("/:id", alertController.getAlert);
// alertRouter.post("/:id", alertController.sendAlert);
// alertRouter.delete("/:id", alertController.deleteAlert);
// alertRouter.patch("/:id", alertController.updateStatus);

export default notificationRouter;