import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth/auth.service";
import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { JwtPayload } from "../common/interfaces/jwt-payload";
import { User } from "../entities/User.entity";
import { config } from "../configuration";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config().keys.jwtServerSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<Partial<User>> {
    const user = await this.authService.checkUser(payload.id, payload.email);
    if (!user) {
      throw new HttpException("Invalid token", HttpStatus.UNAUTHORIZED);
    }

    const { id, name, roles } = user;
    const userDetails = {
      id,
      name,
      roles,
    };
    return userDetails;
  }
}
