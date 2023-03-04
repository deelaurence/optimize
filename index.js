"use strict";
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

const { gallery } = require('./controllers/gallery')
const { singleImage } = require('./controllers/singleImage')


const fs = require("fs");
const bodyParser = require("body-parser");
const sharp = require("sharp");
const fileUpload = require("express-fileupload");
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(fileUpload());
app.use(express_1.default.static("public"));

//Homepage
app.get("/", function (req, res) {
    res.render("form");
});
app.get("/form2", function (req, res) {
    res.render("gallery");
});


//Results for multiple square size dimensions
app.get("/results", (req, res) => {
    try {
        const uniqueFolder = req.query.filenames
        const imgDirPath = path.join(__dirname, "./public/results/images/", uniqueFolder);
        let imgFiles = fs.readdirSync(imgDirPath).map((image) => {
            return `images/${uniqueFolder}/${image}`;
        });
        res.render("result", { imgFiles, uniqueFolder });
    } catch (error) {
        console.log(error.message);
        const { message } = error
        return res.render("error", { message })
    }
});

//Maintain dimensions 
app.get("/unresized", async (req, res) => {
    try {
        const uniqueFolder = req.query.filenames.trim();
        const { size, width, height } = req.query;
        const meta = await sharp(`./public/unresized/${uniqueFolder}.webp`).metadata()
        const imgDirPath = path.join(uniqueFolder);
        const imageSource = imgDirPath + ".webp"
        let info = fs.statSync(path.join(__dirname, "public/unresized", imageSource))
        let newsize = info.size
        res.render("unresized", { imageSource, width, height, size, newsize });
    } catch (error) {
        console.log(error.message);
        const { message } = error
        return res.render("error", { message })
    }
});


app.post("/upload", singleImage)

app.post("/gallery", gallery)

app.listen(port, () => {
    console.log("port " + port);
});
