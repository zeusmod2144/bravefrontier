require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const omniUnitsFile = path.join(__dirname, '..', '..', 'data', 'omniunits', 'raw.json');

const downloadFile = (link) => {
    return new Promise((resolve, reject) => {
        axios.get(link, {
            responseType: 'arraybuffer'
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
        fs.mkdir(path.join(__dirname, '..', '..', 'tmp', 'omniunits', 'thumbnails'), { recursive: true }, (err) => {
            if (err) throw err;
        });
        const text = await fsPromises.readFile(omniUnitsFile, 'utf8');
        const omniUnits = JSON.parse(text);
        for (const omniUnit of omniUnits) {
            await downloadFile(omniUnit.thumbnail)
                .then(data => {
                    let options = {
                        public_id: omniUnit.id,
                        folder: 'bravefrontier/omniunits/thumbnails'
                    };
                    cloudinary.uploader.upload_stream(options, (error, result) => {
                        if (error) throw error;
                        console.log(`Success upload ${omniUnit.name}'s thumbnail to ${result.secure_url}`);
                    }).end(data);
                });
        }
    } catch (error) {
        console.log(error);
    }
})();