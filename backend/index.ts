import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";

import authRoutes from "./src/routes/auth.route";
import userRoutes from "./src/routes/user.route";
import postRoutes from "./src/routes/post.route";
import notificationRoutes from "./src/routes/notification.route";
import connectionRoutes from "./src/routes/connection.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();
const corsOptions = {
	origin:
		process.env.NODE_ENV !== "production"
			? "http://localhost:5173"
			: process.env.CLIENT_URL,
	credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/connections", connectionRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.get("/", (req, res) => {
	res.send("API is running...");
});

app.listen(PORT, () => {
	console.log(`Server running on port https://localhost:${PORT}`);
});
