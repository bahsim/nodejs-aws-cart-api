-- Clear existing data (if needed)
TRUNCATE TABLE cart_items;
TRUNCATE TABLE carts;

-- Insert sample carts
INSERT INTO carts (id, user_id, created_at, updated_at, status) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 
    'b07f5d22-9f8d-4463-8c38-99e4b0c23b11', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP, 
    'OPEN'),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 
    'c9b5d6e4-6f4a-4d3b-8c2e-8c6c3c5f1234', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP, 
    'ORDERED'),
    ('7ec8a2c3-7d42-4b3a-9e57-89c5b0c4f123', 
    'd8e7f6a5-4b3c-2d1e-9f8a-7c6d5e4f3a2b', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP, 
    'OPEN');

-- Insert sample cart items
-- Using product IDs from your existing products in DynamoDB
INSERT INTO cart_items (cart_id, product_id, count) VALUES
    ('550e8400-e29b-41d4-a716-446655440000',
    '8e1f4f96-c5f6-4a88-a10a-7e4b21f578da', 2),  -- 2 Logitech MX Master 3
    ('550e8400-e29b-41d4-a716-446655440000',
    'c7d8e9f0-1a2b-3c4d-5e6f-7a8b9c0d1e2f', 1),  -- 1 Dell U2720Q
    ('6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'b4c5d8e1-f2a3-4b6c-9d8e-1f2a3b4c5d8e', 1),  -- 1 Keychron K2
    ('6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'd1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a', 2),  -- 2 Jabra Elite 85t
    ('7ec8a2c3-7d42-4b3a-9e57-89c5b0c4f123',
    'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 3),  -- 3 Samsung T7
    ('7ec8a2c3-7d42-4b3a-9e57-89c5b0c4f123',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 1);  -- 1 Blue Yeti