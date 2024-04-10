import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./users.service";
import { ParseIntPipe } from "../common/pipes/parse-int.pipe";
import { AuthGuard } from "@nestjs/passport";
import { IUser, UserRequest } from "./interface/user.interface";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("")
  @UseGuards(AuthGuard("jwt"))
  public async getUserById(@Request() request: any): Promise<IUser> {
    return this.userService.getUserById(request.user.id);
  }

  @Post("favorite-cat/:id")
  @UseGuards(AuthGuard("jwt"))
  public async markCatAsFavorite(
    @Param("id", new ParseIntPipe())
    id: number,
    @Request() { user }: UserRequest
  ): Promise<IUser> {
    return this.userService.markCatAsFavorite(user.id, id);
  }

  @Get("/favorite-cats")
  @UseGuards(AuthGuard("jwt"))
  public async getFavoriteCats(
    @Request() { user }: UserRequest
  ): Promise<IUser> {
    return this.userService.getUserFavoriteCats(user.id);
  }
}
