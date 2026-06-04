import { User } from "../models/user.models.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { email, password, displayName, username, bio, avatar } = req.body;

    if (!displayName || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username: username.toLowerCase() }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(409)
          .json({ message: "User with this email already exists." });
      }
      return res
        .status(409)
        .json({ message: "This username is already taken." });
    }

    let avatarUrl = "";

    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    if (avatarLocalPath) {
      const cloudinaryResponse = await uploadOnCloudinary(avatarLocalPath);
      if (cloudinaryResponse) {
        avatarUrl = cloudinaryResponse.url; // Get the secure cloud URL
      }
    }

    const user = await User.create({
      displayName,
      email,
      password,
      avatar: avatarUrl || "https://default-avatar-url.com/avatar.png",
      username: username.toLowerCase(),
      bio: bio || "",
    });

    // We never want to send the password hash back to the frontend
    const createdUser = await User.findById(user._id).select("-password");
    if (!createdUser) {
      return res
        .status(500)
        .json({ message: "Something went wrong while registering the user." });
    }
    const accessToken = createdUser.generateAccessToken();
    const refreshToken = createdUser.generateRefreshToken();

    createdUser.refreshToken = refreshToken;
    await createdUser.save({ validateBeforeSave: false });

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // security!
    };

    // Send the success response
    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        message: "User registered successfully",
        user: createdUser,
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
        returnDocument: "after",
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

export const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({ message: "Unauthorized request" });
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      return res
        .status(401)
        .json({ message: "Refresh token is expired or used" });
    }

    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        success: true,
        message: "Access token refreshed successfully",
        accessToken,
        refreshToken: newRefreshToken,
      });
  } catch (error) {
    console.error("Error in refreshAccessToken:", error.message);
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }
};

export const updateAccountDetails = async (req, res) => {
  const { displayName, bio } = req.body;

  if (!displayName && !bio) {
    return res
      .status(400)
      .json({ message: "Please provide a display name or bio to update." });
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        ...(displayName && { displayName }), // Only update if provided
        ...(bio && { bio }), // Only update if provided
      },
    },
    { returnDocument: "after" },
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json({ success: true, message: "Account details updated", user });
};
export const changeCurrentPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Both old and new passwords are required" });
  }

  const user = await User.findById(req.user?._id);

  if (!user.password) {
    return res.status(400).json({
      message: "This is a Google Auth account. You cannot change the password.",
    });
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Invalid old password" });
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json({ success: true, message: "Password changed successfully" });
};

export const updateUserAvatar = async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    return res.status(400).json({ message: "Avatar file is missing" });
  }

  // Upload the new file to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    return res.status(400).json({ message: "Error uploading avatar to cloud" });
  }

  // Get the user's OLD avatar URL from the database
  const user = await User.findById(req.user?._id);
  const oldAvatarUrl = user.avatar;

  // Update the database with the NEW URL
  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatar.url } },
    { returnDocument: "after" },
  ).select("-password -refreshToken");

  if (oldAvatarUrl && !oldAvatarUrl.includes("default-avatar-url")) {
    await deleteFromCloudinary(oldAvatarUrl);
  }

  return res.status(200).json({
    success: true,
    message: "Avatar updated successfully",
    user: updatedUser,
  });
};

export const getUsersForSidebar = async (req, res) => {
  try {
    // req.user comes from your authentication middleware
    const loggedInUserId = req.user._id;

    // find all users EXCEPT the currently logged in user, and hide passwords
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    return res.status(200).json({
      success: true,
      data: filteredUsers,
    });
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res
        .status(400)
        .json({ message: "Username query parameter is required" });
    }
    const existingUser = await User.findOne({
      username: username.toLowerCase(),
    });

    if (existingUser) {
      return res
        .status(200)
        .json({ available: false, message: "Username is already taken" });
    }

    return res
      .status(200)
      .json({ available: true, message: "Username is available" });
  } catch (error) {
    console.error("Error in checkUsername: ", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error from username check" });
  }
};
