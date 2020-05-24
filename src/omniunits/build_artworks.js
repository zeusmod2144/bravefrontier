const imagemin = require('imagemin');
const mozjpeg = require('imagemin-mozjpeg');

(async () => {
    try {
        const files = await imagemin(['src/omniunits/tmp/artworks/*.{jpg,png}'], {
            destination: 'src/omniunits/artworks',
            plugins: [
                mozjpeg({ quality: 75 })
            ]
        });
    
        console.log(`${files.length} files has been compressed`);
        //=> [{data: <Buffer 89 50 4e …>, destinationPath: 'build/images/foo.jpg'}, …]
    } catch (error) {
        console.log(error);
    }
	
})();