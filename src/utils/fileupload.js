import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.CLOUDINARY_API_SECRET  
});

const fileUpload = async (localPath) =>{
    try {
        if(!localPath) return null
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localPath,{resource_type:'auto'})

        //file has been uploaded successfully
        console.log("file uploaded on cloudinary",response.url);
        return response

    } catch (error) {
        fs.unlinkSync(localPath) //remove the locally saved file as upload operation failed
        return null
    }
}

export {fileUpload}