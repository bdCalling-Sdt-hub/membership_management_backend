import uploadService from "@services/uploadService";
import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import DB from "src/db";

// Todo
// upload video and file
// get video and file by category with pagination

const tools = async (req: Request, res: Response): Promise<void> => {
  const { id, type, page, limit } = req.query;

  if (!id) {
    const tools = await DB.ToolModel.find({}, { id: 1, name: 1, icon: 1 });
    res.json(tools);
    return;
  }

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  const tool = await DB.ToolModel.findById(id, {
    id: 1,
    name: 1,
    icon: 1,
  });

  if (!tool) {
    res.status(404).json({ message: "Tool category not found" });
    return;
  }

  if (!type) {
    const videos = await DB.VideoModel.find({ toolId: id }, { __v: 0 })
      .skip((+(page || 1) - 1) * +(limit || 10))
      .limit(+(limit || 10));

    const files = await DB.FileModel.find({ toolId: id }, { __v: 0 })
      .skip((+(page || 1) - 1) * +(limit || 10))
      .limit(+(limit || 10));

    res.json({ tool, videos, files });
    return;
  }

  if (type === "video") {
    const videos = await DB.VideoModel.find({ toolId: id }, { __v: 0 })
      .skip((+(page || 1) - 1) * +(limit || 10))
      .limit(+(limit || 10));

    const total = await DB.VideoModel.countDocuments({ toolId: id });
    const pagination = {
      page: +(page || 1),
      limit: +(limit || 10),
      total,
      totalPages: Math.ceil(total / +(limit || 10)),
    };

    res.json({ tool, videos, pagination });
    return;
  }

  if (type === "file") {
    const files = await DB.FileModel.find({ toolId: id }, { __v: 0 })
      .skip((+(page || 1) - 1) * +(limit || 10))
      .limit(+(limit || 10));

    const total = await DB.FileModel.countDocuments({ toolId: id });
    const pagination = {
      page: +(page || 1),
      limit: +(limit || 10),
      total,
      totalPages: Math.ceil(total / +(limit || 10)),
    };

    res.json({ tool, files, pagination });
    return;
  }

  res.json({ tool });
};

// Category Management
const add_category = async (req: Request, res: Response): Promise<void> => {
  const { name, icon } = req.body;

  if (!name || !icon) {
    res.status(400).json({ error: "Name and icon are required" });
    return;
  }

  await DB.ToolModel.create({ name, icon });

  res.json({
    message: "Category added successfully",
  });
};

const update_category = async (req: Request, res: Response): Promise<void> => {
  const { id, name, icon } = req.body;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  if (!name || !icon) {
    res.status(400).json({ error: "Name and icon are required" });
    return;
  }

  const tool = await DB.ToolModel.findByIdAndUpdate(id, { name, icon });

  if (!tool) {
    res.status(404).json({ message: "Tool category not found" });
    return;
  }

  res.json({
    message: "Category updated successfully",
  });
};

const delete_category = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.body;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  const tool = await DB.ToolModel.findByIdAndDelete(id);

  if (!tool) {
    res.status(404).json({ message: "Tool category not found" });
    return;
  }

  res.json({
    message: "Category deleted successfully",
  });
};

// Tools Management
const all_tools = async (req: Request, res: Response): Promise<void> => {
  const { type, page, limit, query } = req.query;

  if (!type) {
    res.status(400).json({ message: "Type is required" });
    return;
  }

  if (type !== "video" && type !== "file") {
    res.status(400).json({ message: "Invalid type" });
    return;
  }

  const pageNumber = +(page || 1);
  const limitNumber = +(limit || 10);

  if (type === "video") {
    const videoQuery: any = {};
    const toolQuery: any = {};

    // Filter by tool category if query is provided
    if (query) {
      const toolCategories = await DB.ToolModel.find(
        { name: { $regex: query, $options: "i" } }, // Case-insensitive search
        { _id: 1 }
      );

      if (toolCategories.length > 0) {
        videoQuery.toolId = { $in: toolCategories.map((tool) => tool._id) };
      } else {
        res.json({
          videos: [],
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            total: 0,
            totalPages: 0,
          },
        });
        return;
      }
    }

    const fetchedVideos = await DB.VideoModel.find(videoQuery, { __v: 0 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const videoToolIds = fetchedVideos.map((video) => video.toolId);
    const tools = await DB.ToolModel.find({ _id: { $in: videoToolIds } });

    const videos = fetchedVideos.map((video) => {
      const tool = tools.find(
        (tool) => tool._id.toString() === video.toolId.toString()
      );

      return {
        _id: video._id.toString(),
        category: tool?.name,
        title: video.title,
        url: video.url,
      };
    });

    const total = await DB.VideoModel.countDocuments(videoQuery);
    const pagination = {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    };

    res.json({ videos, pagination });
    return;
  }

  if (type === "file") {
    const fileQuery: any = {};
    const toolQuery: any = {};

    // Filter by tool category if query is provided
    if (query) {
      const toolCategories = await DB.ToolModel.find(
        { name: { $regex: query, $options: "i" } }, // Case-insensitive search
        { _id: 1 }
      );

      if (toolCategories.length > 0) {
        fileQuery.toolId = { $in: toolCategories.map((tool) => tool._id) };
      } else {
        res.json({
          files: [],
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            total: 0,
            totalPages: 0,
          },
        });
        return;
      }
    }

    const fetchedFiles = await DB.FileModel.find(fileQuery, { __v: 0 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const fileToolIds = fetchedFiles.map((file) => file.toolId);
    const tools = await DB.ToolModel.find({ _id: { $in: fileToolIds } });

    const files = fetchedFiles.map((file) => {
      const tool = tools.find(
        (tool) => tool._id.toString() === file.toolId.toString()
      );

      return {
        _id: file._id.toString(),
        category: tool?.name,
        title: file.title,
        url: file.url,
      };
    });

    const total = await DB.FileModel.countDocuments(fileQuery);
    const pagination = {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    };

    res.json({ files, pagination });
    return;
  }
};

const upload = async (req: Request, res: Response): Promise<void> => {
  const { toolId, title } = req?.query || {};

  if (!toolId || !title) {
    res.status(400).json({ message: "Tool id and title are required" });
    return;
  }

  if (!isValidObjectId(toolId)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  const video = (req.files as { [fieldname: string]: Express.Multer.File[] })?.[
    "video"
  ];
  const file = (req.files as { [fieldname: string]: Express.Multer.File[] })?.[
    "file"
  ];

  if (!video && !file) {
    res
      .status(400)
      .json({ message: "At least one Video or one file is required" });
    return;
  }

  if (video && file) {
    res.status(400).json({ message: "Only one video or a file is required" });
    return;
  }

  const tool = await DB.ToolModel.findById(toolId);

  if (!tool) {
    res.status(404).json({ message: "Tool category not found" });
    return;
  }

  if (video) {
    const videoUrl = await uploadService(video[0], "video");

    if (!videoUrl) {
      res.status(500).json({ message: "Error uploading video" });
      return;
    }

    await DB.VideoModel.create({
      toolId,
      title,
      url: videoUrl,
    });
  }

  if (file) {
    const fileUrl = await uploadService(file[0], "raw");

    if (!fileUrl) {
      res.status(500).json({ message: "Error uploading file" });
      return;
    }

    await DB.FileModel.create({
      toolId,
      title,
      url: fileUrl,
    });
  }

  res.json({ message: "File uploaded successfully" });
};

const update_tool = async (req: Request, res: Response): Promise<void> => {
  const { id, toolId, title, type } = req?.query || {};

  if (!toolId || !title || !id || !type) {
    res
      .status(400)
      .json({ message: "Tool id, title, id and type are required" });
    return;
  }

  if (!isValidObjectId(toolId) && !isValidObjectId(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  const video = (req.files as { [fieldname: string]: Express.Multer.File[] })?.[
    "video"
  ];
  const file = (req.files as { [fieldname: string]: Express.Multer.File[] })?.[
    "file"
  ];

  if (type === "video" && !video) {
    res.status(400).json({ message: "Video is required" });
    return;
  }

  if (type === "file" && !file) {
    res.status(400).json({ message: "File is required" });
    return;
  }

  const tool = await DB.ToolModel.findById(toolId);

  if (!tool) {
    res.status(404).json({ message: "Tool category not found" });
    return;
  }

  if (type === "video") {
    const videoFile = await DB.VideoModel.findById(id);

    if (!videoFile) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    const videoUrl = await uploadService(video[0], "video");

    if (!videoUrl) {
      res.status(500).json({ message: "Error uploading video" });
      return;
    }

    await DB.VideoModel.findByIdAndUpdate(id, {
      toolId,
      title,
      url: videoUrl,
    });
  }

  if (type === "file") {
    const fileFromDB = await DB.FileModel.findById(id);

    if (!fileFromDB) {
      res.status(404).json({ message: "File not found" });
      return;
    }
    const fileUrl = await uploadService(file[0], "raw");

    if (!fileUrl) {
      res.status(500).json({ message: "Error uploading file" });
      return;
    }

    await DB.FileModel.findByIdAndUpdate(id, {
      toolId,
      title,
      url: fileUrl,
    });
  }

  res.json({ message: "File updated successfully" });
};

const delete_tool = async (req: Request, res: Response): Promise<void> => {
  res.json({ message: "Delete tool" });
};

export {
  tools,
  upload,
  add_category,
  update_category,
  delete_category,
  all_tools,
  update_tool,
  delete_tool,
};
