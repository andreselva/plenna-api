import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'O nome de usuário deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome de usuário não pode estar vazio.' })
  username: string;

  @IsString({ message: 'A senha deve ser um texto.' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  password: string;
}