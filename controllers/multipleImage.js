
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const multipleImageUpload = async (req, res) => {
    //This is the logic that processes uploaded files
    try {
        //Check if user uploads any file that is not an image
        req.files.image.forEach((image) => {
            if (!image.mimetype.includes("image")) {
                let message = "Please Select Only Images"
                return res.render("error", { message })
            }
        })
        //Check if user selects less than two image
        if (!req.files.image[0]) {
            throw new Error("Select more than one Image")
        }
        //Extract an almost unique hash values from the first image in the array
        //To save it as the folder name


        const folderName = req.files.image[0].md5

        //make a new directory with the folder name
        const newDir = fs.mkdir(path.join(`./public/images/${folderName}`), (err) => {
            try {
                if (err) {
                    fs.rmSync(path.join(`./public/images/${folderName}`), { recursive: true, force: true });
                    throw new Error("Couldnt make directory");
                }
                //For each image in the array call the sharp's function
                //For processing the image
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
        console.log("Ran line 40 controllers/multipleImage.js");
        //pass the folder name to the next controller
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
    console.log("Ran line 1 of multipleImageDownload");

    try {
        const folderName = req.query.foldername

        const imgDirPath = path.join(__dirname, `../public/images/${folderName}`);
        //Read the image names inside the created folder and return an object that
        //is required to create the zipped folder
        //path: where to look for the image to zip
        //name: the name of the the new image
        let imgFiles = fs.readdirSync(imgDirPath).map((image) => {
            return {
                path: `./public/images/${folderName}/${image}`,
                name: image
            }
        });
        console.log('line 76 ran inside multiple image download');
        //Wait for all images to be processed before zipping
        let fullyprocessed = false;
        const intervalId = setInterval(() => {
            imgFiles.forEach((image) => {
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
                //Delete folder after some time
                setTimeout(async () => {
                    fs.rmSync(imgDirPath, { recursive: true, force: true });
                }, 1800000);
            }
        }, 5000);

        //pass the array of object into the zip function.  
    } catch (error) {
        console.log(error);
        return res.render('error', { message: error.message })
    }
}



module.exports = { multipleImageDownload, multipleImageUpload }