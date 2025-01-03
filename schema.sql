-- Categories table
CREATE TABLE transactions_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE transactions_transaction (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(200),
    transaction_type VARCHAR(7) NOT NULL DEFAULT 'expense',
    category_id INTEGER REFERENCES transactions_category(id) ON DELETE SET NULL,
    user_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    CONSTRAINT transaction_type_check CHECK (transaction_type IN ('income', 'expense'))
);

-- Budgets table
CREATE TABLE transactions_budget (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    category_id INTEGER NOT NULL REFERENCES transactions_category(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE
);

-- Transaction log table for audit
CREATE TABLE transaction_log (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER,
    action VARCHAR(10),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    old_amount DECIMAL(10,2),
    new_amount DECIMAL(10,2)
);

-- Trigger function for logging transaction changes
CREATE OR REPLACE FUNCTION log_transaction_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO transaction_log (transaction_id, action, new_amount)
        VALUES (NEW.id, 'INSERT', NEW.amount);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO transaction_log (transaction_id, action, old_amount, new_amount)
        VALUES (NEW.id, 'UPDATE', OLD.amount, NEW.amount);
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO transaction_log (transaction_id, action, old_amount)
        VALUES (OLD.id, 'DELETE', OLD.amount);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for transaction changes
CREATE TRIGGER transaction_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON transactions_transaction
FOR EACH ROW
EXECUTE FUNCTION log_transaction_changes();

-- Stored procedure for budget statistics
CREATE OR REPLACE PROCEDURE calculate_budget_statistics(
    p_user_id INTEGER,
    p_start_date DATE,
    p_end_date DATE,
    OUT total_expenses DECIMAL(10,2),
    OUT total_income DECIMAL(10,2),
    OUT budget_utilization DECIMAL(5,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Calculate total expenses
    SELECT COALESCE(SUM(amount), 0)
    INTO total_expenses
    FROM transactions_transaction
    WHERE user_id = p_user_id
    AND transaction_type = 'expense'
    AND date BETWEEN p_start_date AND p_end_date;

    -- Calculate total income
    SELECT COALESCE(SUM(amount), 0)
    INTO total_income
    FROM transactions_transaction
    WHERE user_id = p_user_id
    AND transaction_type = 'income'
    AND date BETWEEN p_start_date AND p_end_date;

    -- Calculate budget utilization
    SELECT COALESCE(
        (SELECT (SUM(t.amount) / SUM(b.amount)) * 100
        FROM transactions_transaction t
        JOIN transactions_budget b ON t.category_id = b.category_id
        WHERE t.user_id = p_user_id
        AND t.transaction_type = 'expense'
        AND t.date BETWEEN p_start_date AND p_end_date
        AND b.start_date <= p_end_date
        AND b.end_date >= p_start_date), 0)
    INTO budget_utilization;
END;
$$;

-- Indexes for better performance
CREATE INDEX idx_transaction_user ON transactions_transaction(user_id);
CREATE INDEX idx_transaction_category ON transactions_transaction(category_id);
CREATE INDEX idx_transaction_date ON transactions_transaction(date);
CREATE INDEX idx_budget_user ON transactions_budget(user_id);
CREATE INDEX idx_budget_category ON transactions_budget(category_id);
CREATE INDEX idx_category_user ON transactions_category(user_id);

-- Example of how to call the stored procedure
/*
CALL calculate_budget_statistics(
    1,                          -- user_id
    '2024-01-01',              -- start_date
    '2024-12-31',              -- end_date
    0,                         -- total_expenses (OUT parameter)
    0,                         -- total_income (OUT parameter)
    0                          -- budget_utilization (OUT parameter)
);
*/ 