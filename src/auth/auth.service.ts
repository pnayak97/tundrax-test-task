import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "../entities/User.entity";
import { DeepPartial, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { LoginUserDto } from "src/users/dto/login-user.dto";
import config from "../configuration";
import bcrypt from "bcrypt";
import { UserRole } from "../users/enums/user-role.enum";
import { IResponse } from "../common/interfaces/response";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  public async findUser(
    id: number,
    email: string,
  ): Promise<Omit<User, "password">> {
    const existingUser = await this.userRepository.findOne({
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
      },
      where: { id, email },
    });

    if (!existingUser) {
      throw new NotFoundException("User does not exists");
    }

    return existingUser;
  }

  public async login(payload: LoginUserDto): Promise<IResponse> {
    const { email, password } = payload;
    // check if user email exist already
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException(
        "Invalid credentials - email does not exists",
      );
    }

    const isValidPassword = await this.validatePassword(user, password);
    if (!isValidPassword) {
      throw new UnauthorizedException(
        "Invalid credentials - password does not match",
      );
    }
    const secret = config().keys.jwtServerSecret;

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: config().Constants.lifetime,
    });

    return {
      message: "Successfully loggedIn",
      status: HttpStatus.OK,
      data: {
        accessToken,
      },
    };
  }

  public async registerUser(
    payload: CreateUserDto,
    roles?: DeepPartial<UserRole>[],
  ): Promise<IResponse> {
    // check if user exist already
    const { email, password, name } = payload;
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new HttpException("Email already exists", HttpStatus.NOT_FOUND);
    }

    // Hash the password
    const encryptedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
      name,
      password: encryptedPassword,
      email,
      roles: roles && roles.length > 0 ? roles : [UserRole.User],
    };

    await this.userRepository.save(newUser);

    return {
      message: "Successfully registered user",
      status: HttpStatus.OK,
    };
  }

  public async registerAdminUser(payload: CreateUserDto): Promise<IResponse> {
    await this.registerUser(payload, [UserRole.Admin]);

    return {
      message: "Successfully registered Admin",
      status: HttpStatus.OK,
    };
  }
}
