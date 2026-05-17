import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";
import authRoutes from "./server/routes/auth.ts";
import leadsRoutes from "./server/routes/leads.ts";
import { authenticate } from "./server/middleware/auth.ts";
import Lead, { LeadStatus, LeadSource } from "./server/models/Lead.ts";

// Load environment variables
dotenv.config();

const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;

async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(cookieParser());

  // Database Connection
  const MONGODB_URI = process.env.MONGODB_URI;
  
  try {
    if (MONGODB_URI) {
      await mongoose.connect(MONGODB_URI);
      console.log("Successfully connected to MongoDB Atlas");
    } else {
      console.log("No MONGODB_URI found. Initializing MongoMemoryServer for development...");
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log("Connected to MongoMemoryServer at:", uri);
    }

    // Seed initial data if database is empty (works for both Atlas and local fallback)
    const count = await Lead.countDocuments();
    if (count === 0) {
      console.log("Database is empty. Seeding demo leads...");
      const demoLeads = [
        { name: "John Doe", email: "john@example.com", status: LeadStatus.NEW, source: LeadSource.WEBSITE },
        { name: "Jane Smith", email: "jane@example.com", status: LeadStatus.CONTACTED, source: LeadSource.INSTAGRAM },
        { name: "Bob Wilson", email: "bob@example.com", status: LeadStatus.QUALIFIED, source: LeadSource.REFERRAL },
        { name: "Alice Brown", email: "alice@example.com", status: LeadStatus.LOST, source: LeadSource.WEBSITE },
        { name: "Charlie Davis", email: "charlie@example.com", status: LeadStatus.NEW, source: LeadSource.INSTAGRAM },
        { name: "Eva Green", email: "eva@example.com", status: LeadStatus.CONTACTED, source: LeadSource.REFERRAL },
      ];
      await Lead.insertMany(demoLeads);
      console.log("Seeding complete.");
    }
  } catch (err) {
    console.error("CRITICAL ERROR: Failed to connect to MongoDB Atlas!");
    console.error("Error details:", err);
    console.error("Please verify your MONGODB_URI environment variable and MongoDB Atlas Network Access (0.0.0.0/0).");
  }

  // --- API Routes ---
  app.use("/api/auth", authRoutes);
  app.use("/api/leads", leadsRoutes);

  // CSV Export Route
  app.get("/api/export/leads", authenticate, async (req, res) => {
    try {
      const leads = await Lead.find({}).sort({ createdAt: -1 });
      const csvData = leads.map(l => ({
        Name: l.name,
        Email: l.email,
        Status: l.status,
        Source: l.source,
        CreatedAt: l.createdAt.toISOString()
      }));

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
      
      const header = "Name,Email,Status,Source,CreatedAt\n";
      const rows = csvData.map(l => `${l.Name},${l.Email},${l.Status},${l.Source},${l.CreatedAt}`).join("\n");
      
      res.send(header + rows);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", mode: isProd ? "production" : "development" });
  });

  // Centralized Error Handling Middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ success: false, message });
  });

  // Vite Integration
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${Number(PORT)}`);
  });
}

startServer();
