"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var routes_1 = __importDefault(require("./routes"));
var app = express_1.default();
app.use(express_1.default.json());
app.use(cors_1.default());
var port = process.env.PORT || 5000;
var baseUrl = "/api";
app.use(baseUrl, routes_1.default);
app.listen(port, function () {
    console.log("In ascolto sulla porta " + port);
});
//# sourceMappingURL=server.js.map