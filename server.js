import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const DIST_DIR = path.resolve(__dirname, 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');

// Ensure dist exists on startup in case container was deployed without pre-building
if (!fs.existsSync(INDEX_HTML_PATH)) {
  console.log('Production build not found. Running npm run build...');
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
    console.log('Production build completed successfully.');
  } catch (err) {
    console.error('Failed to run production build:', err);
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const server = http.createServer((req, res) => {
  // CORS & Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Strip query string and decode pathname
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // Normalize path to prevent directory traversal
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(DIST_DIR, safePath);

  // 1. If physical static file exists in dist, serve it
  if (fs.existsSync(filePath)) {
    try {
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        if (safePath.startsWith('/assets/') || safePath.startsWith('assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
          res.setHeader('Cache-Control', 'no-cache');
        }

        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    } catch {
      // Fall through to 404 or index.html
    }
  }

  // 2. API route handling: return clean JSON response for health checks and deployment probes
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', success: true, timestamp: new Date().toISOString() }));
    return;
  }

  // 3. Real static asset with file extension that is missing -> Return 404
  const ext = path.extname(pathname);
  if (ext) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Error: Asset not found\nThe requested file was not found on this server.');
    return;
  }

  // 4. SPA Fallback: Serve index.html for all valid client-side React routes
  if (fs.existsSync(INDEX_HTML_PATH)) {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    fs.createReadStream(INDEX_HTML_PATH).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Error: Page not found\nProduction build artifact (index.html) is missing. Please build the application.');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Production SPA server running on http://0.0.0.0:${PORT}`);
});
