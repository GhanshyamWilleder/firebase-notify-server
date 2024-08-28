import express from "express"
import cors from "cors"
import { pushNotification } from "./firebase.js"
const port = process.env.PORT || 8080

const app = express()

app.use(cors())
app.use(express.json())

let subscriptionsDB = [] // Array to store the tokens

// Endpoint to subscribe and store token
app.post("/subscribe", (req, res) => {
  const { tokenId } = req.body

  if (!subscriptionsDB.includes(tokenId)) {
    subscriptionsDB.push(tokenId)
    console.log(`Token subscribed: ${tokenId}`)
  }

  return res.status(200).json({ success: true, message: "Token subscribed" })
})

// Endpoint to send notification immediately
app.post("/send", async (req, res) => {
  console.log(req.body)
  try {
    const { title, body, navigate, tokenId, image, user, data } = req.body

    const notification = {
      tokens: [tokenId],
      data: {
        score: "850",
        time: "2:45",
        title: title || "Results Are Ready!",
        body: body || "Click here to view your results",
      },
    }

    await pushNotification.sendEachForMulticast(notification)

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error("Error sending notification:", error)
    return res.status(400).json({ error: error.message })
  }
})

// Endpoint to unsubscribe and remove the token
app.post("/unsubscribe", (req, res) => {
  const { tokenId } = req.body

  subscriptionsDB = subscriptionsDB.filter((token) => token !== tokenId)
  console.log(`Token unsubscribed: ${tokenId}`)

  return res.status(200).json({ success: true, message: "Token unsubscribed" })
})

// Send notifications at regular intervals (e.g., every 10 minutes)
setInterval(async () => {
  if (subscriptionsDB.length > 0) {
    const notification = {
      tokens: subscriptionsDB,
      data: {
        score: "850",
        time: "2:45",
        title: "Scheduled Notification",
        body: "This is a scheduled notification.",
      },
    }

    try {
      await pushNotification.sendEachForMulticast(notification)
      console.log("Scheduled notification sent to all subscribers.")
    } catch (error) {
      console.error("Error sending scheduled notification:", error)
    }
  }
}, 0.5 * 60 * 1000) // 10 minutes interval

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
