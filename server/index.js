require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { DataTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer"); // For sending confirmation emails
const cookieParser = require("cookie-parser");
const migrateAndSeed = require("./config/migrateAndSeed")
const {Group, Message, User, UserGroup} = require("./models/index")

// Initialize Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });


// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // React client URL
    credentials: true, // Allow cookies
  })
);
app.use(express.json());
app.use(cookieParser());

app.post("/api/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // Send confirmation email with a random code
    const confirmationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    user.confirmationCode = confirmationCode;
    await user.save();

    // Send email logic
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Or use your email provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Please confirm your account",
      text: `Your confirmation code is: ${confirmationCode}`,
    };

    transporter.sendMail(mailOptions);

    res.status(200).json({
      message:
        "Signup successful. Please check your email for confirmation code.",
    });
  } catch (error) {
    res.status(400).json({ error: "Error during signup" });
  }
});

// Confirm email
app.post("/api/confirm", async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ where: { email } });

  if (user && user.confirmationCode === code) {
    user.isVerified = true;
    await user.save();

    // Generate JWT token with both userId and email
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send the token in response
    res.status(200).json({
      message: "Account verified",
      token: token,
    });
  } else {
    res.status(400).json({ error: "Invalid confirmation code" });
  }
});

// Login Route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (user && bcrypt.compareSync(password, user.password)) {
    if (!user.isVerified) {
      return res
        .status(400)
        .json({ error: "Please verify your account before logging in" });
    }

    // Generate JWT token with both userId and email for consistency
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set cookie with token
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Use true in production with HTTPS
      sameSite: "Lax",
    });

    // Send token in the response body
    res.status(200).json({ token, message: "Login successful" });
  } else {
    res.status(400).json({ error: "Invalid email or password" });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("authToken"); // Clear the cookie
  res.status(200).json({ message: "Logout successful" });
});

// Middleware for checking JWT
const authenticate = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.userId = decoded.userId;
    next();
  });
};

// Get user info
app.get("/api/user", authenticate, async (req, res) => {
  const user = await User.findByPk(req.userId);
  if (user) {
    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

app.post("/api/verifyToken", authenticate, (req, res) => {
  res.status(200).json({ message: "Token is valid" });
});

app.get("/api/validate-token", authenticate, (req, res) => {
  res.status(200).json({ message: "Token is valid" });
});

app.get("/api/groups", authenticate, async (req, res) => {
  const groups = await Group.findAll();
  res.json(groups);
});

app.get("/api/groups/:groupId/messages", authenticate, async (req, res) => {
  const messages = await Message.findAll({
    where: { groupId: req.params.groupId },
  });
  res.json(messages);
});

app.post("/api/groups/:groupId/join", authenticate, async (req, res) => {
  const { groupId } = req.params;
  const userId = req.userId;

  const existingMembership = await UserGroup.findOne({
    where: { userId, groupId },
  });
  if (existingMembership) {
    return res.status(400).json({ message: "User is already in this group" });
  }

  // Create new membership
  await UserGroup.create({ userId, groupId });

  // Create a system message to notify others
  const user = await User.findByPk(userId);
  await Message.create({
    content: `${user.firstName} ${user.lastName} joined the group`,
    groupId: groupId,
    sender: "system",
  });

  res.status(200).json({ message: "User added to the group" });
});

// Check if user is a member of a specific group
app.get("/api/groups/:groupId/members", authenticate, async (req, res) => {
  const { groupId } = req.params;
  const userId = req.userId;

  // Check if the user is in the UserGroup table
  const existingMembership = await UserGroup.findOne({
    where: { userId, groupId },
  });

  // Return whether the user is a member
  if (existingMembership) {
    return res.json([{ userId, groupId }]); // User is a member
  } else {
    return res.json([]); // User is not a member
  }
});

// Socket.IO handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a group
  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`User joined group: ${groupId}`);
  });

  // Listen for new messages
  socket.on("sendMessage", async ({ content, groupId, sender }) => {
    const newMessage = await Message.create({ content, groupId, sender });
    io.to(groupId).emit("receiveMessage", newMessage); // Emit to group room
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

migrateAndSeed().then(() => {
  server.listen(5000, () => {
    console.log("Server running on port 5000");
  });
});
