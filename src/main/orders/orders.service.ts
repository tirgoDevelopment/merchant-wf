import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BpmResponse, CargoLoadMethod, Order, CargoPackage, CargoStatus, CargoStatusCodes, CargoType, Currency, ResponseStauses, TransportKind, TransportType, BadRequestException, InternalErrorException, NoContentException, Merchant } from '..';
import { OrderDto } from './order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Merchant) private readonly merchantsRepository: Repository<Merchant>,
    @InjectRepository(Currency) private readonly curreniesRepository: Repository<Currency>,
    @InjectRepository(CargoType) private readonly cargoTyepesRepository: Repository<CargoType>,
    @InjectRepository(CargoStatus) private readonly cargoStatusesRepository: Repository<CargoStatus>,
    @InjectRepository(CargoPackage) private readonly cargoPackagesRepository: Repository<CargoPackage>,
    @InjectRepository(TransportKind) private readonly transportKindsRepository: Repository<TransportKind>,
    @InjectRepository(TransportType) private readonly transportTypesRepository: Repository<TransportType>,
    @InjectRepository(CargoLoadMethod) private readonly cargoLoadingMethodsRepository: Repository<CargoLoadMethod>
  ) { }

  async createOrder(createOrderDto: OrderDto): Promise<BpmResponse> {
    try {
      const merchant: Merchant = await this.merchantsRepository.findOneOrFail({ where: { id: createOrderDto.merchantId } });
      const offeredCurrency: Currency = await this.curreniesRepository.findOneOrFail({ where: { id: createOrderDto.offeredPriceCurrencyId } });
      const inAdvanceCurrency: Currency = await this.curreniesRepository.findOneOrFail({ where: { id: createOrderDto.inAdvancePriceCurrencyId } });
      const transportType: TransportType = await this.transportTypesRepository.findOneOrFail({ where: { id: createOrderDto.transportTypeId } });
      const cargoType: CargoType = await this.cargoTyepesRepository.findOneOrFail({ where: { id: createOrderDto.cargoTypeId } });
      const loadingMethod: CargoLoadMethod = await this.cargoLoadingMethodsRepository.findOneOrFail({ where: { id: createOrderDto.loadingMethodId } });
      const cargoPackage: CargoPackage = await this.cargoPackagesRepository.findOneOrFail({ where: { id: createOrderDto.cargoPackageId } });
      const cargoStatus: CargoStatus = await this.cargoStatusesRepository.findOneOrFail({ where: { code: CargoStatusCodes.Waiting } });
      const transportKinds = await this.transportKindsRepository.find({ where: { id: In(createOrderDto.transportKindIds) } });
      const order: Order = new Order();
      order.merchant = merchant;
      order.loadingMethod = loadingMethod;
      order.cargoPackage = cargoPackage;
      order.inAdvancePriceCurrency = inAdvanceCurrency;
      order.offeredPriceCurrency = offeredCurrency;
      order.transportType = transportType;
      order.transportKinds = transportKinds;
      order.cargoType = cargoType;
      order.cargoStatus = cargoStatus;
      order.loadingLocation = createOrderDto.loadingLocation;
      order.deliveryLocation = createOrderDto.deliveryLocation;
      order.customsPlaceLocation = createOrderDto.customsPlaceLocation;
      order.customsClearancePlaceLocation = createOrderDto.customsClearancePlaceLocation;
      order.additionalLoadingLocation = createOrderDto.additionalLoadingLocation;
      order.isAdr = createOrderDto.isAdr;
      order.isCarnetTir = createOrderDto.isCarnetTir;
      order.isGlonas = createOrderDto.isGlonas;
      order.isParanom = createOrderDto.isParanom;
      order.offeredPrice = createOrderDto.offeredPrice;
      order.paymentMethod = createOrderDto.paymentMethod;
      order.inAdvancePrice = createOrderDto.inAdvancePrice;
      order.sendDate = createOrderDto.sendDate;
      order.isSafeTransaction = createOrderDto.isSafeTransaction;
      order.cargoWeight = createOrderDto.cargoWeight;
      order.cargoLength = createOrderDto.cargoLength;
      order.cargiWidth = createOrderDto.cargiWidth;
      order.cargoHeight = createOrderDto.cargoHeight;
      order.volume = createOrderDto.volume;
      order.refrigeratorFrom = createOrderDto.refrigeratorFrom;
      order.refrigeratorTo = createOrderDto.refrigeratorTo;
      order.refrigeratorCount = createOrderDto.refrigeratorCount;
      order.isMerchant = true;

      await this.ordersRepository.save(order);
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        if (err.message.includes('merchantsRepository')) {
          throw new BadRequestException(ResponseStauses.UserNotFound);
        } else if (err.message.includes('curreniesRepository')) {
          throw new BadRequestException(ResponseStauses.CurrencyNotFound);
        } else if (err.message.includes('transportTypesRepository')) {
          throw new BadRequestException(ResponseStauses.TransportTypeNotfound);
        } else if (err.message.includes('transportKindsRepository')) {
          throw new BadRequestException(ResponseStauses.TransportKindNotfound);
        } else if (err.message.includes('cargoTyepesRepository')) {
          throw new BadRequestException(ResponseStauses.CargoTypeNotFound);
        } else if (err.message.includes('cargoLoadingMethodsRepository')) {
          throw new BadRequestException(ResponseStauses.CargoLoadingMethodNotFound);
        } else if (err.message.includes('cargoPackagesRepository')) {
          throw new BadRequestException(ResponseStauses.CargoPackageNotFound);
        }
      } else {
        throw new InternalErrorException(ResponseStauses.CreateDataFailed);
      }
    }
  }

  async updateOrder(updateOrderDto: OrderDto): Promise<BpmResponse> {
    try {

      const order: Order = new Order();
      order.loadingLocation = updateOrderDto.loadingLocation || order.loadingLocation;
      order.deliveryLocation = updateOrderDto.deliveryLocation || order.deliveryLocation;
      order.customsPlaceLocation = updateOrderDto.customsPlaceLocation || order.customsPlaceLocation;
      order.customsClearancePlaceLocation = updateOrderDto.customsClearancePlaceLocation || order.customsClearancePlaceLocation;
      order.additionalLoadingLocation = updateOrderDto.additionalLoadingLocation || order.additionalLoadingLocation;
      order.isAdr = updateOrderDto.isAdr || order.isAdr;
      order.isCarnetTir = updateOrderDto.isCarnetTir || order.isCarnetTir;
      order.isGlonas = updateOrderDto.isGlonas || order.isGlonas;
      order.isParanom = updateOrderDto.isParanom || order.isParanom;
      order.offeredPrice = updateOrderDto.offeredPrice || order.offeredPrice;
      order.paymentMethod = updateOrderDto.paymentMethod || order.paymentMethod;
      order.inAdvancePrice = updateOrderDto.inAdvancePrice || order.inAdvancePrice;
      order.sendDate = updateOrderDto.sendDate || order.sendDate;
      order.isSafeTransaction = updateOrderDto.isSafeTransaction || order.isSafeTransaction;
      order.cargoWeight = updateOrderDto.cargoWeight || order.cargoWeight;
      order.cargoLength = updateOrderDto.cargoLength || order.cargoLength;
      order.cargiWidth = updateOrderDto.cargiWidth || order.cargiWidth;
      order.cargoHeight = updateOrderDto.cargoHeight || order.cargoHeight;
      order.volume = updateOrderDto.volume || order.volume;
      order.refrigeratorFrom = updateOrderDto.refrigeratorFrom || order.refrigeratorFrom;
      order.refrigeratorTo = updateOrderDto.refrigeratorTo || order.refrigeratorTo;
      order.refrigeratorCount = updateOrderDto.refrigeratorCount || order.refrigeratorCount;

      if (updateOrderDto.merchantId) {
        order.merchant = await this.merchantsRepository.findOneOrFail({ where: { id: updateOrderDto.merchantId } });
      }
      if (updateOrderDto.offeredPriceCurrencyId) {
        order.offeredPriceCurrency = await this.curreniesRepository.findOneOrFail({ where: { id: updateOrderDto.offeredPriceCurrencyId } });

      }
      if (updateOrderDto.inAdvancePriceCurrencyId) {
        order.inAdvancePriceCurrency = await this.curreniesRepository.findOneOrFail({ where: { id: updateOrderDto.inAdvancePriceCurrencyId } });

      }
      if (updateOrderDto.transportTypeId) {
        order.transportType = await this.transportTypesRepository.findOneOrFail({ where: { id: updateOrderDto.transportTypeId } });

      }
      if (updateOrderDto.transportKindIds.length) {
        order.transportKinds = await this.transportKindsRepository.findByIds(updateOrderDto.transportKindIds);

      }
      if (updateOrderDto.cargoTypeId) {
        order.cargoType = await this.cargoTyepesRepository.findOneOrFail({ where: { id: updateOrderDto.cargoTypeId } });

      }
      if (updateOrderDto.loadingMethodId) {
        order.loadingMethod = await this.cargoLoadingMethodsRepository.findOneOrFail({ where: { id: updateOrderDto.loadingMethodId } });

      }
      if (updateOrderDto.cargoPackageId) {
        order.cargoPackage = await this.cargoPackagesRepository.findOneOrFail({ where: { id: updateOrderDto.cargoPackageId } });

      }

      await this.ordersRepository.save(order);
      return new BpmResponse(true, null, [ResponseStauses.SuccessfullyCreated]);
    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        if (err.message.includes('merchantsRepository')) {
          throw new BadRequestException(ResponseStauses.UserNotFound);
        } else if (err.message.includes('curreniesRepository')) {
          throw new BadRequestException(ResponseStauses.CurrencyNotFound);
        } else if (err.message.includes('transportTypesRepository')) {
          throw new BadRequestException(ResponseStauses.TransportTypeNotfound);
        } else if (err.message.includes('transportKindsRepository')) {
          throw new BadRequestException(ResponseStauses.TransportKindNotfound);
        } else if (err.message.includes('cargoTyepesRepository')) {
          throw new BadRequestException(ResponseStauses.CargoTypeNotFound);
        } else if (err.message.includes('cargoLoadingMethodsRepository')) {
          throw new BadRequestException(ResponseStauses.CargoLoadingMethodNotFound);
        } else if (err.message.includes('cargoPackagesRepository')) {
          throw new BadRequestException(ResponseStauses.CargoPackageNotFound);
        }
      } else {
        throw new InternalErrorException(ResponseStauses.UpdateDataFailed);
      }
    }
  }

  async getOrderById(id: number, merchanId: number): Promise<BpmResponse> {
    try {
      if (!id || !merchanId) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const order = await this.ordersRepository.findOneOrFail({ where: { id, merchant: { id: merchanId }, deleted: false }, relations: ['merchant', 'inAdvancePriceCurrency', 'offeredPriceCurrency', 'cargoType', 'cargoPackage', 'transportType', 'cargoLoadMethod', 'transportKinds'] });
      return new BpmResponse(true, order, null);
    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        throw new NoContentException();
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

  async getOrderByMerchantId(id: number, orderId: number, clientId: number, statusId: string, loadingLocation: string, deliveryLocation: string, transportKindId: string, transportTypeId: string, createdAt: string, sendDate: string): Promise<BpmResponse> {
    try {
      if (!id) {
        throw new BadRequestException(ResponseStauses.IdIsRequired);
      }
      const filter: any = { deleted: false, merchant: { id }};
      if(transportTypeId) {
        filter.transportType = { id: transportTypeId }
      }
      if(orderId) {
        filter.id = { id: orderId }
      }
      if(transportKindId) {
        filter.transportKind = { id: transportKindId }
      }
      if(clientId) {
        filter.client = { id: clientId}
      }
      if(statusId) {
        filter.cargoStatus = { id: statusId}
      }
      if(loadingLocation) {
        filter.loadingLocation = loadingLocation
      }
      if(deliveryLocation) {
        filter.deliveryLocation = deliveryLocation
      }
      if(createdAt) {
        filter.createdAt = createdAt
      }
      if(sendDate) {
        filter.sendDate = sendDate
      }
      const orders = await this.ordersRepository.find({ where: filter, relations: ['merchant', 'inAdvancePriceCurrency', 'offeredPriceCurrency', 'cargoType', 'cargoPackage', 'transportType', 'cargoLoadMethod', 'transportKinds'] });
      if(orders.length) {
        return new BpmResponse(true, orders, null);
      } else {
        throw new NoContentException();
      }
    } catch (err: any) {
      if (err.name == 'EntityNotFoundError') {
        throw new NoContentException();
      } else {
        throw new InternalErrorException(ResponseStauses.InternalServerError, err.message)
      }
    }
  }

}