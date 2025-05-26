import { IsEmail, IsString, IsEnum, IsBoolean, MinLength } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  FISHERMAN = 'fisherman',
}

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsBoolean()
  is_active?: boolean;
}

export class UpdateUserDto {
  @IsString()
  @MinLength(3)
  username?: string;

  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(8)
  password?: string;

  @IsEnum(UserRole)
  role?: UserRole;

  @IsBoolean()
  is_active?: boolean;
} 