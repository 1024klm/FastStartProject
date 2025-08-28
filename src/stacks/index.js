import { javascriptStack } from './javascript.js';
import { typescriptStack } from './typescript.js';
import { pythonStack } from './python.js';
import { rubyStack } from './ruby.js';
import { lamderaStack } from './lamdera.js';
import { reactStack } from './react.js';
import { nextStack } from './next.js';
import { fastapiStack } from './fastapi.js';
import { railsStack } from './rails.js';

const stacks = {
  javascript: javascriptStack,
  typescript: typescriptStack,
  python: pythonStack,
  ruby: rubyStack,
  lamdera: lamderaStack,
  react: reactStack,
  next: nextStack,
  fastapi: fastapiStack,
  rails: railsStack
};

export function getStackConfig(stack) {
  return stacks[stack] || javascriptStack;
}