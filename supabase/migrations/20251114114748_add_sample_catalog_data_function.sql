/*
  # Add Sample Catalog Data Function

  1. Function
    - `populate_sample_catalog` - Adds sample catalog metadata for a data source
    - Takes data_source_id as parameter
    - Creates sample tables and columns for testing

  2. Notes
    - Can be called after creating a data source to populate catalog
    - Useful for demo/testing purposes
*/

CREATE OR REPLACE FUNCTION populate_sample_catalog(p_data_source_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO catalog_metadata (data_source_id, database_name, table_name, column_name, data_type, is_nullable, column_order)
  VALUES
    (p_data_source_id, 'production', 'users', 'id', 'bigint', false, 1),
    (p_data_source_id, 'production', 'users', 'name', 'varchar', false, 2),
    (p_data_source_id, 'production', 'users', 'email', 'varchar', false, 3),
    (p_data_source_id, 'production', 'users', 'created_at', 'timestamp', false, 4),
    (p_data_source_id, 'production', 'users', 'updated_at', 'timestamp', true, 5),
    
    (p_data_source_id, 'production', 'orders', 'id', 'bigint', false, 1),
    (p_data_source_id, 'production', 'orders', 'user_id', 'bigint', false, 2),
    (p_data_source_id, 'production', 'orders', 'order_date', 'date', false, 3),
    (p_data_source_id, 'production', 'orders', 'total_amount', 'decimal', false, 4),
    (p_data_source_id, 'production', 'orders', 'status', 'varchar', false, 5),
    
    (p_data_source_id, 'production', 'products', 'id', 'bigint', false, 1),
    (p_data_source_id, 'production', 'products', 'name', 'varchar', false, 2),
    (p_data_source_id, 'production', 'products', 'description', 'text', true, 3),
    (p_data_source_id, 'production', 'products', 'price', 'decimal', false, 4),
    (p_data_source_id, 'production', 'products', 'stock', 'integer', false, 5),
    
    (p_data_source_id, 'analytics', 'sales_summary', 'date', 'date', false, 1),
    (p_data_source_id, 'analytics', 'sales_summary', 'total_sales', 'decimal', false, 2),
    (p_data_source_id, 'analytics', 'sales_summary', 'order_count', 'integer', false, 3),
    (p_data_source_id, 'analytics', 'sales_summary', 'avg_order_value', 'decimal', true, 4),
    
    (p_data_source_id, 'analytics', 'customer_metrics', 'customer_id', 'bigint', false, 1),
    (p_data_source_id, 'analytics', 'customer_metrics', 'lifetime_value', 'decimal', false, 2),
    (p_data_source_id, 'analytics', 'customer_metrics', 'total_orders', 'integer', false, 3),
    (p_data_source_id, 'analytics', 'customer_metrics', 'last_order_date', 'date', true, 4)
  ON CONFLICT DO NOTHING;
END;
$$;
