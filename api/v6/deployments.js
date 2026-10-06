export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.status(200).json({
    status: 'ok',
    success: true,
    timestamp: new Date().toISOString(),
    deployment: 'nails-templete',
    ready: true
  });
}
