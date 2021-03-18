require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const sequelize = require("./utils/database");
const ProductRoutes = require("./Routes/ProductRoutes");
const UserRoutes = require("./Routes/UserRoutes");

//MyRoutes

const app = express();

//Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
// app.use(express.static(path.join(__dirname, "client", "build")));

//My Routes with middleware
app.use("/api", ProductRoutes);
app.use("/api", UserRoutes);

//Production:
app.get("/", (req, res) => {
  // res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  res.json({ "Hello world": "Hello" });
});

//Ports
const PORT = process.env.PORT || 8000;

//Starting a server
sequelize
  .sync()
  .then((res) => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Example app listening at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

//Project completed
