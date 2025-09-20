import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import { nanoid } from "nanoid";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get reliable __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Only used in development - create minimal config to avoid bundling issues
  const viteConfig = {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "..", "client", "src"),
        "@shared": path.resolve(__dirname, "..", "shared"),
      },
    },
    root: path.resolve(__dirname, "..", "client"),
  };
  
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(__dirname, "..", "client", "index.html");

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Use reliable path resolution for production
  const staticPath = path.join(__dirname, "public");
  
  // Add debugging information
  console.log('Current working directory:', process.cwd());
  console.log('__dirname:', __dirname);
  console.log('Static path:', staticPath);
  console.log('Static directory exists:', fs.existsSync(staticPath));

  if (!fs.existsSync(staticPath)) {
    throw new Error(
      `Could not find the build directory: ${staticPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(staticPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.join(staticPath, "index.html");
    console.log('Serving index.html from:', indexPath);
    res.sendFile(indexPath);
  });
}
