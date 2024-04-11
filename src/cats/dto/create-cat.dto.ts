import { IsInt, IsString, IsOptional, IsNotEmpty } from "class-validator";
import { Type } from "class-transformer";

export class CreateCatDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsInt()
  age: number;

  @IsNotEmpty()
  @IsString()
  breed: string;
}
export class UpdateCatDto {
  @IsOptional()
  @IsString()
  name: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  age?: number;

  @IsOptional()
  @IsString()
  breed?: string;
}
