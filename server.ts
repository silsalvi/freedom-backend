import express from "express";
import cors from "cors";
import router from "./routes";
import compression from "compression";
const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 5000;
const baseUrl = "/api";
app.use(baseUrl, router);
app.use(compression())
app.listen(port, () => {
  console.log("In ascolto sulla porta " + port);
});
