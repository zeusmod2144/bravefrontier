const axios = require('axios');
const fs = require('fs');
const fsPromises = fs.promises;
const { join } = require('path');

const omniUnitsFile = join(__dirname, '..', '..', 'data', 'omniunits', 'raw.json');

const downloadFile = (link) => {
    return new Promise((resolve, reject) => {
        axios.get(link, {
            responseType: 'stream'
        }).then(response => {
            return resolve(response.data)
        })
            .catch(error => {
                return reject(error);
            })
    })
}

(async () => {
    try {
        fs.mkdir(join(__dirname, '..', '..', 'tmp', 'omniunits', 'thumbnails'), { recursive: true }, (err) => {
            if (err) throw err;
        });
        const text = await fsPromises.readFile(omniUnitsFile, 'utf8');
        const omniUnits = JSON.parse(text);
        for (const omniUnit of omniUnits) {
            await downloadFile(omniUnit.thumbnail)
                .then(data => {
                    data.pipe(fs.createWriteStream(join(__dirname, '..', '..', 'tmp', 'omniunits', 'thumbnails', `${omniUnit.id}.png`)));
                    console.log(`Success download thumbnails of ${omniUnit.name}`);
                });
        }
    } catch (error) {
        console.log(error);
    }
})();