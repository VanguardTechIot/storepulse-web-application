import { UserResource } from './users-response';

export type SignUpRequest = Omit<UserResource, 'id'>;
