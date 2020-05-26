const axios = require('axios');
const fs = require('fs');
const fsPromises = fs.promises;
const sharp = require('sharp');
const { join } = require('path');
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const del = require('del');

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
        fs.mkdir('src/omniunits/tmp/thumbnails', { recursive: true }, (err) => {
            if (err) throw err;
        });
        const text = await fsPromises.readFile(omniUnitsFile, 'utf8');
        const omniUnits = JSON.parse(text);
        for (const omniUnit of omniUnits) {
            const response = await downloadFile(omniUnit.thumbnail);
            const data = await response.data;
            const resizeFileByHalf = await sharp(data)
            .metadata()
            .then(({ width, height }) => sharp(data)
              .resize(Math.round(width * 0.5), Math.round(height * 0.5))
              .png()
              .toFile(`src/omniunits/thumbnails/${omniUnit.id}.png`)
            );
            console.log(`${omniUnit.id}. ${omniUnit.name} downloaded. Size: ${bytesToSize(resizeFileByHalf.size)}`);
        }

        // Convert to webp
        await imagemin(['src/omniunits/thumbnails/*.png'], {
            destination: 'src/omniunits/thumbnails',
            plugins: [
                imageminWebp({quality: 50})
            ]
        });

        console.log('Compression thumbnail units success!');

        await del('src/omniunits/tmp');
    } catch (error) {
        console.log(error);
    }
})();