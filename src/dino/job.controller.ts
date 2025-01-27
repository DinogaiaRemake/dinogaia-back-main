import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JobService } from './job.service';
import { Job } from './dto/job.enum';
import { AuthGuard } from '../auth/auth.guard';

@Controller('jobs')
export class JobController {
    constructor(private jobService: JobService) {}

    @Get()
    async getAllJobs() {
        return await this.jobService.getAllJobs();
    }

    @Get(':job')
    async getJobInfo(@Param('job') job: Job) {
        return await this.jobService.getJobInfo(job);
    }

    @Post('change/:dinoId')
    @UseGuards(AuthGuard)
    async changeJob(
        @Param('dinoId') dinoId: number,
        @Body('job') newJob: Job
    ) {
        return await this.jobService.changeJob(dinoId, newJob);
    }
} 