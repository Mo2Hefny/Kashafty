import db from '../database/db.js'

const alertController = {
    getAlert: async (req, res) => {
        try {
            const { id } = req.params

            // get alert
            const result = await db.query(
                `SELECT N.*
                FROM "Notification" AS N, "RecieveNotification" AS R
                WHERE N."notificationId" = R."notificationId" AND
                R."captainId" = $1 AND
                N."notificationId" = $2;`,
                [req.captain.captainId, id]
            )

            if (!result.rowCount)
                return res.status(404).json({ error: 'Alert not found' })

            res.status(200).json({
                message: 'Alert successfully found',
                body: result.rows[0],
            })
        } catch (error) {
            console.error(error)
            res.status(500).json({
                error: 'An error occured while getting alert',
            })
        }
    },

    createAlert: async (req, res) => {
        try {
            const { message, contentType } = req.body

            const result = await db.query(
                `INSERT INTO "Notification" ("timestamp", "message", "contentType")
                VALUES(NOW(), $1, $2) RETURNING *;`,
                [message, contentType]
            )

            res.status(200).json({
                message: 'Alert successfully created',
                body: result.rows[0],
            })
        } catch (error) {
            console.error(error)
            res.status(500).json({
                error: 'An error occured while creating alert',
            })
        }
    },

    sendAlert: async (req, res) => {
        try {
            const { id } = req.params
            const { sectorBaseName, sectorSuffixName } = req.body

            let result

            if (!sectorBaseName || !sectorSuffixName) {
                // send alert to all captains
                result = await db.query(
                    `INSERT INTO "RecieveNotification" ("notificationId", "captainId", "status")
                    SELECT $1, C."captainId", 'unread'
                    FROM "Captain" AS C
                    RETURNING *;`,
                    [id]
                )
            } else {
                // send alert to all captains in sector
                result = await db.query(
                    `INSERT INTO "RecieveNotification" ("notificationId", "captainId", "status")
                    SELECT $1, C."captainId", 'unread'
                    FROM "Captain" AS C
                    WHERE C."rSectorBaseName" = $2 AND
                    C."rSectorSuffixName" = $3
                    RETURNING *;`,
                    [id, sectorBaseName, sectorSuffixName]
                )
            }

            res.status(200).json({
                message: 'Alert successfully sent',
                body: result.rows[0],
            })
        } catch (error) {
            console.error(error)
            res.status(500).json({
                error: 'An error occured while sending alert',
            })
        }
    },

    deleteAlert: async (req, res) => {
        try {
            const { id } = req.params
            const result = await db.query(
                `DELETE FROM "Notification" WHERE "notificationId" = $1 RETURNING *;`,
                [id]
            )

            return res.status(200).json({
                message: 'Alert successfully deleted',
                body: result.rows[0],
            })
        } catch (error) {
            console.error(error)
            res.status(500).json({
                error: 'An error occured while deleting alert',
            })
        }
    },

    getAllAlerts: async (req, res) => {
        try {
            const { status, contentType } = req.body
            const result = await db.query(
                `SELECT N.*, R."status"
                FROM "Notification" AS N, "RecieveNotification" AS R
                WHERE N."notificationId" = R."notificationId" AND
                R."captainId" = $1;`,
                [req.captain.captainId]
            )

            let alerts = result.rows
            if (status) {
                alerts = alerts.filter((alert) => alert.status === status)
            }
            if (contentType) {
                alerts = alerts.filter(
                    (alert) => alert.contentType === contentType
                )
            }

            res.status(200).json({
                message: 'get Alerts successfully',
                body: alerts,
            })
        } catch (error) {
            console.error(error)
            res.status(500).json({
                error: 'An error occured while getting alerts',
            })
        }
    },
}

export default alertController
