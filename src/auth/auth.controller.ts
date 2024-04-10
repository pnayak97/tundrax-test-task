import { Controller, Body, Post } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginUserDto } from "../users/dto/login-user.dto";
import { IResponse } from "src/common/interfaces/response";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async registerUser(@Body() user: CreateUserDto): Promise<IResponse> {
    return this.authService.registerUser(user);
  }

  @Post("registerAdmin")
  async registerAdminUser(@Body() user: CreateUserDto): Promise<IResponse> {
    return this.authService.registerAdminUser(user);
  }

  @Post("login")
  async loginUser(@Body() user: LoginUserDto): Promise<IResponse> {
    return this.authService.login(user);
  }
}
