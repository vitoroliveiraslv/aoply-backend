"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const auth_util_1 = require("./auth.util");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.ensureDefaultAdmin();
    }
    async ensureDefaultAdmin() {
        try {
            const adminEmail = 'admin@aoply.com';
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        { email: adminEmail },
                        { email: 'admin' },
                    ],
                },
            });
            let org = await this.prisma.organization.findFirst();
            if (!org) {
                org = await this.prisma.organization.create({
                    data: {
                        name: 'Aoply Matriz Corporativa',
                        slug: 'aoply-matriz',
                    },
                });
            }
            if (!existingUser) {
                await this.prisma.user.create({
                    data: {
                        email: adminEmail,
                        fullName: 'Administrador Geral Aoply',
                        passwordHash: (0, auth_util_1.hashPassword)('Aoply@123#'),
                        role: 'SUPERADMIN',
                        organizationId: org.id,
                        isActive: true,
                    },
                });
                this.logger.log('✓ Conta mestre criada: login "admin" / senha "Aoply@123#"');
            }
            else {
                this.logger.log(`✓ Conta administrativa pronta (${existingUser.email})`);
            }
        }
        catch (err) {
            this.logger.error(`Falha ao verificar conta admin padrão: ${err?.message}`);
        }
    }
    async login(dto) {
        const rawIdentifier = dto.identifier.trim().toLowerCase();
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: rawIdentifier },
                    ...(rawIdentifier === 'admin' ? [{ email: 'admin@aoply.com' }] : []),
                ],
            },
            include: {
                organization: true,
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Usuário ou senha incorretos.');
        }
        if (!user.isActive) {
            throw new common_1.BadRequestException('Esta conta está inativa. Contate o administrador.');
        }
        const isMatch = (0, auth_util_1.verifyPassword)(dto.password, user.passwordHash);
        if (!isMatch) {
            throw new common_1.BadRequestException('Usuário ou senha incorretos.');
        }
        const sessionToken = (0, auth_util_1.generateToken)();
        return {
            success: true,
            message: 'Autenticado com sucesso!',
            token: sessionToken,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId,
                organizationName: user.organization?.name || 'Aoply Network',
            },
        };
    }
    async register(dto) {
        const normalizedEmail = dto.email.trim().toLowerCase();
        const existing = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (existing) {
            throw new common_1.BadRequestException('Este e-mail já está cadastrado no sistema.');
        }
        const orgName = dto.organizationName?.trim() || `${dto.fullName} Signage`;
        const slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
        const org = await this.prisma.organization.create({
            data: {
                name: orgName,
                slug: slug,
            },
        });
        const newUser = await this.prisma.user.create({
            data: {
                email: normalizedEmail,
                fullName: dto.fullName.trim(),
                passwordHash: (0, auth_util_1.hashPassword)(dto.password),
                role: 'ADMIN',
                organizationId: org.id,
                isActive: true,
            },
            include: {
                organization: true,
            },
        });
        const sessionToken = (0, auth_util_1.generateToken)();
        return {
            success: true,
            message: 'Conta criada com sucesso!',
            token: sessionToken,
            user: {
                id: newUser.id,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role,
                organizationId: newUser.organizationId,
                organizationName: org.name,
            },
        };
    }
    async forgotPassword(dto) {
        const rawEmail = dto.email.trim().toLowerCase();
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: rawEmail },
                    ...(rawEmail === 'admin' ? [{ email: 'admin@aoply.com' }] : []),
                ],
            },
        });
        if (!user) {
            return {
                success: true,
                message: 'Se este e-mail estiver cadastrado, as instruções e o código de recuperação foram enviados.',
            };
        }
        const code = (0, auth_util_1.generateRecoveryCode)();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: code,
                resetTokenExpires: expiresAt,
            },
        });
        this.logger.log(`[SIMULAÇÃO DE DISPARO DE E-MAIL] Para: ${user.email} | Código de Recuperação Aoply: ${code}`);
        return {
            success: true,
            message: 'Código de recuperação de senha enviado com sucesso para o seu e-mail!',
            email: user.email,
            code: code,
        };
    }
    async resetPassword(dto) {
        const rawEmail = dto.email.trim().toLowerCase();
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: rawEmail },
                    ...(rawEmail === 'admin' ? [{ email: 'admin@aoply.com' }] : []),
                ],
                resetToken: dto.token.trim(),
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Código de recuperação inválido ou e-mail incorreto.');
        }
        if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
            throw new common_1.BadRequestException('O código de recuperação expirou. Solicite um novo.');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: (0, auth_util_1.hashPassword)(dto.newPassword),
                resetToken: null,
                resetTokenExpires: null,
            },
        });
        return {
            success: true,
            message: 'Sua senha foi redefinida com sucesso! Você já pode entrar com a nova senha.',
        };
    }
    async changePassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não localizado.');
        }
        const isMatch = (0, auth_util_1.verifyPassword)(dto.currentPassword, user.passwordHash);
        if (!isMatch) {
            throw new common_1.BadRequestException('A senha atual informada está incorreta.');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: (0, auth_util_1.hashPassword)(dto.newPassword),
            },
        });
        return {
            success: true,
            message: 'Senha atualizada com sucesso!',
        };
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não localizado.');
        }
        return {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
            organizationName: user.organization?.name,
            createdAt: user.createdAt,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map