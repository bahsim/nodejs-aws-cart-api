-- Sample test data
INSERT INTO carts (user_id, status) VALUES
    ('123e4567-e89b-12d3-a456-426614174000', 'OPEN'),
    ('223e4567-e89b-12d3-a456-426614174000', 'ORDERED');

INSERT INTO cart_items (cart_id, product_id, count) VALUES
    ((SELECT id FROM carts LIMIT 1), '323e4567-e89b-12d3-a456-426614174000', 2),
    ((SELECT id FROM carts LIMIT 1), '423e4567-e89b-12d3-a456-426614174000', 1);
