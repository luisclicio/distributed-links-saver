import express from 'express';

const app = express();

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  return res.json({ message: 'Hello World' });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
