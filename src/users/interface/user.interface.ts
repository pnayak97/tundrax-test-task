import { ICat } from "src/cats/interfaces/cat.interface";
import { Request } from "express";

export interface IUser {
  name: string;
  id: number;
  favorites: ICat[];
  email: string;
}

export interface UserRequest extends Request {
  user: {
    id: number;
    name: string;
    roles: string[];
  };
}
