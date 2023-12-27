import cron from 'node-cron'
import db from './db.js'

// Run the cron job every Sunday at 00:00
cron.schedule('0 0 * * 0', async () => {
    try {
        // Get the current date
        const currentDate = new Date()

        // Get the current term
        let result = await db.query(
            `SELECT * FROM "Term" WHERE "termNumber" IN 
            (SELECT COALESCE(MAX("termNumber"), 0) FROM "Term");`
        )
        if (
            !result.rows.length ||
            result.rows[0].endDate <= currentDate ||
            result.rows[0].startDate > currentDate
        )
            return

        const currentTermNumber = result.rows[0].termNumber

        // Get the current week
        result = await db.query(
            `SELECT COALESCE(MAX("weekNumber"), 0) AS max FROM "Week" WHERE "termNumber" = $1;`,
            [currentTermNumber]
        )
        const currentWeekNumber = result.rows[0].max

        console.log('Add a new week', currentWeekNumber + 1)
        // Add a new week
        result = await db.query(
            `INSERT INTO "Week"
            VALUES ($1, $2, $3, $4)
            RETURNING *;`,
            [currentWeekNumber + 1, false, currentDate, currentTermNumber]
        )
    } catch (error) {
        console.log(error)
    }
})