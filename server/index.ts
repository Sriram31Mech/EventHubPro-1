import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectDB } from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Try different ports if the default one is in use
    const startServer = async (port: number): Promise<void> => {
      try {
        await new Promise<void>((resolve, reject) => {
          server.listen(port, "127.0.0.1", () => {
            log(`Server running on http://127.0.0.1:${port}`);
            resolve();
          }).on('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
              reject(new Error(`Port ${port} is in use`));
            } else {
              reject(err);
            }
          });
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes('Port')) {
          await startServer(port + 1);
        } else {
          throw error;
        }
      }
    };

    await startServer(5050);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
