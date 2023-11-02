import cloudinary from "./cldConfig.js"
import "dotenv/config"
import fs from "fs"
import path from "path"

const cldAppName = process.env.CLD_APP_NAME
const FOLDER_PATH = "./data/seed/images"

// Log success message
function logSuccess(message) {
  console.log(`Success: ${message}`)
}

// Log error message and exit with an error code
function logErrorAndExit(message, errorCode = 1) {
  console.error(`Error: ${message}`)
  process.exit(errorCode)
}

// Function to remove file extension
function removeFileExtension(filename) {
  return filename.replace(/\.[^.]+$/, "")
}

// get images from FOLDER_PATH
function getImagesInDirectory(directory) {
  const isImageFile = (filePath) => {
    const extname = path.extname(filePath).toLowerCase()
    return [".jpg", ".jpeg", ".png"].includes(extname)
  }

  const imagePaths = []

  function traverseDirectory(currentDirectory, relativePath) {
    fs.readdirSync(currentDirectory).forEach((file) => {
      const filePath = path.join(currentDirectory, file)
      const fileRelativePath = path.join(relativePath, file)
      if (fs.statSync(filePath).isDirectory()) {
        traverseDirectory(filePath, fileRelativePath)
      } else if (isImageFile(filePath)) {
        // Remove the file extension from the file name
        const fileNameWithoutExtension = removeFileExtension(file)
        const subfolder = path.relative(FOLDER_PATH, path.dirname(filePath))
        let public_id
        if (subfolder) {
          public_id = `${cldAppName}/${subfolder}/${fileNameWithoutExtension}`
        } else {
          public_id = `${cldAppName}/${fileNameWithoutExtension}`
        }
        imagePaths.push({
          filePath,
          public_id,
        })
      }
    })
  }

  traverseDirectory(directory, "")
  return imagePaths
}

const imagePaths = getImagesInDirectory(FOLDER_PATH)
logSuccess("Images retrieved successfully")

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLD_CLOUD_NAME,
  api_key: process.env.CLD_API_KEY,
  api_secret: process.env.CLD_API_SECRET,
  secure: true,
})

// Log the configuration
console.log(cloudinary.config())

// Uploads an image file
const uploadImage = async (imageInfo) => {
  const { filePath, public_id } = imageInfo
  const options = {
    unique_filename: false,
    overwrite: true, // Allow overwriting the asset with new versions
    public_id,
  }

  try {
    // Upload the image
    await cloudinary.uploader.upload(filePath, options)
    return public_id
  } catch (error) {
    logErrorAndExit(`Error uploading image: ${public_id}`)
  }
}

// Main function --- Uploads all image files
const seedCloudinary = async () => {
  const results = await Promise.all(
    imagePaths.map(async (imageInfo) => {
      try {
        const publicId = await uploadImage(imageInfo)
        logSuccess(`Image uploaded: ${publicId}`)
        return publicId
      } catch (error) {
        return null // Return null to indicate an error for this image
      }
    })
  )

  const successfulUploads = results.filter((result) => result !== null)
  logSuccess(`${successfulUploads.length} images uploaded successfully`)
  console.log(successfulUploads)
  return successfulUploads
}

seedCloudinary()
