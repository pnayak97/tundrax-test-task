import { HttpStatus } from "@nestjs/common";

export interface IResponse {
  data: any;
  message: string;
  status: number;
}
