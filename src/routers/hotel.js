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
 *               - hotelName
 *               - adress
 *               - pointOfUsers
 *               - description
 *               - price
 *             properties:
 *               hotelName:
 *                 type: string
 *                 example: Sky
 *               adress:
 *                 type: string
 *                 example: TBZ
 *               pointOfUsers:
 *                 type: number
 *                 example: 3
 *               description:
 *                 type: string
 *                 example: lorem
 *               price:
 *                 type: number
 *                 example: 10.3
 *     responses:
 *       201:
 *         description: Successfully posted hotel
 *       400:
 *         description: Hotel with the same data already exists.
 *       500:
 *         description: Server error
 */

router.post('/hotel', auth, checkRole([roles.value.Admin, roles.value.Marketer, roles.value.SuperAdmin]), async (req, res) => {
    try {
      const { hotelName, adress, pointOfUsers, description, price } = req.body;

      const existingHotel = await Hotel.findOne({ hotelName, adress });
      if (existingHotel) {
        return res.status(400).send({ error: 'Hotel already exists.' });
      }

      const hotel = new Hotel({
        hotelName,
        adress,
        pointOfUsers,
        description,
        price
      });

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookTime
 *               - exitTime
 *             properties:
 *               bookTime:
 *                 type: string
 *                 format: date
 *                 example: 2025-07-30
 *               exitTime:
 *                 type: string
 *                 format: date
 *                 example: 2025-07-31
 *     responses:
 *       200:
 *         description: Successfully booked hotel
 *       400:
 *         description: Missing or invalid dates
 *       404:
 *         description: User or hotel not found
 *       500:
 *         description: Error reserving hotel
 */

router.post('/reserve-hotel/:hotelId', auth, async (req, res) => {
    const userId = req.user._id;
    const hotelId = req.params.hotelId;
    const { bookTime, exitTime } = req.body;

    try {
        const user = await User.findById(userId);
        const hotel = await Hotel.findById(hotelId);

        if (!user) return res.status(404).send({ error: 'User not found' });
        if (!hotel) return res.status(404).send({ error: 'Hotel not found' });

        if (!bookTime || !exitTime) {
            return res.status(400).send({ error: 'bookTime and exitTime are required' });
        }

        // calculate total price
        const days = Math.ceil((new Date(exitTime) - new Date(bookTime)) / (1000 * 60 * 60 * 24));
        if (days <= 0) {
            return res.status(400).send({ error: 'exitTime must be after bookTime' });
        }

        const totalPrice = hotel.price * days;

        user.hotelReservations.push({ hotelId, bookTime, exitTime });
        await user.save();

        res.send({
            message: 'Reservation successful',
            hotel: hotel.hotelName,
            bookTime,
            exitTime,
            totalPrice
        });
    } catch (err) {
        res.status(500).send({ error: 'Error reserving hotel' });
    }
});

module.exports=router;