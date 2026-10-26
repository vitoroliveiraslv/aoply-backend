import { Request, Response } from 'express';
import { PrismaService } from './prisma/prisma.service';
export declare class AppController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getPrivacyPolicy(res: Response): Response<any, Record<string, any>>;
    getTermsOfService(res: Response): Response<any, Record<string, any>>;
    getRoot(req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
}
