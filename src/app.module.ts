import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TechnologiesModule } from './technologies/technologies.module';
import { ConfigModule } from '@nestjs/config';
import { ProjectsModule } from './projects/projects.module';
import { QuestionsModule } from './questions/questions.module';
import { ResourcesModule } from './resources/resources.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      // Se utiliza con:
      // import { ConfigService } from '@nestjs/config';
      // this.configService.get<string>('DATABASE_URL');
      isGlobal: true,
    }),
    PrismaModule,
    TechnologiesModule,
    ProjectsModule,
    QuestionsModule,
    ResourcesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
