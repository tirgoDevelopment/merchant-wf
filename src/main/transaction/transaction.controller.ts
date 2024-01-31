import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Patch,
  UsePipes,
  ValidationPipe,
  Put,
  Query,
  Req
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionDto } from './transaction.dto';

@Controller('api/v2/transactions')
export class TransactionsController {

constructor(
    private transactionsService: TransactionService
) {
}

@Post()
@UsePipes(ValidationPipe)
async createTransaction(@Body() transactionDto: TransactionDto, @Req() req: Request) {
    return this.transactionsService.createTransaction(transactionDto, req['user']?.userId)
}

@Get('all')
async getTransactions(@Query('id') id: number) {
    return this.transactionsService.getTransactions(id);
}

@Get('merchant-balance')
async getMerchantBalance(@Query('id') id: number) {
    return this.transactionsService.getMerchantBalance(id);
}

@Delete('cancel')
async cancelTransaction(@Query('id') id: number) {
  return this.transactionsService.cancelTransaction(id);
}

}