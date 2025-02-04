import uploadService from "@services/uploadService";
import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import DB from "src/db";

// Todo
// upload video and file
// get video and file by category with pagination

const tools = async (req: Request, res: Response): Promise<void> => {
  const { id, page, limit } = req.query;

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
// const all_tools = async (req: Request, res: Response): Promise<void> => {
//   const { type, page, count } = req.query;

//   if (!type) {
//     res.status(400).json({ message: "Type is required" });
//     return;
//   }

//   if (!["videos", "files"].includes(type)) {
//     res.status(400).json({ message: "Invalid type" });
//     return;
//   }

//   const tools = await DB.ToolModel.find({}, { id: 1, name: 1, icon: 1 });

//   res.json(tools);
// };

export {
  tools,
  upload,
  add_category,
  update_category,
  delete_category,
  // all_tools
};
