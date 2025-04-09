/**
 * MongoDB connection utility
 * 
 * This is a wrapper around the dbConnect.js file to maintain compatibility with the 
 * import pattern used in our API routes.
 */

// Import the existing database connection function
const dbConnect = require('./dbConnect');

// Export the connection function
module.exports = dbConnect; 