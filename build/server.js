"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const compression_1 = __importDefault(require("compression"));
const app = express_1.default();
app.use(express_1.default.json());
app.use(cors_1.default());
const port = process.env.PORT || 5000;
const baseUrl = "/api";
app.use(baseUrl, routes_1.default);
app.use(compression_1.default());
app.listen(port, () => {
    console.log("In ascolto sulla porta " + port);
});
