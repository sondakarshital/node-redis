const express = require('express');
const app = express();
const client = require('redis');
const axios = require('axios');
const PORT = process.env.PORT || 3000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const redisClient = client.createClient(REDIS_PORT);
redisClient.on('connection', () => {
  console.info('Redis connected!');
});

app.get('/api/search', async (req, res, next) => {
  const query = req.query.query;
  redisClient.get(`wikipedia:${query}`, async (err, data) => {
    if (data) {
      res.send(JSON.parse(data));
    } else {
      const result = await axios.get(
        `https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=${query}`
      );

      redisClient.setex(
        `wikipedia:${query}`,
        3600,
        JSON.stringify(result.data)
      );
      res.send(result.data);
    }
  });
});

app.listen(PORT, () => console.log(`app is listening on ${PORT}`));
