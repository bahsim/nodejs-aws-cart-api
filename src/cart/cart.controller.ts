import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth';
import { OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { CartService } from './services';
import { CreateOrderDto, PutCartPayload } from 'src/order/type';
import { CartItem } from './entities/cart-item.entity';
import { Order } from '../order/entities/order.entity';
import { DataSource } from 'typeorm';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private readonly dataSource: DataSource,
  ) {}

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest): Promise<CartItem[]> {
    const cart = await this.cartService.findOrCreateByUserId(
      getUserIdFromRequest(req),
    );

    return cart.items;
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(
    @Req() req: AppRequest,
    @Body() body: PutCartPayload,
  ): Promise<CartItem[]> {
    // TODO: validate body payload...
    const cart = await this.cartService.updateByUserId(
      getUserIdFromRequest(req),
      body,
    );

    return cart.items;
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.OK)
  clearUserCart(@Req() req: AppRequest) {
    this.cartService.removeByUserId(getUserIdFromRequest(req));
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put('order')
  async checkout(@Req() req: AppRequest, @Body() body: CreateOrderDto) {
    const userId = getUserIdFromRequest(req);

    // Use your database connection/entity manager to start a transaction
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        // Find cart within transaction
        const cart = await this.cartService.findByUserId(userId);

        if (!(cart && cart.items.length)) {
          throw new BadRequestException('Cart is empty');
        }

        const { id: cartId, items } = cart;

        // Create order within the same transaction
        const order = await this.orderService.create({
          userId,
          cartId,
          items: items.map(({ product_id, count }) => ({
            productId: product_id,
            count,
          })),
          address: body.address,
        });

        // Remove cart within the same transaction
        await this.cartService.removeByUserId(userId);

        return { order };
      },
    );
  }
  
  @UseGuards(BasicAuthGuard)
  @Get('order')
  getOrder(): Promise<Order[]> {
    return this.orderService.getAll();
  }
}
