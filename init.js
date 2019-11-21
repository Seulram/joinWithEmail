import "./db";
import dotenv from "dotenv";
import app from "./app";

dotenv.config();

import "./models/User";

const PORT = process.env.PORT || 3000;

const handleListening = () =>
  console.log(`✅ Listening on: http://localhost:${PORT}`);

app.listen(PORT, handleListening);
