import { createApp } from './app.js';
import { readAppConfig } from './config/env.js';

const config = readAppConfig();
const app = createApp({ config });

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});
