const express = require('express')
const Hotel = require('../models/hotelSchema');
const User = require('../models/userSchema');
const auth = require('../authorization/authorization');
const { checkRole } = require('../authorization/checkRole');
const roles = require('../models/roles');

const router = express.Router()

/**
 * @swagger
 * /hotels:
 *   get:
 *     summary: Get's all hotels
 *     tags: [Hotel]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All hotel's found
 *       500:
 *         description: Server error
 */

router.get('/hotels' , async (req , res) =>{
    try {
        const hotels = await Hotel.find({});
        res.send(hotels);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch hotels.' });
    }
})


/**
 * @swagger
 * /hotel:
 *   post:
 *     summary: Post a hotel
 *     tags: [Hotel]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roles
 *             properties:
 *                 hotelName:
 *                   type: string
 *                   example: Sky
 *                 adress:
 *                   type: string
 *                   example: TBZ
 *                 pointOfUsers:
 *                   type: number
 *                   example: 3
 *                 description:
 *                   type: string
 *                   example: lorem
 *                 price:
 *                   type: number
 *                   example: 10.3
 *                 bookTime:
 *                   type: number
 *                   example: 2025-07-30
 *                 exitTime:
 *                   type: string
 *                   example: 2025-07-31
 *     responses:
 *       201:
 *         description: Successfully Posted hotel
 *       400:
 *         description: Hotel with the same data already exists.
 *       500:
 *         description: Server error
 */

router.post('/hotel', auth , checkRole([roles.value.Admin, roles.value.Marketer, roles.value.SuperAdmin]), async (req, res) => {
    try {
        const existingHotel = await Hotel.findOne(req.body);
        if (existingHotel) {
            return res.status(400).send({ error: 'Hotel with the same data already exists.' });
        }

        const hotel = new Hotel(req.body);
        await hotel.save();
        res.status(201).send(hotel);
    } catch (error) {
        res.status(400).send(error);
    }
});


/**
 * @swagger
 * /reserve-hotel/{hotelId}:
 *   post:
 *     summary: Reserve a hotel
 *     tags: [Hotel]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         schema:
 *           type: string
 *         required: true
 *         description: Hotel ID to reserve
 *     responses:
 *       200:
 *         description: Successfully booked hotel
 *       500:
 *         description: Error reserving hotel
 */

router.post('/reserve-hotel/:hotelId', auth , async (req, res) => {
    const userId = req.user._id;
    const hotelId = req.params.hotelId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        user.hotelReservations.push({ hotelId });
        await user.save();

        res.send({ message: 'Reservation successful' });
    } catch (err) {
        res.status(500).send({ error: 'Error reserving tour' });
    }
});

module.exports=router;