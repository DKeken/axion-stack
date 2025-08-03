import { Inject } from '@nestjs/common';

import { HTTP_PROXY_PROVIDER } from '../tokens';

export const InjectHttpProxy = () => Inject(HTTP_PROXY_PROVIDER);
