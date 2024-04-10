import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "../common/interfaces/jwt-payload";
import { User } from "../entities/User.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { LoginUserDto } from "src/users/dto/login-user.dto";
import config from "../configuration";
import bcrypt from "bcrypt";
import { UserRole } from "src/users/enums/user-role.enum";
import { IResponse } from "src/common/interfaces/response";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  private async findUser(email: string, password: string) {
    //TO ADD select
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser && bcrypt.compareSync(password, existingUser.password)) {
      return existingUser;
    }
    return null;
  }

  public async checkUser(
    id: number,
    email: string
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
      throw new NotFoundException("User Does Not Exist");
    }

    return existingUser;
  }

  private async createToken(user: User) {
    const payload: JwtPayload = {
      email: user.email,
      id: user.id,
    };
    const secret = config().keys.jwtServerSecret;
    return {
      accessToken: this.jwtService.sign(payload, {
        secret,
        expiresIn: config().Constants.lifetime,
      }),
    };
  }

  // generate encrypted password
  public encryptPassword(password: string): string {
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    return hashedPassword;
  }

  public async login(payload: LoginUserDto) :Promise<IResponse>{
    const { email, password } = payload;
    // check if user exist already
    const user = await this.findUser(email, password);
    if (!user) {
      throw new NotFoundException("User Does Not Exist");
    }

    const accessToken = await this.createToken(user);
    const { name, email: userEmail } = user;
    return {
      message:"Successfully loggedIn",
      status:HttpStatus.OK,
      data:{
      ...accessToken,
      userDetails: {
        name,
        email: userEmail,
      },
    }
    };
  }

  public async registerUser(payload: CreateUserDto): Promise<IResponse> {
    // check if user exist already
    const { email, password, name } = payload;
    const userExists = await this.findUser(email, password);
    if (userExists) {
      throw new BadRequestException("Can not register user already exists");
    }

    // register new user
    const encryptedPassword = this.encryptPassword(password);
    const newUser = {
      name,
      password: encryptedPassword,
      email,
    };

    const user = await this.userRepository.save(newUser);
    if (!user)
      throw new HttpException(
        "Error in updating user records",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    const { name: userName, email: userEmail } = user;
    return {
      message: "Successfully registered user",
      status: HttpStatus.OK,
      data: {
        name: userName,
        email: userEmail,
      },
    };
  }

  public async registerAdminUser(payload: CreateUserDto): Promise<IResponse> {
    // check if user exist already
    const { email, password, name } = payload;
    const userExists = await this.findUser(email, password);
    if (userExists) {
      throw new BadRequestException("Can not register user already exists");
    }

    // register new user
    const encryptedPassword = this.encryptPassword(password);
    const newUser = {
      name,
      password: encryptedPassword,
      email,
      roles: [UserRole.Admin],
    };
    const user = await this.userRepository.save(newUser);
    const { name: userName, email: userEmail } = user;
    return {
      status: HttpStatus.OK,
      message: "Successfully registered Admin",
      data: {
        name: userName,
        email: userEmail,
      },
    };
  }
}
