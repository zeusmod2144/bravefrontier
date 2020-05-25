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
        fs.mkdir('src/omniunits/tmp/thumbnails', { recursive: true }, (err) => {
            if (err) throw err;
        });
        const text = await fsPromises.readFile(omniUnitsFile, 'utf8');
        const omniUnits = JSON.parse(text);
        for (const omniUnit of omniUnits) {
            const response = await downloadFile(omniUnit.thumbnail);
            const data = await response.data;
            const file = await sharp(data)
            .jpeg()
            .toFile(`src/omniunits/tmp/thumbnails/${omniUnit.id}.jpg`);
            console.log(`${omniUnit.id}. ${omniUnit.name} downloaded. Size: ${bytesToSize(file.size)}`);
        }

        const files = await imagemin(['src/omniunits/tmp/thumbnails/*.{jpg,png}'], {
            destination: 'src/omniunits/thumbnails',
            plugins: [
                mozjpeg({ quality: 75 })
            ]
        });
    
        console.log(`${files.length} files has been compressed`);
    } catch (error) {
        console.log(error);
    }
})();