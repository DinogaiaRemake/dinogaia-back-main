import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dino } from './dino.entity';
import { Job, JOB_CONFIG } from './dto/job.enum';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class JobService {
    constructor(
        @InjectRepository(Dino)
        private dinoRepository: Repository<Dino>
    ) {}

    async changeJob(dinoId: number, newJob: Job): Promise<Dino> {
        const dino = await this.dinoRepository.findOne({ where: { id: dinoId } });
        if (!dino) {
            throw new NotFoundException(`Dinosaure avec l'ID ${dinoId} non trouvé`);
        }

        const jobConfig = JOB_CONFIG[newJob];
        if (!jobConfig) {
            throw new BadRequestException(`Métier ${newJob} non valide`);
        }   

        if (dino.job === newJob) {
            throw new BadRequestException(`Le dinosaure ${dino.name} est déjà un ${newJob}`);
        }

        if (dino.emeralds < jobConfig.formation) {
            throw new BadRequestException(`Pas assez d'émeraudes pour la formation. Coût: ${jobConfig.formation}, Solde: ${dino.emeralds}`);
        }

        dino.emeralds -= jobConfig.formation;
        dino.job = newJob;
        
        return await this.dinoRepository.save(dino);
    }

    async getJobInfo(job: Job): Promise<any> {
        const jobConfig = JOB_CONFIG[job];
        if (!jobConfig) {
            throw new NotFoundException(`Métier ${job} non trouvé`);
        }
        return jobConfig;
    }

    async getAllJobs(): Promise<any> {
        return JOB_CONFIG;
    }
} 