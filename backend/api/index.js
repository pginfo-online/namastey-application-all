const app = require('../app');
const connectDB = require('../src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable',
    });
  }
};
