import { App } from "./app";

const manifestUrl = "http://localhost:3000/models/tfjs_model/model.json";
const app = new App(manifestUrl);

app.init();
