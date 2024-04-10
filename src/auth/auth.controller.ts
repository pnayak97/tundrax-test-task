import { Controller, Body, Post } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginUserDto } from "../users/dto/login-user.dto";
import { UserRole } from "src/users/enums/user-role.enum";
import { Roles } from "src/common/decorators/roles.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async registerUser(@Body() user: CreateUserDto) {
    return this.authService.registerUser(user);
  }

  // @Roles([UserRole.SuperAdmin])
  @Post("registerAdmin")
  async registerAdminUser(@Body() user: CreateUserDto) {
    return this.authService.registerAdminUser(user);
  }

  @Post("login")
  async loginUser(@Body() user: LoginUserDto) {
    return this.authService.login(user);
  }
}
