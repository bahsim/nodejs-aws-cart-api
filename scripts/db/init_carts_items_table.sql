-- Create the cart_items table
CREATE TABLE cart_items (
    cart_id UUID NOT NULL,
    product_id UUID NOT NULL,
    count INTEGER NOT NULL CHECK (count > 0),
    
    PRIMARY KEY (cart_id, product_id),
    
    CONSTRAINT fk_cart 
        FOREIGN KEY (cart_id) 
        REFERENCES carts(id)
        ON DELETE CASCADE
);

-- Create index for better query performance
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);

-- To verify the table structure, use:
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cart_items';

-- To verify constraints:
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'cart_items';
