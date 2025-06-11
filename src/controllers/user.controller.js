import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError} from "../utils/ApiErrors.js"
import { User } from "../models/user.model.js"
import { fileUpload } from "../utils/fileupload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req,res) => {
    // get user details from frontend
    // validation - non emty fields
    // check if user already exists : username,email
    // check for images,check for avatar
    // upload them to cloudinary
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullName,email,password,username} = req.body
    // console.log("email:",email);

    if ([fullName,email,username,password].some((field) => field?.trim() === "")
    ) {
       throw new ApiError(400,"All fields are required") 
    }

    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }

    console.log(req.files);
    console.log(req.body)

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
    // console.log(avatarLocalPath)
    let coverImageLocalPath;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avtar file is required")
    }

    const avatar = await fileUpload(avatarLocalPath)
    const coverImage = await fileUpload(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avtar file is required")
    }

    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registtering user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registerd successfully!")
    )

})

const loginUser = asyncHandler(async(req,res) =>{
    // get user detail from frontend
    // check for empty field
    // check if user exists
    // check if password correct
    // generate access token
    // send cookie
    // return res

    const {email,username,password} = req.body

    if(!username || !email){
        throw new ApiError(400,"username or email required")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not Exists!")
    }

    const isPasswordValid = await user.isPasswordCorrected(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Incoreect Password")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(
        new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},
        "User logged In Successfully!"
    ))


})

const logoutUser = asyncHandler(async(req,res) =>{
    // get user from request
    // remove refresh and access token from db
    // send response
    await User.findByIdAndUpdate(req.user._id,{$set:{refreshToken:undefined}},{new:true})

    const options = {
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("refreshToken",options)
    .clearCookie("accessToken",options)
    .json(new ApiResponse(200,{},"User Logged Out Successfully!"))

})

const refreshAccessToken = asyncHandler(async(req,res) =>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(new ApiResponse(200,{
            accessToken,refreshToken:newrefreshToken
        },"Access token refreshed"))
    } catch (err) {
        throw new ApiError(401,error?.message || "Invalid refresh Token")
    }

})


export {registerUser,loginUser,logoutUser,refreshAccessToken}