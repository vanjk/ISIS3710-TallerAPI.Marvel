import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CharactersModule } from './characters/characters.module.js';
import { TeamsModule } from './teams/teams.module.js';
import { Character } from './characters/entities/character.entity.js';
import { Team } from './teams/entities/team.entity.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433, 
      username: 'marvel',
      password: 'marvel123',
      database: 'marvel_db',
      entities: [Team, Character],
      synchronize: false, // evita que TypeORM altere la base de datos de Docker.
    }),
    CharactersModule,
    TeamsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
