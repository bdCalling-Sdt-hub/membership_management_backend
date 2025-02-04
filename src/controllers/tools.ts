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
    res.status(400).json({ message: "A Video or a file are required" });
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
  const { type, page, limit } = req.query;

  if (!type) {
    res.status(400).json({ message: "Type is required" });
    return;
  }

  if (type != "video" && type != "file") {
    res.status(400).json({ message: "Invalid type" });
    return;
  }

  if (type === "video") {
    const fetchedVideos = await DB.VideoModel.find({}, { __v: 0 })
      .skip((+(page || 1) - 1) * +(limit || 10))
      .limit(+(limit || 10));

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

    const total = await DB.VideoModel.countDocuments();
    const pagination = {
      page: +(page || 1),
      limit: +(limit || 10),
      total,
      totalPages: Math.ceil(total / +(limit || 10)),
    };

    res.json({ videos, pagination });
    return;
  }

  if (type === "file") {
    const fetchedFiles = await DB.FileModel.find({}, { __v: 0 })
      .skip((+(page || 1) - 1) * +(limit || 10))
      .limit(+(limit || 10));

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

    const total = await DB.FileModel.countDocuments();
    const pagination = {
      page: +(page || 1),
      limit: +(limit || 10),
      total,
      totalPages: Math.ceil(total / +(limit || 10)),
    };

    res.json({ files, pagination });
    return;
  }
};

export {
  tools,
  upload,
  add_category,
  update_category,
  delete_category,
  all_tools,
};
