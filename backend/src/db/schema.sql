CREATE TABLE payments (
  id UUID PRIMARY KEY,
  idempotency_key VARCHAR(100) UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payment_retries (
  id SERIAL PRIMARY KEY,
  payment_id UUID REFERENCES payments(id),
  attempt_no INT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
