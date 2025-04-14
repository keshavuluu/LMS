import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["quill", "react-quill"],
  },
  resolve: {
    alias: {
      os: "os-browserify",
    },
  },
  define: {
    "process.env": {},
  },
});
