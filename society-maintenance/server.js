require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => { console.log("Connected to MongoDB"); })
.catch(err => console.error("MongoDB connection error:", err));

const roomSchema = new mongoose.Schema({
    block: String,
    roomNumber: String,
    floor: Number,
    ownerName: String,
    pendingMonths: Number,
    totalPaidMonths: Number,
    payments: [],
    
  });
  

const Room = mongoose.model('Room', roomSchema);

// GET All Rooms
app.get('/rooms', async (req, res) => {
    const rooms = await Room.find();
    res.json(rooms);
});

// PAY Monthly Maintenance
app.post('/pay/:roomId', async (req, res) => {
    const { monthsPaid } = req.body;
    const room = await Room.findById(req.params.roomId);

    if (monthsPaid > room.pendingMonths) {
        return res.status(400).json({ error: "Cannot pay more than pending months." });
    }

    room.pendingMonths -= monthsPaid;
    await room.save();

    res.json({ success: true });
});

  
  app.post('/update-pending/:roomId', async (req, res) => {
    const { pendingMonths, ownerName } = req.body;
    const room = await Room.findById(req.params.roomId);
    
    room.pendingMonths = pendingMonths;
    room.ownerName = ownerName;
    
    await room.save();
    res.json({ success: true });
});


// Seed DB with rooms (only run once)
app.post('/seed', async (req, res) => {
    const blocks = ['A', 'B', 'C'];
    const ownerNames = ['John', 'Ali', 'Maria', 'Asif', 'Sneha', 'Vikas', 'Meena', 'Amit', 'Fatima', 'Rohit'];

    for (let b = 0; b < blocks.length; b++) {
        let block = blocks[b];
        for (let floor = 1; floor <= 5; floor++) {
            for (let room = 1; room <= 4; room++) {
                let baseRoomNo = 100 * floor;
                let roomNumber = (block === 'A') ? baseRoomNo + room :
                                 (block === 'B') ? baseRoomNo + room + 4 :
                                 baseRoomNo + room + 8;
                let randomName = ownerNames[Math.floor(Math.random() * ownerNames.length)];

                await Room.create({
                    block,
                    roomNumber: roomNumber.toString(),
                    floor,
                    ownerName: randomName,
                    pendingMonths: Math.floor(Math.random() * 12)  // random pending months between 0-11
                });
            }
        }
    }
    res.send("Seeded with pending months!");
});

  

// New route for pending payments
app.get('/pending', async (req, res) => {
    const rooms = await Room.find();
    const today = new Date();
  
    const pendingList = rooms.map(room => {
      const possessionMonths = 
        (today.getFullYear() - room.possessionDate.getFullYear()) * 12 + 
        (today.getMonth() - room.possessionDate.getMonth()) + 1;
  
      const pendingMonths = possessionMonths - room.totalPaidMonths;
  
      return {
        _id: room._id,  // <-- here you're correctly sending _id
        roomNumber: room.roomNumber,
        block: room.block,
        ownerName: room.ownerName,
        pendingMonths: pendingMonths < 0 ? 0 : pendingMonths
      };
    });
  
    // ✅ Send response only ONCE
    res.json(pendingList);
  });
  



app.listen(5000, () => console.log("Server started on port 5000"));
