
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const multipleImageUpload = async (req, res) => {
    //      async function (req, res) {
    try {
        // console.log(req.files.image[0].md5);
        const folderName = req.files.image[0].md5

        // fs.mkdir(path.join(__dirname, `/public/images/${folderName}`), (err) => {

        const newDir = fs.mkdir(path.join(`./public/images/${folderName}`), (err) => {
            try {

                if (err) {

                    fs.rmSync(path.join(`./public/images/${folderName}`), { recursive: true, force: true });
                    throw new Error("Couldnt make directory");
                }
                req.files.image.forEach(async (image) => {
                    const processImage = async (size) =>
                        await sharp(image.data)
                            // .resize(size, size)
                            // .webp({ lossless: true })
                            .webp({ quality: 90 })
                            .toFile(`./public/images/${folderName}/${path.parse(image.name).name}.webp`);
                    await processImage()
                });

            } catch (error) {
                console.error(error)
            }
        });
        // return
        console.log(path.join(__dirname, `../public/images/${folderName}`))

        const querystring = require('querystring')
        const query = querystring.stringify({
            "foldername": folderName
        })
        return res.redirect("/download?" + query);
    } catch (error) {
        console.log(error.message);
        const { message } = error
        return res.render("error", { message })
    }
}


const multipleImageDownload = async (req, res) => {
    console.log("here 1");

    try {
        console.log("here 2");
        const folderName = req.query.foldername
        const imgDirPath = path.join(__dirname, `../public/images/${folderName}`);
        let imgFiles = fs.readdirSync(imgDirPath).map((image) => {
            return {
                path: `./public/images/${folderName}/${image}`,
                name: image
            }
        });
        console.log('here');
        let fullyprocessed = false;
        console.log("here");
        const intervalId = setInterval(() => {
            imgFiles.forEach((image) => {
                // console.log(image);
                fs.stat(image.path, async (err, stats) => {
                    if (err) {
                        console.log(`File doesn't exist.`)
                    } else {
                        console.log(stats.size)
                        if (stats.size == 0) {
                            console.log("not fully processed");
                        }
                        if (stats.size > 0) {
                            console.log("fully processed");
                            fullyprocessed = true
                            return
                        }
                    }
                })
            })
        }, 5000);
        const interval2Id = setInterval(async () => {
            console.log(fullyprocessed);
            if (fullyprocessed) {
                console.log("zipping already");
                clearInterval(intervalId)
                await res.zip(imgFiles);
                clearInterval(interval2Id)
                setTimeout(async () => {
                    fs.rmSync(imgDirPath, { recursive: true, force: true });
                }, 30000);
            }
        }, 5000);

        //pass the array of object into the zip function.  
    } catch (error) {
        console.log(error);
        return res.render('error', { message: error.message })
    }
}



module.exports = { multipleImageDownload, multipleImageUpload }