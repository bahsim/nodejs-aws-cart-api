CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    items JSONB NOT NULL,
    cart_id UUID NOT NULL,
    address JSONB NOT NULL,
    status_history JSONB NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES carts(id)
);