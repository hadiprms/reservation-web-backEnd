const express = require('express')
const path = require('path');
const Tour = require('../models/tourSchema');
const auth = require('../authorization/authorization');
const User = require('../models/userSchema');
const { checkRole } = require('../authorization/checkRole');
const roles = require('../models/roles');
const upload = require('../multer/uploadMiddleware')

const router = express.Router();

/**
 * @swagger
 * /tours:
 *   get:
 *     summary: Get's all tour's
 *     tags: [Tour]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All tour's found
 *       500:
 *         description: Server error
 */

router.get('/tours' , async (req , res) =>{
    try {
        const tours = await Tour.find({});
        res.send(tours);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch tours.' });
    }
})


/**
 * @swagger
 * /tour:
 *   post:
 *     summary: Post a hotel
 *     tags: [Tour]
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
 *                 origin:
 *                   type: string
 *                   example: Tabriz
 *                 destination:
 *                   type: string
 *                   example: Latoon
 *                 timeToGo:
 *                   type: string
 *                   example: 2025-07-30
 *                 timeToBack:
 *                   type: string
 *                   example: 2025-07-31
 *                 description:
 *                   type: string
 *                   example: Staying night in jungle
 *                 price:
 *                   type: number
 *                   example: 34.2
 *                 capacity:
 *                   type: number
 *                   example: 20
 *                 images:
 *                   type: [string]
 *     responses:
 *       201:
 *         description: Successfully Posted hotel
 *       400:
 *         description: Hotel with the same data already exists.
 *       500:
 *         description: Server error
 */

router.post(
  '/tour',
  auth,
  checkRole([roles.value.Admin, roles.value.Marketer, roles.value.SuperAdmin]),
  upload.array('images', 5),
  async (req, res) => {
    try {
      const existingTour = await Tour.findOne(req.body);
      if (existingTour) {
        return res.status(400).send({ error: 'Tour with the same data already exists.' });
      }

      // Base URL for backend
      const baseUrl = `${req.protocol}://${req.get('host')}`; //http://localhost:5000

      // Create full URLs for uploaded images
      const images = req.files
        ? req.files.map(file => `${baseUrl}/uploads/tours/${path.basename(file.path)}`)
        : [];

      const tourData = { ...req.body, images };

      const tour = new Tour(tourData);
      await tour.save();

      res.status(201).send(tour);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
);


/**
 * @swagger
 * /reserve-tour/{tourId}:
 *   post:
 *     summary: Reserve a hotel
 *     tags: [Tour]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tourId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tour ID to reserve
 *     responses:
 *       200:
 *         description: Successfully booked tour
 *       500:
 *         description: Error reserving tour
 */

router.post('/reserve-tour/:tourId', auth , async (req, res) => {
    const userId = req.user._id;
    const tourId = req.params.tourId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        user.tourReservations.push({ tourId });
        await user.save();

        res.send({ message: 'Reservation successful' });
    } catch (err) {
        res.status(500).send({ error: 'Error reserving tour' });
    }
});

module.exports = router;