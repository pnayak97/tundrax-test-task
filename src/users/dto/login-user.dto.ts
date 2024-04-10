import { IsString, IsNotEmpty } from "class-validator";

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  email: string;
}
