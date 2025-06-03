import express from "express";
import productRoutes from "./routes/product.routes";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);

export default app;
