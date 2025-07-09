import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Request, NotFoundException, Query, DefaultValuePipe } from '@nestjs/common';
import { DinoService } from './dino.service';
import { Dino } from './dino.entity';
import { CreateDinoDto, DinoSpecies } from './dto/create-dino.dto';
import { UpdateDinoDto } from './dto/update-dino.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Cave } from './cave.entity';
import { ForbiddenException } from '@nestjs/common';
import { DiseaseConfig } from './dto/disease.enum';

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

    @Get('active')
    @UseGuards(AuthGuard)
    async getAllActiveDinos(): Promise<Dino[]> {
        return await this.dinoService.getAllActiveDinos();
    }

    @Get('list-all')
    @UseGuards(AuthGuard)
    async getAllPaginated(
        @Request() req,
        @Query('page') page = '1',
        @Query('limit') limit = '10'
    ): Promise<{ dinos: Dino[], total: number }> {
        return await this.dinoService.findAllPaginatedExceptUser(
            req.user.id,
            parseInt(page),
            parseInt(limit)
        );
    }

    // Classement des dinos
    @Get('ranking')
    @UseGuards(AuthGuard)
    async getRanking(
        @Query('category') category: string = 'xp',
        @Query('limit') limit = '10',
        @Query('order') order: 'asc' | 'desc' = 'desc'
    ): Promise<Dino[]> {
        return this.dinoService.getRanking(category, parseInt(limit), order);
    }

    @Get('my/dinos')
    @UseGuards(AuthGuard)
    async findMyDinos(@Request() req): Promise<any[]> {
        const dinos = await this.dinoService.findByUserId(req.user.id);
        return dinos.map(dino => {
            const age = new Date().getTime() - dino.createdAt.getTime();
            const days = Math.floor(age / (1000 * 60 * 60 * 24));
            const hours = Math.floor((age % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((age % (1000 * 60 * 60)) / (1000 * 60));
            
            return {
                id: dino.id,
                name: dino.name,
                level: dino.level,
                species: dino.species,
                clan: dino.clan,
                sex: dino.sex,
                createdAt: dino.createdAt,
                age: {
                    days,
                    hours,
                    minutes
                },
                weight: dino.weight,
                height: dino.height,
                intelligence: dino.intelligence,
                agility: dino.agility,
                strength: dino.strength,
                endurance: dino.endurance,
                experience: dino.experience,
                health: dino.health,
                hunger: dino.hunger,
                thirst: dino.thirst,
                emeralds: dino.emeralds,
                job: dino.job,
            };
        });
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

    @Get(':id/cave')
    @UseGuards(AuthGuard)
    async getDinoCave(@Param('id', ParseIntPipe) id: number): Promise<Cave> {
        return await this.dinoService.getDinoCave(id);
    }

    @Post(':id/lastAction')
    @UseGuards(AuthGuard)
    async setLastAction(@Param('id', ParseIntPipe) id: number): Promise<Dino> {
        return await this.dinoService.setLastAction(id);
    }

    @Get(':species/level/:level')
    async getLevelRequirements(
        @Param('species') speciesParam: string,
        @Param('level', ParseIntPipe) level: number
    ) {
        // Convertir le paramètre en valeur d'énumération
        let species: DinoSpecies;
        switch (speciesParam.toUpperCase()) {
            case 'T-REX':
            case 'TREX':
                species = DinoSpecies.TREX;
                break;
            case 'VELOCIRAPTOR':
                species = DinoSpecies.VELOCIRAPTOR;
                break;
            case 'PTERODACTYL':
            case 'PTERODACTYLE':
                species = DinoSpecies.PTERODACTYL;
                break;
            case 'MEGALODON':
                species = DinoSpecies.MEGALODON;
                break;
            default:
                throw new NotFoundException(`Espèce ${speciesParam} non trouvée. Les espèces valides sont : T-Rex, Velociraptor, Pterodactyl, Megalodon`);
        }
        
        return await this.dinoService.getLevelRequirements(species, level);
    }

    @Post(':id/levelup')
    @UseGuards(AuthGuard)
    async levelUp(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<Dino> {
        const dino = await this.dinoService.findOne(id);
        if (dino.userId !== req.user.id) {
            throw new ForbiddenException('Vous n\'êtes pas le propriétaire de ce dinosaure');
        }
        return await this.dinoService.levelUp(id);
    }

    @Post(':id/treat-disease')
    @UseGuards(AuthGuard)
    async treatDisease(
        @Request() req,
        @Param('id', ParseIntPipe) id: number
    ) {
        const dino = await this.dinoService.treatDisease(id);
        return {
            message: 'Votre dinosaure a été soigné avec succès',
            dino
        };
    }

    @Get(':id/disease')
    @UseGuards(AuthGuard)
    async getDiseaseInfo(
        @Param('id', ParseIntPipe) id: number
    ): Promise<{ disease: DiseaseConfig | null }> {
        const diseaseInfo = await this.dinoService.getDiseaseInfo(id);
        return { disease: diseaseInfo };
    }
}
