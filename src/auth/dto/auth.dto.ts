import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'E-mail ou nome de usuário é obrigatório' })
  @IsString()
  identifier: string;

  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @IsString()
  password: string;
}

export class RegisterDto {
  @IsNotEmpty({ message: 'Nome completo é obrigatório' })
  @IsString()
  fullName: string;

  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  @IsEmail({}, { message: 'E-mail em formato inválido' })
  email: string;

  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve possuir no mínimo 6 caracteres' })
  password: string;

  @IsOptional()
  @IsString()
  organizationName?: string;
}

export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  @IsEmail({}, { message: 'E-mail em formato inválido' })
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  @IsEmail({}, { message: 'E-mail em formato inválido' })
  email: string;

  @IsNotEmpty({ message: 'Código de recuperação é obrigatório' })
  @IsString()
  token: string;

  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @MinLength(6, { message: 'A nova senha deve possuir no mínimo 6 caracteres' })
  newPassword: string;
}

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'ID do usuário é obrigatório' })
  @IsString()
  userId: string;

  @IsNotEmpty({ message: 'Senha atual é obrigatória' })
  @IsString()
  currentPassword: string;

  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @MinLength(6, { message: 'A nova senha deve possuir no mínimo 6 caracteres' })
  newPassword: string;
}
