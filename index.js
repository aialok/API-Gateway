const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { rateLimit } = require("express-rate-limit");
const axios = require("axios");

const app = express();
app.use(morgan("combined"));

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // store: ... , // Use an external store for more precise rate limiting
});

app.use(limiter);

app.use("/bookingService", async (req, res, next) => {
  try {
    const jwtToken = req.headers["x-access-token"];
    const response = await axios.get(
      "http://localhost:3004/api/v1/authentication",
      {
        headers: {
          "x-access-token": jwtToken,
        },
      }
    );

    console.log(response)
    if(response.data.success)
    {
        next();
    }
    else {
        return res.status(401).json({
            success : false,
            message :"Unauthorised",
            
        })
    }

  } catch (error) {
    console.log(error)
  }
});

console.log(limiter);

// app.use(
//   "/bookingService",
//   createProxyMiddleware({
//     target: "http://localhost:3008/",
//     changeOrigin: true,
//   })
// );

app.get("/bookingService", (req, res) => {
  return res.json({
    mesaage: "Successfully GET",
  });
});

app.get("/", (req,res)=>{
      return res.json({ message : "This is main route"})
})


app.listen(3006, () => {
  console.log("Server running on the port 3006");
});
