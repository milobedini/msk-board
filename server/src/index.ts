import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";
import suggestionsRouter from "./routes/suggestions.js";
import employeesRouter from "./routes/employees.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/suggestions", suggestionsRouter);
app.use("/api/employees", employeesRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
