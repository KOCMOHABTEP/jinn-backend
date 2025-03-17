import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmployeeModule } from '@/employee/employee.module';

const IS_DEV = process.env.NODE_ENV === 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: IS_DEV ? '.env.development' : `.env`,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          host: config.get('POSTGRES_HOST'),
          database: config.get('POSTGRES_DB'),
          port: config.get('POSTGRES_PORT'),
          username: config.get('POSTGRES_USER'),
          password: config.get('POSTGRES_PASSWORD'),
          entities: [join(__dirname, '**', '*.entity.{ts,js}')],
          migrations: [join(__dirname, '**', '*.migrations.{ts,js}')],
          autoLoadEntities: true,
          synchronize: true, // :)
        };
      },
    }),
    AuthModule,
    UserModule,
    EmployeeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
