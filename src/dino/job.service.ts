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

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async updateDinosAtMidnight() {
        console.log('Mise à jour des salaires des dinos à minuit...');

        const allDinos = await this.dinoRepository.find({
            relations: ['cave']
        });
        
        for (const dino of allDinos) {
            const jobConfig = JOB_CONFIG[dino.job];
            dino.emeralds += jobConfig.salaire;
            switch (dino.job) {
                case Job.GARDE_ROYAL:
                    const potDeVin = Math.floor(Math.random() * 2) + 1;
                    dino.emeralds += potDeVin;
                    break;
                case Job.CAPITAINE_GARDE_ROYAL:
                    const potsDeVin = Math.floor(Math.random() * 6) + 1;
                    dino.emeralds += potsDeVin;
                    break;
                case Job.POMPIER:
                    dino.health = Math.min(100, dino.health + 5);
                    break;
            }
            console.log("dino salaire : " + dino.name + " " +dino.emeralds);

            
            await this.dinoRepository.save(dino);
        }
        
        console.log('Mise à jour des salaires terminée !');
    }

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