export class LoginDto {
  phone: string;
  pin: string;
}

export class RegisterDto {
  name: string;
  phone: string;
  pin: string;
}

export class LoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    name: string;
  };
}
