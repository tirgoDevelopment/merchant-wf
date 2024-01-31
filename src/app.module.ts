import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MainModule } from './main/main.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from './main/index';
import { AuthModule } from './shared/modules/auth.module';
import { FileUploadModule } from './shared/modules/file-upload.module';
import { SharedModule } from './shared/modules/shared.module';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from './shared/multer.config';
import { SocketGateway } from './shared/gateway/socket.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule
      ],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'tirgo',
        entities: entities,
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    MainModule,
    AuthModule,
    FileUploadModule,
    SharedModule,
    MulterModule.register(multerConfig),
    SocketGateway
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {
}
