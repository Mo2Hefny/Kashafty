import db from "../database/db.js"

const captainAttendanceController = {
    upsertAttendance: async (req, res) => {
        try {
            const  attendanceRecords  = req.body.body

            if (attendanceRecords === 0) {
                return res.status(404).json({
                    error: "No records were found"
                })
            }

            const weekNumber = attendanceRecords[0].weekNumber;
            const termNumber = attendanceRecords[0].termNumber;

            const prevRecords = await db.query(`
                SELECT *
                FROM "CaptainAttendance"
                WHERE "weekNumber" = $1 AND "termNumber" = $2;
            `,
            [weekNumber, termNumber])

            let result = [];
            
            // If the attendance records already exists then update them, if not insert a new records
            if (prevRecords.rowCount === 0)
            {
                for (let i = 0; i < attendanceRecords.length; i++) {   

                    // Insert a new record from the attendance array into the databse
                    const queryResult = await db.query(`
                        INSERT INTO "CaptainAttendance" VALUES ($1, $2, $3, $4)
                        RETURNING *;
                    `,
                    [attendanceRecords[i].captainId, attendanceRecords[i].weekNumber, attendanceRecords[i].termNumber, attendanceRecords[i].attendanceStatus]
                    )

                    // Add the newly inserted record to the result array to return back
                    result.push(queryResult.rows[0]);
                }
            }
            else {
                for (let i = 0; i < attendanceRecords.length; i++) {
                    
                    // Update the current record from the array
                    const queryResult = await db.query(`
                        UPDATE "CaptainAttendance" SET "attendanceStatus" = $4
                        WHERE "captainId" = $1 AND "weekNumber" = $2 AND "termNumber" = $3
                        RETURNING *;
                    `,
                    [attendanceRecords[i].captainId, attendanceRecords[i].weekNumber, attendanceRecords[i].termNumber, attendanceRecords[i].attendanceStatus]
                    )

                    // Add the info about the updated record into the result array
                    result.push(queryResult.rows[0]);
                }
            }

            // Return a success message
            res.status(200).json({
                message: "Successful insertion/update",
                body: result,
                count: result.length,
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: 'An error occured while inserting/updating captain Attendance',
                body: error,
            })
        }
    },
    getSectorAttendance: async (req, res) => {
        try {
            const { baseName, suffixName, weekNumber, termNumber } = req.query

            const result = await db.query(`
                SELECT "Captain".*, "CaptainAttendance".* FROM "Captain" LEFT JOIN "CaptainAttendance" ON "Captain"."captainId" = "CaptainAttendance"."captainId"
                AND "CaptainAttendance"."weekNumber" = $3 AND "CaptainAttendance"."termNumber" = $4
                INNER JOIN "Sector" ON "Sector"."baseName" = "Captain"."rSectorBaseName" AND "Sector"."suffixName" = "Captain"."rSectorSuffixName"
                WHERE "Sector"."baseName" = $1 AND "Sector"."suffixName" = $2;
            `,
            [baseName, suffixName, weekNumber, termNumber])

            if (result.rowCount === 0) {
                return res.status(404).json({
                    error: "No data exists for the provided info"
                })
            }

            res.status(200).json({
                message: "Successful retrieval",
                body: result.rows,
                count: result.rowCount
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: 'An error occured while retrieving captain Attendance',
                body: error,
            })
        }
    },
    getCaptainAttendance: async (req, res) => {
        try {
            const { captainId, weekNumber, termNumber } = req.params

            const result = await db.query(`
                SELECT *
                FROM "CaptainAttendance"
                WHERE "captainId" = $1 AND "weekNumber" = $2 AND "termNumber" = $3
            `,
            [captainId, weekNumber, termNumber])

            res.status(200).json({
                message: "Successful retrieval",
                body: result.rows,
                count: result.rowCount,
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: 'An error occured while retrieving captain Attendance',
                body: error,
            })
        }
    }
}

export default captainAttendanceController;