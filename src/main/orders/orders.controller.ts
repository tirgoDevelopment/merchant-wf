import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Put,
  Query
} from '@nestjs/common';
import { OrderDto } from './order.dto';
import { OrdersService } from './orders.service';

@Controller('api/v2/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @UsePipes(ValidationPipe)
  async createOrder(@Body() createOrderDto: OrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Put()
  @UsePipes(ValidationPipe)
  async updateOrder(@Body() updateOrderDto: OrderDto) {
    return this.ordersService.updateOrder(updateOrderDto);
  }

  @Get('id')
  async getOrder(@Query('id') id: number, @Query('merchanId') merchanId: number) {
    return this.ordersService.getOrderById(id, merchanId);
  }
 
  @Get('merchant-orders')
  async getAllMerchantOrders(
    @Query('merchantId') id: number,
    @Query('clientId') clientId: number,
    @Query('orderId') orderId: number,
    @Query('statusId') statusId: string,
    @Query('loadingLocation') loadingLocation: string,
    @Query('deliveryLocation') deliveryLocation: string,
    @Query('transportKindId') transportKindId: string,
    @Query('transportTypeId') transportTypeId: string,
    @Query('createdAt') createdAt: string,
    @Query('sendDate') sendDate: string
  ) {
    return this.ordersService.getOrderByMerchantId(id, orderId, clientId, statusId, loadingLocation, deliveryLocation, transportKindId, transportTypeId, createdAt, sendDate);
  }

}