const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const escpos = require('escpos');

// Load network adapter
escpos.Network = require('escpos-network');

// Printer IP address
const PRINTER_IP = '192.168.1.188';
const PRINTER_PORT = 9100; // Default port for network printers

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware to parse JSON data
app.use(express.json());

// Route to handle printing
app.post('/print', (req, res) => {
    const { text } = req.body;

    const device = new escpos.Network(PRINTER_IP, PRINTER_PORT);
    const printer = new escpos.Printer(device);

    device.open(function(error){
        if (error) {
            return res.status(500).send('Printer connection error');
        }

        printer
            .text(text)
            .cut()
            .close();

        res.status(200).send('Print job sent');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
