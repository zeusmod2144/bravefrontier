const axios = require('axios');
const fs = require('fs');
const fsPromises = fs.promises;
const { join } = require('path');
const omniUnitsFile = join(__dirname, '..', '..', 'src', 'omniunits', 'data.json');

const downloadFile = (params) => {
    return new Promise((resolve, reject) => {
        axios.get(params.link, {
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
        fs.mkdir('src/omniunits/artwork', { recursive: true }, (err) => {
            if (err) throw err;
        });
        const text = await fsPromises.readFile(omniUnitsFile, 'utf8');
        const omniUnits = JSON.parse(text);
        for (const omniUnit of omniUnits) {
            const params = {
                link: omniUnit.artwork
            };
            await downloadFile(params).then(data => {
                data.pipe(fs.createWriteStream(`src/omniunits/artwork/${omniUnit.id}.png`));
            })
        }
    } catch (error) {
        console.log(error);
    }
})();