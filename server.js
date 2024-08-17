const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const escpos = require('escpos');

// Load the network adapter for ESC/POS
escpos.Network = require('escpos-network');

// Printer IP address and port (make sure these are correct for your printer)
const PRINTER_IP = '192.168.1.188';  // Replace with your printer's actual IP address
const PRINTER_PORT = 9100;  // Replace with the correct port if it's different

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware to parse JSON data
app.use(express.json());

// Route to handle printing
app.post('/print', (req, res) => {
    const { text } = req.body;

    console.log('Received print job with text:', text);
    console.log('Attempting to connect to printer at', PRINTER_IP, 'on port', PRINTER_PORT);

    // Set up the printer connection
    const device = new escpos.Network(PRINTER_IP, PRINTER_PORT);
    const printer = new escpos.Printer(device);

    // Try to open the connection to the printer
    device.open(function(error) {
        if (error) {
            console.error('Error connecting to printer:', error);
            return res.status(500).send('Printer connection error: ' + error.message);
        }

        console.log('Connected to printer. Sending print job...');
        
        // Send the text to the printer and cut the paper
        printer
            .text(text)
            .cut()
            .close(function() {
                console.log('Print job sent successfully.');
                res.status(200).send('Print job sent');
            });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
