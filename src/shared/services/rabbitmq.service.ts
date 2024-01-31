// rabbitmq.service.ts

import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
import * as amqp from 'amqplib';
import { SseGateway } from '../gateway/sse.gateway';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(
    private eventService: SseGateway
    ) {}

  async onModuleInit() {
    await this.init();
    await this.setupQueueConsumers();
  }

  async init() {
    this.connection = await amqp.connect("amqp://13.232.83.179:5672");
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue('acceptDriverOffer');
    await this.channel.assertQueue('finishOrderDriver');
    await this.channel.assertQueue('acceptOrderDriver');
    await this.channel.assertQueue('acceptAdminAppendOrder');
    await this.channel.assertQueue('cancelOrder');
  }

  private async setupQueueConsumers() {
    // Consume messages from 'finishOrderDriver' queue
    this.channel.consume('finishOrderDriver', this.handleFinishOrderMessage.bind(this), { noAck: true });
    this.channel.consume('acceptOrderDriver', this.handleAcceptOrderDriverMessage.bind(this), { noAck: true });
    this.channel.consume('acceptAdminAppendOrder', this.handleAdminAppendOrder.bind(this), { noAck: true });
    this.channel.consume('cancelOrder', this.handleAdminCancelOrder.bind(this), { noAck: true });
  }

  private async handleFinishOrderMessage(msg: amqp.ConsumeMessage | null) {
    if (msg) {
      const messageContent = msg.content.toString();
      try {
        const data = JSON.parse(messageContent);
        console.log(`Received message finishOrderDriver: ${JSON.stringify(data)}`);
        this.eventService.sendDriverFinish('1')
        // Process the message using CargosService
        // await this.cargosService.finishCargo(data);
      } catch (error) {
        console.error('Error parsing message finishOrderDriver:', error);
      }
    }
  }

  private async handleAcceptOrderDriverMessage(msg: amqp.ConsumeMessage | null) {
    if (msg) {
      const messageContent = msg.content.toString();
      try {
        const data = messageContent;
        console.log(`Received message acceptOrderDriver: ${JSON.stringify(data)}`);
        this.eventService.sendDriverOffer('1')
        // Process the message using CargosService
        
      } catch (error) {
        console.error('Error parsing message acceptOrderDriver:', error);
      }
    }
  }


  private async handleAdminAppendOrder(msg: amqp.ConsumeMessage | null) {
    if (msg) {
      const messageContent = msg.content.toString();
      try {
        const data = JSON.parse(messageContent);;
        console.log(`Received message acceptAdminAppendOrder: ${JSON.stringify(data)}`);
        
        // Process the message using CargosService
        // await this.cargosService.appendCargo(data);
        
      } catch (error) {
        console.error('Error parsing message acceptAdminAppendOrder:', error);
      }
    }
  }

  private async handleAdminCancelOrder(msg: amqp.ConsumeMessage | null) {
    if (msg) {
      const messageContent = msg.content.toString();
      console.log(messageContent)
      try {
        const data = JSON.parse(messageContent);;
        console.log(`Received message acceptAdminCancelOrder: ${JSON.stringify(data)}`);
        
        // Process the message using CargosService
        // await this.cargosService.cancelCargo(data);
        this.eventService.sendCancelOrder('1')
        
      } catch (error) {
        console.error('Error parsing message acceptAdminCancelOrder:', error);
      }
    }
  }

  // async acceptDriverOffer(message: string) {
  //   this.channel.sendToQueue('acceptDriverOffer', Buffer.from(message));
  // }

  // Other methods and logic in RabbitMQService...
}
