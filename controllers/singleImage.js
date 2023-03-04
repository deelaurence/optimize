const fs = require("fs")
const sharp = require("sharp")
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
const path = require("path");


const singleImage = async (req, res) => {
    try {
        return __awaiter(this, void 0, void 0, function* () {
            //Check if the frontend form sends data
            if (!req.files) {
                let message = "File Empty"
                return res.render("error", { message })
            }
            console.log(req.files);
            if (req.files) {
                const { image } = req.files;
                const { filename, fileheight, filewidth } = req.body
                const folderName = `public/results/images/${filename}`
                //pass the name inputed as the file name down
                let prop = encodeURIComponent(filename)
                if (!image.mimetype.includes("image")) {
                    let message = "Please Select An Image"
                    return res.render("error", { message })
                }
                async function resizeImage() {
                    try {
                        const { height, width, size } = await sharp(image.data).metadata()
                        if (fs.existsSync("./public/unresized/" + filename + ".webp")) {
                            throw new Error('File name exists already')
                        }
                        //If user decides to manually input dimensions
                        if (fileheight && filewidth) {
                            const metadata = await sharp(image.data).metadata()
                            console.log(fileheight, filewidth);
                            await sharp(image.data)
                                .resize({
                                    width: Number(fileheight),
                                    height: Number(filewidth)
                                })
                                .toFile("./public/unresized/" + filename + ".webp")
                            const querystring = require('querystring')
                            const query = querystring.stringify({
                                "filenames": prop,
                                "size": size,
                                "width": filewidth,
                                "height": fileheight

                            })

                            return res.redirect("/unresized?" + query)
                        }
                        else {
                            const { height, width, size } = await sharp(image.data).metadata()
                            const metadata = await sharp(image.data).metadata()
                            await sharp(image.data)
                                .resize({
                                    width: width,
                                    height: height
                                })
                                .toFile("./public/unresized/" + filename + ".webp")

                        }
                        //if user didn't select origial size option or input size 

                        if (req.body.originalSize) {
                            const querystring = require('querystring')
                            const query = querystring.stringify({
                                "filenames": prop,
                                "size": size,
                                "width": width,
                                "height": height

                            })

                            return res.redirect("/unresized?" + query)
                        }
                        // if (req.body.fileheight && req.body.filewidth) {
                        //                                 return res.redirect("/unresized?" + query)
                        // }

                    } catch (error) {
                        console.log(error.message);
                        const { message } = error
                        return res.render("error", { message })
                    }

                }
                resizeImage()

                // res.redirect("/result");
            }

        })
    } catch (error) {
        console.log(error.message);
        const { message } = error
        return res.render("error", { message })
    }
}

module.exports = { singleImage }