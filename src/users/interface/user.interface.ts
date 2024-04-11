import { ICat } from "src/cats/interfaces/cat.interface";

export interface IUser {
  name: string;
  id: number;
  favorites: ICat[];
  email: string;
}

export interface UserRequest {
  user: {
    id: number;
    name: string;
    roles: string[];
  };
}
