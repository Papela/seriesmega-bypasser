const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { DateTime } = require('luxon');

const app = express();
app.use(cors());
app.use(express.static('public'));

// Ruta para el proxy
app.get('/proxy', async (req, res) => {
    const url = req.query.url;
    const validDomain = 'https://seriesmega.org';
  
    if (!url.startsWith(validDomain)) {
        return res.status(400).send(`La URL debe ser del dominio ${validDomain}`);
    }

    const userIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0];
     const now = DateTime.now().setZone('Europe/Madrid'); // Establecer la zona horaria
    const formattedDate = now.toFormat('yyyy-MM-dd HH:mm:ss'); // Formato deseado

    const logEntry = `IP: ${userIp}, Date: ${formattedDate}\n`;
    fs.appendFile('logs.txt', logEntry, (err) => {
        if (err) {
            console.error('Error al escribir en el archivo de logs:', err);
        }
    });
  
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'SeriesMega-Bypasser/1.0'
            }
        });
        res.send(response.data);
    } catch (error) {
        res.status(500).send('Error al acceder a la URL');
    }
});

app.get('/check-status', async (req, res) => {
    const id = req.query.id;
    const numCalls = parseInt(req.query.count) || 4; // Número de llamadas, predeterminado a 4 si no se proporciona
    const urls = [];

    for (let i = 0; i < numCalls; i++) {
        urls.push(`https://seriesmega.org/?trdownload=${i}&t=ser&trid=${id}`);
    }

    const results = await Promise.all(urls.map(async (url, index) => {
        try {
            const response = await axios.get(url, {
                validateStatus: (status) => status >= 200 && status < 400 // Aceptar solo códigos 2xx y 3xx
            });
            // Si el código final es 200, lo guardamos
            return { link: index, url, status: response.status === 200 ? response.status : null };
        } catch (error) {
            // Manejo de errores y estado
            if (error.response) {
                return { link: index, url, status: error.response.status };
            } else {
                return { link: index, url, status: 'Error' };
            }
        }
    }));

    const successfulResponses = results.filter(result => result.status === 200);

    res.json(successfulResponses);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
