// Configuración de Lighthouse para testing de performance mobile
// Portfolio de Alejandra Grance

module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --disable-dev-shm-usage'
      }
    },
    assert: {
      assertions: {
        // Performance
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'interactive': ['warn', { maxNumericValue: 3000 }],
        
        // Best Practices
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:performance': ['warn', { minScore: 0.9 }],
        
        // SEO
        'categories:seo': ['warn', { minScore: 0.95 }],
        
        // Accessibility
        'categories:accessibility': ['warn', { minScore: 0.95 }],
        
        // Specific mobile optimizations
        'viewport': 'error',
        'font-size': 'error',
        'tap-targets': 'error',
        'content-width': 'error',
        
        // Performance específico
        'unused-css-rules': ['warn', { maxLength: 2000 }],
        'unused-javascript': ['warn', { maxLength: 2000 }],
        'efficient-animated-content': 'error',
        'uses-webp-images': 'warn',
        'uses-optimized-images': 'warn',
        'uses-responsive-images': 'warn',
        'offscreen-images': 'warn',
        'render-blocking-resources': 'warn',
        'unminified-css': 'warn',
        'unminified-javascript': 'warn',
        'uses-text-compression': 'warn',
        'uses-rel-preconnect': 'warn',
        'uses-rel-preload': 'warn',
        'critical-request-chains': 'warn',
        
        // Network
        'total-byte-weight': ['warn', { maxNumericValue: 1600000 }], // 1.6MB
        'dom-size': ['warn', { maxNumericValue: 1500 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};

// Configuración específica para mobile testing
const mobileConfig = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'mobile',
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 150,
      downloadThroughputKbps: 1638.4,
      uploadThroughputKbps: 675
    },
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      disabled: false
    },
    emulatedUserAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
  }
};

// Tests específicos para optimización mobile
const mobileTests = [
  {
    name: 'Mobile Performance Test',
    config: mobileConfig,
    assertions: {
      'first-contentful-paint': { maxNumericValue: 1800 },
      'largest-contentful-paint': { maxNumericValue: 2200 },
      'cumulative-layout-shift': { maxNumericValue: 0.05 },
      'speed-index': { maxNumericValue: 2500 },
      'interactive': { maxNumericValue: 2800 },
      'total-blocking-time': { maxNumericValue: 200 }
    }
  },
  {
    name: 'Mobile Network Test (Slow 3G)',
    config: {
      ...mobileConfig,
      settings: {
        ...mobileConfig.settings,
        throttling: {
          rttMs: 300,
          throughputKbps: 400,
          cpuSlowdownMultiplier: 4,
          requestLatencyMs: 300,
          downloadThroughputKbps: 400,
          uploadThroughputKbps: 400
        }
      }
    },
    assertions: {
      'first-contentful-paint': { maxNumericValue: 3000 },
      'largest-contentful-paint': { maxNumericValue: 4000 },
      'speed-index': { maxNumericValue: 4500 },
      'interactive': { maxNumericValue: 5000 }
    }
  }
];

module.exports.mobileConfig = mobileConfig;
module.exports.mobileTests = mobileTests; 