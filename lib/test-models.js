const dbConnect = require('./dbConnect');
const { Meta, Apontamento, Unidade } = require('./models');

async function testModels() {
  console.log('Testing MongoDB models...');
  
  // Check if environment variables are set
  if (!process.env.MONGO_URL && !process.env.MONGODB_URI) {
    console.error('❌ MONGO_URL or MONGODB_URI environment variable is not set!');
    process.exit(1);
  }
  
  let mongoose;
  try {
    // Connect to the database
    mongoose = await dbConnect();
    
    // Check if the connection is established
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Database connection successful!');
      console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
      
      // Test Meta model
      console.log('\nMeta Schema:');
      console.log(Meta.schema.paths);
      
      // Test Apontamento model
      console.log('\nApontamento Schema:');
      console.log(Apontamento.schema.paths);
      
      // Test Unidade model
      console.log('\nUnidade Schema:');
      console.log(Unidade.schema.paths);
      
      // Get list of collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('\nAvailable collections:');
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    } else {
      console.log('❌ Database connection failed!');
      console.log(`Connection state: ${mongoose.connection.readyState}`);
    }
  } catch (error) {
    console.error('❌ Error connecting to database or testing models:');
    console.error(error);
  } finally {
    // Close the connection after testing
    if (mongoose && mongoose.connection) {
      try {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
    process.exit(0);
  }
}

// Run the test
testModels(); 