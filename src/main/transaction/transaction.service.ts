import { HttpStatus, Injectable, Logger, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, BpmResponse, InternalErrorException, NoContentException, NotFoundException, ResponseStauses, Transaction, User } from '..';
import { TransactionDto } from './transaction.dto';
import { CustomHttpException } from 'src/shared/exceptions/custom-http-exception';
import { SseGateway } from 'src/shared/gateway/sse.gateway';
@Injectable()
export class TransactionService {

  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectRepository(Transaction) private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private eventsService: SseGateway
  ) { }

  async getTransactions(userId: number): Promise<BpmResponse> {
    try {
      const data = await this.transactionsRepository.find({
        where: { deleted: false, user: { id: userId } }
      });
      return new BpmResponse(true, data, null);
    } catch (error: any) {
      this.logger.error(`Error while fetching transactions: ${error.message}`, error.stack);
      throw new CustomHttpException('Error while fetching transactions', HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async getMerchantBalance(id: number): Promise<BpmResponse> {
    return new BpmResponse(true, null)
  }

  async getTransactionById(id: number): Promise<BpmResponse> {
    if (!id && isNaN(id)) {
      throw new BadRequestException(ResponseStauses.IdIsRequired);
    }
    try {
      const transaction: Transaction = await this.transactionsRepository.query(`
        SELECT
          t.id,
          t.amount,
          t.tax_amount "taxAmount",
          t.additional_amount "additionalAmount",
          t.transaction_type "transctionType",
          u.user_type "userType",
          t.comment,
          t.created_at "createdAt",
          CASE
          WHEN u.user_type = 'client' THEN
              jsonb_build_object(
                  'id', c.id,
                  'firstName', c.first_name,
                  'lastName', c.last_name,
                  'phoneNumber', c.phone_number
              )
          WHEN u.user_type = 'driver' THEN
              jsonb_build_object(
                  'id', d.id,
                  'firstName', d.first_name,
                  'lastName', d.last_name,
                  'phoneNumber', d.phone_number
              )
      END AS user
          FROM
            transaction t
        LEFT JOIN
            "user" u ON u.id = t.user_id
        LEFT JOIN
            client c ON c.id = u.client_id
        LEFT JOIN
            driver d ON d.id = u.driver_id
            ;

        `)

      // const transaction: Transaction = await this.transactionsRepository.findOneOrFail({ where: { id, deleted: false } });
      if (transaction) {
        return new BpmResponse(true, transaction, []);
      } else {
        throw new NoContentException();
      }
    } catch (err: any) {
      if (err.name instanceof HttpException) {
        throw err;
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async cancelTransaction(id: number): Promise<BpmResponse> {
    try {
      if (!id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const isCanceled = await this.transactionsRepository.createQueryBuilder()
        .update(Transaction)
        .set({ canceled: true })
        .where("id = :id", { id })
        .execute();
      if (isCanceled.affected) {
        return new BpmResponse(true, 'Successfully canceled', null);
      } else {
        throw new InternalErrorException(ResponseStauses.CreateDataFailed);
      }
    }
    catch (err: any) {
      if(err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message);
      }
    }
  }

  async createTransaction(transactionDto: TransactionDto, userId: number): Promise<BpmResponse> {
    try {
      const user = await this.usersRepository.findOneOrFail({ where: { id: userId } })
      const transaction: Transaction = new Transaction();
      transaction.user = user;
      transaction.amount = transactionDto.amount;
      transaction.taxAmount = transactionDto.taxAmount;
      transaction.additionalAmount = transactionDto.additionalAmount;
      transaction.transactionType = transactionDto.transactionType;
      transaction.userType = transactionDto.userType;
      transaction.comment = transactionDto.comment;

      const savedTransaction: Transaction = await this.transactionsRepository.save(transaction);
      if (savedTransaction) {
        return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
      } else {
        throw new InternalErrorException(ResponseStauses.CreateDataFailed)
      }
    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        throw new BadRequestException(ResponseStauses.UserNotFound);
      } else if (err instanceof HttpException) {
        throw err
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.messgae)
      }
    }
  }
}