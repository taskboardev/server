export function getVariable(name: string): string {
  const val = process.env[name];

  if (!val) {
    console.log(`environment variable missing: "${name}"`);
    process.exit(1);
  }

  return val;
}

export function getByPath<T>(varname: string): T {
  const path = getVariable(varname);
  const val = require(`../${path}`);
  return val as T;
}
