import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const registerUser = async (req, res) => {
  try {
    const { displayName, email, password } = req.body;

    if (!displayName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists." });
    }

    let avatarUrl = "";

    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    if (avatarLocalPath) {
      const cloudinaryResponse = await uploadOnCloudinary(avatarLocalPath);
      if (cloudinaryResponse) {
        avatarUrl = cloudinaryResponse.url; // Get the secure cloud URL
      }
    }

    // Create the new user in the database
    const user = await User.create({
      displayName,
      email,
      password,
      avatar: avatarUrl || "https://default-avatar-url.com/avatar.png", // Fallback if no avatar uploaded
    });

    // We never want to send the password hash back to the frontend
    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
      return res
        .status(500)
        .json({ message: "Something went wrong while registering the user." });
    }

    // Send the success response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: createdUser,
      content: req.body,
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const loginUser = async (req, res) => {
  try {
    console.log(req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    if (!user.password) {
      return res.status(400).json({
        message:
          "This account was created using Google. Please sign in with Google.",
      });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid user credentials" });
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    const cookieOptions = {
      httpOnly: true, // Prevents frontend JavaScript from reading the cookie
      secure: true, // Ensures cookies are only sent over HTTPS (or localhost)
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        success: true,
        message: "User logged in successfully",
        user: loggedInUser,
        accessToken,
        refreshToken,
      });
  } catch (error) {
    console.error("Error in loginUser:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        new: true,
      },
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        success: true,
        message: "User logged out successfully",
      });
  } catch (error) {
    console.error("Error in logoutUser:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
