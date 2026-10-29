import app from './index.js';
import { readAppConfig } from './config/env.js';

const { port } = readAppConfig();

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${port}`);
});
