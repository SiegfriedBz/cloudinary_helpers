import { v2 as cloudinary } from "cloudinary"
import "dotenv/config"

cloudinary.config({
  cloud_name: process.env.CLD_CLOUD_NAME,
  api_key: process.env.CLD_API_KEY,
  api_secret: process.env.CLD_API_SECRET,
  secure: true,
})

export default cloudinary
