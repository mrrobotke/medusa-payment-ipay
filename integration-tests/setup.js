const { MetadataStorage } = require("@mikro-orm/core")

MetadataStorage.clear()

// Add global teardown to prevent connection issues
global.afterEach = async () => {
  try {
    // Force close any open connections
    if (global.gc) {
      global.gc();
    }
  } catch (e) {
    // Ignore cleanup errors
  }
}

// Add process cleanup
process.on('exit', () => {
  try {
    if (global.gc) {
      global.gc();
    }
  } catch (e) {
    // Ignore cleanup errors
  }
}) 