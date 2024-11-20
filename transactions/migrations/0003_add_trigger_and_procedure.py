from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('transactions', '0002_alter_transaction_category_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            # Forward SQL - Create trigger and procedure
            sql="""
            -- Create transaction log table
            CREATE TABLE IF NOT EXISTS transaction_log (
                id SERIAL PRIMARY KEY,
                transaction_id INTEGER,
                action VARCHAR(10),
                changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                old_amount DECIMAL(10,2),
                new_amount DECIMAL(10,2)
            );

            -- Create trigger function
            CREATE OR REPLACE FUNCTION log_transaction_changes()
            RETURNS TRIGGER AS $$
            BEGIN
                IF TG_OP = 'INSERT' THEN
                    INSERT INTO transaction_log (transaction_id, action, new_amount)
                    VALUES (NEW.id, 'INSERT', NEW.amount);
                ELSIF TG_OP = 'UPDATE' THEN
                    INSERT INTO transaction_log (transaction_id, action, old_amount, new_amount)
                    VALUES (NEW.id, 'UPDATE', OLD.amount, NEW.amount);
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            -- Create trigger
            DROP TRIGGER IF EXISTS transaction_changes_trigger ON transactions_transaction;
            CREATE TRIGGER transaction_changes_trigger
            AFTER INSERT OR UPDATE ON transactions_transaction
            FOR EACH ROW
            EXECUTE FUNCTION log_transaction_changes();

            -- Create stored procedure for budget statistics
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
            """,
            
            # Reverse SQL - Remove trigger and procedure
            reverse_sql="""
            DROP TRIGGER IF EXISTS transaction_changes_trigger ON transactions_transaction;
            DROP FUNCTION IF EXISTS log_transaction_changes();
            DROP TABLE IF EXISTS transaction_log;
            DROP PROCEDURE IF EXISTS calculate_budget_statistics;
            """
        ),
    ] 