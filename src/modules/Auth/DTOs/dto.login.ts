import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'O nome de usuário deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome de usuário não pode estar vazio.' })
  username: string;

  @IsString({ message: 'Invalid password!' })
  @IsNotEmpty({ message: 'Invalid password.' })
  password: string;
}