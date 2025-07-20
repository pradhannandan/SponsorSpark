// server.js (Final Version with Explicit Path)
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') }); // <-- This is the new, robust line

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


// --- MongoDB Connection ---
// This will now correctly use the MONGO_URI from your .env file
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas!');
    })
    .catch(err => {
        console.error('❌ Error connecting to MongoDB:', err.message);
    });

// --- Mongoose Schema for Events ---
const eventSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    location: { type: String, default: '' },
    audience: { type: String, default: 'General' },
    audienceSize: { type: Number, default: 0 },
    sponsorship: { type: String, default: '' },
    description: { type: String, required: true },
    status: { type: String, default: 'Draft' },
    imageUrl: { type: String, default: '/placeholder.png' },
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

// --- Multer Configuration for Image Uploads ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

// --- API Routes (No changes here) ---

// GET all events
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.status(200).json(events);
    } catch (err) {
        console.error('❌ GET /api/events Error:', err.message);
        res.status(500).json({ message: 'Server error while fetching events.' });
    }
});

// POST a new event
app.post('/api/events', upload.single('image'), async (req, res) => {
    try {
        const eventData = { ...req.body };
        if (req.file) {
            eventData.imageUrl = `/uploads/${req.file.filename}`;
        }
        
        const newEvent = new Event(eventData);
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (err) {
        console.error('❌ POST /api/events Error:', err.message);
        res.status(400).json({ message: 'Failed to create event. Check required fields.' });
    }
});

// UPDATE an event
app.put('/api/events/:id', upload.single('image'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(updatedEvent);
    } catch (err) {
        console.error(`❌ PUT /api/events/${req.params.id} Error:`, err.message);
        res.status(400).json({ message: 'Failed to update event.' });
    }
});

// DELETE an event
app.delete('/api/events/:id', async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error(`❌ DELETE /api/events/${req.params.id} Error:`, err.message);
        res.status(500).json({ message: 'Server error while deleting event.' });
    }
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
