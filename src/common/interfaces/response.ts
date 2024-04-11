type responseData = {
  [key: string]: string | number | number[] | string[];
};
export interface IResponse {
  data?: string | Record<string, any> | Record<string, any>[] | responseData;
  message: string;
  status: number;
}

export interface IFilterResponse {
  timestamp: string;
  path: string;
  message?: string[] | string;
  statusCode: number;
}
