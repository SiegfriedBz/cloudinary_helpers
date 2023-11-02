import cloudinary from "./cldConfig.js"
import "dotenv/config"

const cldAppName = process.env.CLD_APP_NAME

const getCldImgData = async (subFolder = "") => {
  try {
    const result = await cloudinary.api.resources(
      {
        type: "upload",
        prefix: `${cldAppName}/${subFolder.toLowerCase()}`,
      },
      function (error, result) {
        console.log(result, error)
      }
    )
    return result
  } catch (error) {
    console.log(error)
  }
}

export default getCldImgData
