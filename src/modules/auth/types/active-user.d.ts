import { Auth } from "../entities/auth.entity";


export type ActiveUser = Pick<Auth, 'id' | 'email' | 'username' | 'roles'>;
