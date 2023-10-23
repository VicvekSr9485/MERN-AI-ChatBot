import app from "./app.js"
import { connectToDb } from "./db/connection.js"

// connections
const port = process.env.PORT || 5000
connectToDb()
.then(() => {
  app.listen(port, () => {
    console.log("Database Connected & Server Successfully Started")
  })
})
.catch((err) => console.log(err))