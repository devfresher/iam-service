import { SetMetadata } from '@nestjs/common';

export const MESSAGE_KEY = 'response_message';
export const ResponseMessage = (message: string) => SetMetadata(MESSAGE_KEY, message);
