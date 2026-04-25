const express = require('express');
const cors = require('cors');
require('dotenv').config();

const darazRoute = require('./darazRoute');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/daraz', darazRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});