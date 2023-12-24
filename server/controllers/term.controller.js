import db from '../database/db.js'

const termController = {
    // @desc    Get a term
    // @route   GET /api/term/
    // @access  Private
    getTerm: async (req, res) => {
        if (req.currentTerm.termNumber === 0) {
            return res.status(400).json({
                error: 'There is no terms in the system',
            })
        }
        res.status(200).json({
            message: 'Current term found successfully',
            body: req.currentTerm,
        })
    },

    // @desc    Add a term
    // @route   POST /api/term/
    // @access  Private
    addTerm: async (req, res) => {
        try {
            const { termName, startDate, endDate } = req.body

            if (startDate >= endDate) {
                return res.status(400).json({
                    error: 'Invalid dates',
                })
            }

            const termNumber = req.currentTerm.termNumber + 1

            if (
                req.currentTerm.termNumber &&
                req.currentTerm.endDate >= startDate
            ) {
                return res.status(400).json({
                    error: 'Invalid start date: Overlapping terms',
                })
            }

            const result = await db.query(
                `INSERT INTO "Term" VALUES ($1, $2, $3, $4)
                RETURNING *;`,
                [termNumber, termName, startDate, endDate]
            )

            const newTerm = result.rows[0]

            res.status(201).json({
                message: 'Term added successfully',
                body: newTerm,
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: 'An error occurred while adding the term',
            })
        }
    },

    // @desc    Update a term
    // @route   PATCH /api/term/
    // @access  Private
    updateTerm: async (req, res) => {
        try {
            const { termName, startDate, endDate } = req.body

            const result = await db.query(
                `UPDATE "Term" SET "termName" = $1, "startDate" = $2, "endDate" = $3
                WHERE "termNumber" IN
                (SELECT COALESCE(MAX("termNumber"), 0) FROM "Term")
                RETURNING *;`,
                [termName, startDate, endDate]
            )
            if (!result.rows.length) {
                return res.status(400).json({
                    error: 'There is no terms in the system',
                })
            }

            const updatedTerm = result.rows[0]

            res.status(200).json({
                message: 'Term updated successfully',
                body: updatedTerm,
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: 'An error occurred while updating the term',
            })
        }
    },

    // @desc    Get a week
    // @route   GET /api/term/week
    // @access  Private
    getWeek: async (req, res) => {
        try {
            if (req.currentWeek.weekNumber === 0) {
                return res.status(400).json({
                    error: 'There is no weeks or terms in the system',
                })
            }
            res.status(200).json({
                message: 'Current week found successfully',
                body: req.currentWeek,
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: 'An error occurred while getting the week',
            })
        }
    },

    // @desc    Cancel a week
    // @route   PATCH /api/term/week
    // @access  Private
    cancelWeek: async (req, res) => {
        try {
            if (req.currentWeek.weekNumber === 0) {
                return res.status(400).json({
                    error: 'There is no weeks or terms in the system to be cancelled',
                })
            }
            const result = await db.query(
                `UPDATE "Week" SET "cancelled" = true
                WHERE "termNumber" = $1 AND "weekNumber" = $2
                RETURNING *;`,
                [req.currentWeek.termNumber, req.currentWeek.weekNumber]
            )

            const updatedWeek = result.rows[0]

            res.status(200).json({
                message: 'Week cancelled successfully',
                body: updatedWeek,
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: 'An error occurred while cancelling the week',
            })
        }
    },

    // @desc    Get remaining weeks
    // @route   GET /api/term/remaining
    // @access  Private
    getRemainingWeeks: async (req, res) => {
        try {
            const currentDate = new Date()
            if (
                req.currentTerm.termNumber === 0 ||
                req.currentTerm.endDate < currentDate
            ) {
                return res.status(400).json({
                    error: 'There is no running term in the system',
                })
            }

            const remainingWeeks = Math.ceil(
                (req.currentTerm.endDate - currentDate) /
                    (1000 * 60 * 60 * 24 * 7)
            )

            res.status(200).json({
                message: 'Remaining weeks found successfully',
                body: remainingWeeks,
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: 'An error occurred while getting the remaining weeks',
            })
        }
    },
}

export default termController
