import { Post } from "../models/post.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createPost = async (req, res) => {
  try {
    const { content, tags } = req.body;
    const userId = req.user._id;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    let imageUrl = "";
    const imageLocalPath = req.file?.path;

    if (imageLocalPath) {
      const cloudinaryResponse = await uploadOnCloudinary(imageLocalPath);
      if (cloudinaryResponse) {
        imageUrl = cloudinaryResponse.url;
      }
    }

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        if (typeof tags === 'string') {
           parsedTags = tags.split(',').map(tag => tag.trim());
        }
      }
    }

    const post = await Post.create({
      author: userId,
      content,
      image: imageUrl,
      tags: parsedTags,
    });

    const populatedPost = await Post.findById(post._id).populate(
      "author",
      "displayName username avatar"
    );

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: populatedPost,
    });
  } catch (error) {
    console.error("Error in createPost:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getGlobalFeed = async (req, res) => {
  try {
    // In a real app we would paginate this and use the recommendation engine to sort
    const posts = await Post.find()
      .populate("author", "displayName username avatar")
      .sort({ createdAt: -1 })
      .limit(50); // limit for now to avoid massive payloads

    return res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error("Error in getGlobalFeed:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Remove like
      post.likes = post.likes.filter(
        (likeId) => likeId.toString() !== userId.toString()
      );
    } else {
      // Add like
      post.likes.push(userId);
    }

    await post.save();

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Error in toggleLike:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    // Find the user first to get their _id
    const mongoose = await import("mongoose");
    const User = mongoose.model("User");
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ author: user._id })
      .populate("author", "displayName username avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error("Error in getUserPosts:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
