const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");
const { startRetryWorker } = require("./workers/retry.worker");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  startRetryWorker();
});
