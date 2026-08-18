import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.status(200).json({ message: "I'm alive" });
});

app.listen(4000, () => {
    console.log("Test server running on http://localhost:4000");
});