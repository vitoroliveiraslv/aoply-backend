import { Injectable, OnModuleInit, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';
import { hashPassword, verifyPassword, generateToken, generateRecoveryCode } from './auth.util';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureDefaultAdmin();
  }

  /**
   * Garante a existência da conta administrativa padrão:
   * Login: admin (ou admin@aoply.com)
   * Senha: Aoply@123#
   */
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
            passwordHash: hashPassword('Aoply@123#'),
            role: 'SUPERADMIN',
            organizationId: org.id,
            isActive: true,
          },
        });
        this.logger.log('✓ Conta mestre criada: login "admin" / senha "Aoply@123#"');
      } else {
        // Assegura que a senha mestre padrão seja válida caso tenha sido solicitada a restauração
        this.logger.log(`✓ Conta administrativa pronta (${existingUser.email})`);
      }
    } catch (err: any) {
      this.logger.error(`Falha ao verificar conta admin padrão: ${err?.message}`);
    }
  }

  /**
   * Autenticação via e-mail OU usuário 'admin'
   */
  async login(dto: LoginDto) {
    const rawIdentifier = dto.identifier.trim().toLowerCase();
    
    // Suporte flexível para 'admin' ou e-mail corporativo
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
      throw new BadRequestException('Usuário ou senha incorretos.');
    }

    if (!user.isActive) {
      throw new BadRequestException('Esta conta está inativa. Contate o administrador.');
    }

    const isMatch = verifyPassword(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Usuário ou senha incorretos.');
    }

    const sessionToken = generateToken();

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

  /**
   * Criação de nova conta (Sign Up)
   */
  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new BadRequestException('Este e-mail já está cadastrado no sistema.');
    }

    // Cria organização própria para o novo cliente (Multi-tenant)
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
        passwordHash: hashPassword(dto.password),
        role: 'ADMIN',
        organizationId: org.id,
        isActive: true,
      },
      include: {
        organization: true,
      },
    });

    const sessionToken = generateToken();

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

  /**
   * Solicitação de recuperação de senha via e-mail
   */
  async forgotPassword(dto: ForgotPasswordDto) {
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
      // Por segurança contra enumeração de e-mails, retornamos mensagem de confirmação
      return {
        success: true,
        message: 'Se este e-mail estiver cadastrado, as instruções e o código de recuperação foram enviados.',
      };
    }

    const code = generateRecoveryCode();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora de validade

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
      code: code, // Disponibilizado também na resposta para testes ágeis no navegador
    };
  }

  /**
   * Conclusão da troca de senha com o código recebido por e-mail
   */
  async resetPassword(dto: ResetPasswordDto) {
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
      throw new BadRequestException('Código de recuperação inválido ou e-mail incorreto.');
    }

    if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new BadRequestException('O código de recuperação expirou. Solicite um novo.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashPassword(dto.newPassword),
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return {
      success: true,
      message: 'Sua senha foi redefinida com sucesso! Você já pode entrar com a nova senha.',
    };
  }

  /**
   * Alteração de senha nas configurações da conta logada
   */
  async changePassword(dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não localizado.');
    }

    const isMatch = verifyPassword(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('A senha atual informada está incorreta.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashPassword(dto.newPassword),
      },
    });

    return {
      success: true,
      message: 'Senha atualizada com sucesso!',
    };
  }

  /**
   * Obter perfil atual
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não localizado.');
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
}
