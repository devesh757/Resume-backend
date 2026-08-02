import 'dotenv/config';
import app from './app';
import connectDB from './config/database';

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
