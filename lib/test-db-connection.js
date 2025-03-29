const dbConnect = require('./dbConnect');

// Set the environment variable if it's not already set
if (!process.env.MONGO_URL && process.env.MONGODB_URI) {
  process.env.MONGO_URL = process.env.MONGODB_URI;
  console.log('Set MONGO_URL from MONGODB_URI');
}

async function testDbConnection() {
  console.log('Testing database connection...');
  
  // Check if environment variables are set
  if (!process.env.MONGO_URL) {
    console.error('❌ MONGO_URL environment variable is not set!');
    console.log('Available environment variables:');
    Object.keys(process.env).forEach(key => {
      if (key.includes('MONGO')) {
        console.log(`- ${key}: ${process.env[key]}`);
      }
    });
    process.exit(1);
  }
  
  console.log(`Using connection string: ${process.env.MONGO_URL.replace(/\/\/([^:]+):[^@]+@/, '//***:***@')}`);
  
  let mongoose;
  try {
    // Attempt to connect to the database
    mongoose = await dbConnect();
    
    // Check if the connection is established
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Database connection successful!');
      console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
      
      // Get list of collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Available collections:');
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    } else {
      console.log('❌ Database connection failed!');
      console.log(`Connection state: ${mongoose.connection.readyState}`);
    }
  } catch (error) {
    console.error('❌ Error connecting to database:');
    console.error(error);
  } finally {
    // Close the connection after testing
    if (mongoose && mongoose.connection) {
      try {
        await mongoose.connection.close();
        console.log('Database connection closed.');
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
    process.exit(0);
  }
}

// Run the test
testDbConnection(); 