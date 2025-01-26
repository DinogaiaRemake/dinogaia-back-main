import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { DinoService } from './dino.service';
import { Dino } from './dino.entity';
import { CreateDinoDto } from './dto/create-dino.dto';
import { UpdateDinoDto } from './dto/update-dino.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Cave } from './cave.entity';

@Controller('dinos')
export class DinoController {
    constructor(private readonly dinoService: DinoService) {}

    @Post()
    @UseGuards(AuthGuard)
    async create(@Request() req, @Body() createDinoDto: CreateDinoDto) {
        console.log("test");
        return this.dinoService.create(createDinoDto, req.user.id);
    }

    @Get()
    @UseGuards(AuthGuard)
    async findAll(): Promise<Dino[]> {
        return await this.dinoService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<Dino> {
        return await this.dinoService.findOne(id);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDinoDto: UpdateDinoDto
    ): Promise<Dino> {
        return await this.dinoService.update(id, updateDinoDto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return await this.dinoService.remove(id);
    }

    @Post(':id/feed')
    async feed(@Param('id', ParseIntPipe) id: number, @Body('food') food: string): Promise<Dino> {
        return await this.dinoService.feed(id, food);
    }

    @Post(':id/drink')
    async drink(@Param('id', ParseIntPipe) id: number): Promise<Dino> {
        return await this.dinoService.drink(id);
    }

    @Post(':id/xp')
    async gainXP(
        @Param('id', ParseIntPipe) id: number,
        @Body('amount', ParseIntPipe) amount: number
    ): Promise<Dino> {
        return await this.dinoService.gainXP(id, amount);
    }

    @Get('clan/:clan')
    async findByClan(@Param('clan') clan: string): Promise<Dino[]> {
        return await this.dinoService.findByClan(clan);
    }

    @Get('my/dinos')
    @UseGuards(AuthGuard)
    async findMyDinos(@Request() req): Promise<Dino[]> {
        const dinos = await this.dinoService.findByUserId(req.user.id);
        for (const dino of dinos) {
            console.log("Name: " + dino.name);
            console.log(dino.species + " niv." + dino.level);
            console.log("Clan: " + dino.clan);
            console.log("Weight: " + dino.weight);
            console.log("Height: " + dino.height);
            console.log("Intelligence: " + dino.intelligence);
            console.log("Agility: " + dino.agility);
            console.log("Strength: " + dino.strength);
            console.log("Endurance: " + dino.endurance);
            console.log("Health: " + dino.health);
            console.log("XP: " + dino.experience);
        }
        return dinos;
    }

    @Get(':id/cave')
    @UseGuards(AuthGuard)
    async getDinoCave(@Param('id', ParseIntPipe) id: number): Promise<Cave> {
        return await this.dinoService.getDinoCave(id);
    }
}
