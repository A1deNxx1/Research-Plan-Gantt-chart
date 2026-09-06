import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/Research-Plan-Gantt-chart/",
  plugins: [react()],
  build: {
    outDir: "github-dist",
    emptyOutDir: true,
  },
});
