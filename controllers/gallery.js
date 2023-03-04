
const fs = require('fs')
const sharp = require('sharp')
const gallery = async (req, res) => {
    try {
        if (!req.files) {
            let message = "File Empty"
            return res.render("error", { message })
        }
        console.log(req.files);
        const { image } = req.files;
        const { filename } = req.body
        const folderName = `public/results/images/${filename}`
        let prop = encodeURIComponent(filename)
        if (req.files) {
            //pass the name inputed as the file name down
            if (!image.mimetype.includes("image")) {
                let message = "Please Select An Image"
                return res.render("error", { message })
            }
        }
        if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName)
        }
        const processImage = (size) => sharp(image.data)
            .resize(size, size)
            .webp({ lossless: true })
            .toFile(`./public/results/images/${filename}/${filename}-${size}.webp`);
        let sizes = [144, 160, 180, 240, 288, 360, 480, 600, 700];
        Promise.all(sizes.map(processImage));
        let counter = 0;
        // for (let i = 0; i < 10_000_000_000; i++) {
        //     counter++;
        // }

        return res.redirect("/results/?filenames=" + prop);
    } catch (error) {
        console.log(error.message);
        const { message } = error
        return res.render("error", { message })
    }

}

module.exports = { gallery }