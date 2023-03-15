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
const zip = require("express-zip")

const { singleImageUpload, processSingleImage } = require('./controllers/singleImage')
const { multipleImageUpload, multipleImageDownload } = require('./controllers/multipleImage')

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



//Maintain dimensions 


app.get("/unresized", processSingleImage);
app.post("/upload", singleImageUpload)

app.get("/download", multipleImageDownload);
app.post("/gallery", multipleImageUpload);

app.listen(port, () => {
    console.log("port " + port);
});
