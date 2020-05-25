const axios = require('axios');
const fs = require('fs');
const fsPromises = fs.promises;
const sharp = require('sharp');
const { join } = require('path');
const imagemin = require('imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const omniUnitsFile = join(__dirname, '..', '..', 'src', 'omniunits', 'data.json');
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
              .resize(Math.round(width * 0.5), Math.round(height * 0.5))
              .jpeg()
              .toFile(`src/omniunits/tmp/artworks/${omniUnit.id}.jpg`)
            );
            console.log(`${omniUnit.id}. ${omniUnit.name} downloaded. Size: ${bytesToSize(resizeFileByHalf.size)}`);
        }

        const files = await imagemin(['src/omniunits/tmp/artworks/*.{jpg,png}'], {
            destination: 'src/omniunits/artworks',
            plugins: [
                mozjpeg({ quality: 75 })
            ]
        });
    
        console.log(`${files.length} files has been compressed`);
    } catch (error) {
        console.log(error);
    }
})();