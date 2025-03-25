import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { OrderStatus, Address } from '../type';
import { Cart } from 'src/cart/entities/cart.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('jsonb')
  items: Array<{ productId: string; count: number }>;

  @Column('uuid')
  cartId: string;

  @Column('jsonb')
  address: Address;

  @Column('jsonb')
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: number;
    comment: string;
  }>;

  @ManyToOne(() => Cart)
  cart: Cart;
}
