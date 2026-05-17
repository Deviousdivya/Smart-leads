import express from "express";
import { authenticate, authorize } from "../middleware/auth.ts";
import Lead, { LeadStatus, LeadSource } from "../models/Lead.ts";
import { UserRole } from "../models/User.ts";

const router = express.Router();

// GET /api/leads - with filtering, search, sorting, and pagination
router.get("/", authenticate, async (req, res) => {
  try {
    const { 
      status, 
      source, 
      search, 
      sort = "latest", 
      page = 1, 
      limit = 10 
    } = req.query;

    const query: any = {};

    if (status) query.status = status;
    if (source) query.source = source;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Lead.countDocuments(query);
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const sortOption: any = {};
    if (sort === "latest") sortOption.createdAt = -1;
    else if (sort === "oldest") sortOption.createdAt = 1;

    const leads = await Lead.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      leads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/leads/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    res.json({ success: true, lead });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/leads
router.post("/", authenticate, async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json({ success: true, lead });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/leads/:id
router.patch("/:id", authenticate, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    res.json({ success: true, lead });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/leads/:id - Admin Only
router.delete("/:id", authenticate, authorize([UserRole.ADMIN]), async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    res.json({ success: true, message: "Lead deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
