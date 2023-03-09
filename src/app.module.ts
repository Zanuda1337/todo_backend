import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { TasksModule } from './tasks/tasks.module';
import { User } from './users/users.model';
import { Category } from './categories/categories.model';
import { UserCategories } from './categories/user-categories.model';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './auth/common/guards';
import { Friendship } from './users/friendship.model';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: `.${process.env.NODE_ENV}.env` }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      models: [User, Category, UserCategories, Friendship],
      autoLoadModels: true,
    }),
    AuthModule,
    UsersModule,
    CategoriesModule,
    TasksModule,
  ],
  providers: [{provide: APP_GUARD, useClass: AtGuard}]
})
export class AppModule {

}
