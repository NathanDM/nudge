export class LoginDto {
  userId: string;
  pin: string;
}

export class LoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    name: string;
  };
}
