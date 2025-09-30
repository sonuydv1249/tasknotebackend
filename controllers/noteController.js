import Note from "../models/Note.js";

export const getNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };

    if (req.query.search) {
      const search = req.query.search;
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const notes = await Note.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalNotes = await Note.countDocuments(query);

    res.json({
      notes,
      currentPage: page,
      totalPages: Math.ceil(totalNotes / limit),
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

export const createNote = async (req, res) => {
  const { title, content } = req.body;
  try {
    const note = await Note.create({
      title,
      content,
      user: req.user._id, 
    });
    res.status(201).json(note);
  } catch (error) {
    console.error("Create note error:", error.message);
    res.status(500).send("Server Error");
  }
};

export const updateNote = async (req, res) => {
  const { title, content } = req.body;

  try {
    let note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    note.title = title;
    note.content = content;
    await note.save();

    res.json(note);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

export const deleteNote = async (req, res) => {
  try {
    console.log("Logged in user:", req.user); 
    const note = await Note.findById(req.params.id);
    console.log("Note to delete:", note); 

    if (!note) return res.status(404).json({ message: "Note not found" });

    
    if (!note.user) {
      return res.status(400).json({ message: "Note has no associated user" });
    }

    if (note.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    await note.deleteOne();
    res.json({ message: "Note removed" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
