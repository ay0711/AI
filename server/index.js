const express = require('express');
const cors = require('cors');
require('dotenv').config();
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/ai', aiRoutes);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
