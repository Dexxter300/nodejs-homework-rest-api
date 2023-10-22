import { app } from "./app.js";
import mongoose from "mongoose";

// const DB_HOST =
//   "mongodb+srv://dexxter300:123456789a@cluster0.puk1pqf.mongodb.net/my-contacts?retryWrites=true&w=majority";

mongoose
  .connect(process.env.DB_HOST)
  .then(() => {
    app.listen(3000, () => {
      console.log("Database connection successful");
    });
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

// app.listen(3000, () => {
//   console.log("Server running. Use our API on port: 3000");
// });
