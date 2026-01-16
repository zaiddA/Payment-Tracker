const simulateFailure = () => {
  const roll = Math.random();

  if (roll < 0.5) {
    return "SUCCESS";
  }

  if (roll < 0.8) {
    return "TIMEOUT";
  }

  return "FAILED";
};

module.exports = { simulateFailure };
