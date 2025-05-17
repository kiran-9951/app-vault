const dotEnv = require("dotenv")
dotEnv.config()
const express = require("express");
const Cors = require("cors")
const app = express();
const Database = require("./configuration/database")
Database()
const Routes = require("./routes/routes")
const helmet = require("helmet")

app.use(express.json());
app.use(helmet())
app.use(Cors())


app.use(Routes)

app.listen(process.env.PORT,() => {console.log(`Server is running on port ${process.env.PORT || 4040}`)})
