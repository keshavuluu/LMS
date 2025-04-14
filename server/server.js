import express from "express";
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./configs/mongodb.js";
import clearWebhooks from "./controllers/webhooks.js";
const app = express();

await connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 5000;
app.get('/',(req,res)=>res.send("API working"));
app.post('/clerk',express.json(),clearWebhooks)
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
