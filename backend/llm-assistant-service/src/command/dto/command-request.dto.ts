import { IsNotEmpty, IsString } from 'class-validator';

export class CommandRequestDto {
  @IsNotEmpty()
  @IsString()
  command: string;
}
