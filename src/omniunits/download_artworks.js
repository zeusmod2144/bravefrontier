const axios = require('axios');
const fs = require('fs');
const fsPromises = fs.promises;
const { join } = require('path');
const sharp = require('sharp');
const omniUnitsFile = join(__dirname, '..', '..', 'src', 'omniunits', 'data.json');

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
            // const file = await sharp(data).jpeg().toFile(`src/omniunits/tmp/artworks/${omniUnit.id}.jpg`);
            console.log(`${omniUnit.id}. ${omniUnit.name} downloaded. Size: ${resizeFileByHalf.size} bytes`);
        }
    } catch (error) {
        console.log(error);
    }
})();