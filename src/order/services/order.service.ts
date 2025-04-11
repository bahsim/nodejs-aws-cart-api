import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderPayload, OrderStatus } from '../type';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getAll() {
    return this.orderRepository.find();
  }

  async findById(orderId: string): Promise<Order> {
    return this.orderRepository.findOneBy({ id: orderId });
  }

  async create(data: CreateOrderPayload) {
    const order = this.orderRepository.create({
      ...data,
      statusHistory: [
        {
          comment: '',
          status: OrderStatus.Open,
          timestamp: Date.now(),
        },
      ],
    });

    return this.orderRepository.save(order);
  }

  // TODO add  type
  async update(orderId: string, data: Order) {
    await this.orderRepository.update(orderId, data);

    return this.findById(orderId);
  }
}
