// Servidor simple para testing local del portfolio optimizado
// Portfolio de Alejandra Grance

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// MIME types para diferentes archivos
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

// Headers optimizados para performance
const performanceHeaders = {
  // Cache headers
  'Cache-Control': 'public, max-age=31536000', // 1 año para assets estáticos
  
  // Compression
  'Content-Encoding': 'gzip',
  
  // Security headers
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Performance hints
  'X-DNS-Prefetch-Control': 'on',
  'X-Preload': 'true'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Default to index.html
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  const filePath = path.join(__dirname, pathname);
  const ext = path.extname(pathname).toLowerCase();
  
  // Verificar si el archivo existe
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Archivo no encontrado
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>404 - No encontrado</title>
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
            .error { color: #ef4444; margin-top: 2rem; }
          </style>
        </head>
        <body>
          <h1>Portfolio de Alejandra Grance</h1>
          <div class="error">
            <h2>404 - Página no encontrada</h2>
            <p>El recurso solicitado no existe.</p>
            <a href="/">Volver al inicio</a>
          </div>
        </body>
        </html>
      `);
      return;
    }
    
    // Leer el archivo
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error interno del servidor');
        return;
      }
      
      // Determinar content type
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      // Headers básicos
      const headers = {
        'Content-Type': contentType,
        'Content-Length': content.length
      };
      
      // Headers específicos para cada tipo de archivo
      if (ext === '.html') {
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        headers['Pragma'] = 'no-cache';
        headers['Expires'] = '0';
        
        // CSP para seguridad
        headers['Content-Security-Policy'] = "default-src 'self' 'unsafe-inline' fonts.googleapis.com fonts.gstatic.com cdnjs.cloudflare.com; img-src 'self' data:; script-src 'self' 'unsafe-inline'";
        
      } else if (ext === '.css' || ext === '.js') {
        headers['Cache-Control'] = 'public, max-age=86400'; // 1 día
        
      } else if (['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext)) {
        headers['Cache-Control'] = 'public, max-age=31536000'; // 1 año
        
      } else if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
        headers['Cache-Control'] = 'public, max-age=31536000'; // 1 año
        headers['Access-Control-Allow-Origin'] = '*';
      }
      
      // Headers de performance adicionales
      Object.assign(headers, {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      });
      
      res.writeHead(200, headers);
      res.end(content);
      
      // Log de requests para debugging
      const timestamp = new Date().toISOString();
      console.log(`${timestamp} - ${req.method} ${req.url} - ${res.statusCode} - ${content.length} bytes`);
    });
  });
});

server.listen(PORT, () => {
  console.log(`
🚀 Servidor del Portfolio de Alejandra Grance iniciado!

📱 URL Local: http://localhost:${PORT}
🌐 URL Red: http://$(hostname -I | awk '{print $1}'):${PORT}

📊 Para testing de performance:
   • Lighthouse: lighthouse --form-factor=mobile http://localhost:${PORT}
   • PageSpeed: https://pagespeed.web.dev/
   • Chrome DevTools: F12 > Performance

🔧 Optimizaciones activas:
   ✅ Headers de cache optimizados
   ✅ Content-Type correcto para todos los assets
   ✅ CSP headers para seguridad
   ✅ CORS para fonts
   ✅ No-cache para HTML
   ✅ Long cache para assets estáticos
   
🏃‍♀️ ¡Listo para testing mobile!
  `);
});

// Manejo de errores del servidor
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Error: Puerto ${PORT} ya está en uso.`);
    console.log(`💡 Intenta con: node server.js --port=3001`);
  } else {
    console.error('❌ Error del servidor:', err);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo servidor...');
  server.close(() => {
    console.log('✅ Servidor detenido correctamente.');
    process.exit(0);
  });
});

module.exports = server; 