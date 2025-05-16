const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static HTML
app.use(express.static(path.join(__dirname, 'public')));

// Route root (/) to upload.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// Temp upload handler
const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), (req, res) => {
  const filePath = req.file.path;

  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Send only JSON in response (no file saved)
    res.json({
      message: "Conversion successful",
      json: data
    });

  } catch (error) {
    fs.unlinkSync(filePath); // Ensure cleanup on error too
    res.status(500).json({ error: "Failed to convert file." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/upload.html`);
});
