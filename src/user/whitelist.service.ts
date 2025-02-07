import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class WhitelistService implements OnModuleInit {
    private whitelistedEmails: Set<string> = new Set();
    private readonly whitelistPath = path.join(process.cwd(), 'whitelist.txt');

    async onModuleInit() {
        await this.loadWhitelist();
    }

    private async loadWhitelist() {
        try {
            const content = await fs.readFile(this.whitelistPath, 'utf-8');
            const emails = content.split('\n').map(email => email.trim()).filter(email => email);
            this.whitelistedEmails = new Set(emails);
        } catch (error) {
            console.error('Erreur lors du chargement de la whitelist:', error);
            throw error;
        }
    }

    async isEmailWhitelisted(email: string): Promise<boolean> {
        await this.loadWhitelist(); // Recharger la liste à chaque vérification pour avoir les dernières modifications
        return this.whitelistedEmails.has(email);
    }
} 