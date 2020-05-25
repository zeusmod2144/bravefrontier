const axios = require('axios');
const fs = require('fs');
const fsPromises = fs.promises;
const sharp = require('sharp');
const { join } = require('path');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminWebp = require('imagemin-webp');

const omniUnitsFile = join(__dirname, 'raw.json');
const { bytesToSize } = require('../helper.js');

const downloadFile = (link) => {
    return new Promise((resolve, reject) => {
        axios.get(link, {
            responseType: 'arraybuffer'
        }).then(response => {
                return resolve(response)
            })
            .catch(error => {
                return reject(error);
            })
    })
}

(async () => {
    try {
        fs.mkdir('src/omniunits/tmp/artworks', { recursive: true }, (err) => {
            if (err) throw err;
        });
        const text = await fsPromises.readFile(omniUnitsFile, 'utf8');
        const omniUnits = JSON.parse(text);
        for (const omniUnit of omniUnits) {
            const response = await downloadFile(omniUnit.artwork);
            const data = await response.data;
            const resizeFileByHalf = await sharp(data)
            .metadata()
            .then(({ width, height }) => sharp(data)
              .resize(Math.round(width * 0.3), Math.round(height * 0.3))
              .png()
              .toFile(`src/omniunits/tmp/artworks/${omniUnit.id}.png`)
            );
            console.log(`${omniUnit.id}. ${omniUnit.name} downloaded. Size: ${bytesToSize(resizeFileByHalf.size)}`);
        }

        // Reduce png size with pngquant
        await imagemin(['src/omniunits/tmp/artworks/*.png'], {
            destination: 'src/omniunits/artworks',
            plugins: [
                imageminPngquant()
            ]
        });

        // Convert to webp
        await imagemin(['src/omniunits/artworks/*.png'], {
            destination: 'src/omniunits/artworks',
            plugins: [
                imageminWebp({quality: 50})
            ]
        });

        console.log('Compression artwork units success!');
    } catch (error) {
        console.log(error);
    }
})();