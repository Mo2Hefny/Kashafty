import { Request, Response } from "express";
import { prisma } from "../database/db";
import { NotificationStatus, Prisma } from "@prisma/client";

const notificationController = {
  /* sendNotification
   *
   * @desc Send a notification to a group of users, or all users
   * @endpoint POST /api/notification
   * @access Private
   */
  sendNotification: async (req: Request, res: Response) => {
    try {
      const { type, title, message, sectorBaseName, sectorSuffixName } =
        req.body;

      if (!type || !title || !message)
        return res.status(400).json({ message: "Missing required fields" });

      let isToAll = false;
      if (!sectorBaseName || !sectorSuffixName) isToAll = true;

      let sentNotifications: Prisma.BatchPayload;

      if (isToAll) {
        const userIds = await prisma.captain.findMany({
          select: {
            captainId: true,
          },
        });

        sentNotifications = await prisma.notification.createMany({
          data: userIds.map((user) => ({
            captainId: user.captainId,
            title,
            message,
            type,
            status: NotificationStatus.UNREAD,
          })),
        });
      } else {
        const userIds = await prisma.captain.findMany({
          select: {
            captainId: true,
          },
          where: {
            rSectorBaseName: sectorBaseName,
            rSectorSuffixName: sectorSuffixName,
          },
        });

        sentNotifications = await prisma.notification.createMany({
          data: userIds.map((user) => ({
            captainId: user.captainId,
            title,
            message,
            type,
            status: NotificationStatus.UNREAD,
          })),
        });
      }

      res
        .status(200)
        .json({ message: `Notification sent to ${sentNotifications.count}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default notificationController;