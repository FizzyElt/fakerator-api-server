import { createGeneratorByType, createValueConfig } from "struct-fakerator";
import { faker } from "@faker-js/faker";
import { Effect, pipe, identity } from "effect";

const fakerFnFactory = (fn) => (option) => createValueConfig(() => fn(option));

const customFakeDataFn = {
  int: fakerFnFactory(faker.number.int),
  float: fakerFnFactory(faker.number.float),

  line: fakerFnFactory(faker.lorem.lines),

  phoneNumber: fakerFnFactory(faker.string.numeric),

  price: fakerFnFactory(faker.commerce.price),

  date: fakerFnFactory(faker.date.anytime),
};

const customTypeMatch = (config) => {
  const typeFn = customFakeDataFn[config.type];
  if (typeFn !== undefined) {
    return typeFn(config.option);
  }

  throw new Error(`Unsupported type: ${config.type}`);
};

export const generateFakeData = (config) => {
  return createGeneratorByType(config, customTypeMatch)();
};

export class ConfigError {
  _tag = "ConfigError";
  constructor(content) {
    this.content = content;
  }

  toString() {
    return `ConfigError: ${this.content}`;
  }
}

export const generateFakeDataEffect = (config) => {
  return pipe(
    Effect.try({
      try: () => createGeneratorByType(config, customTypeMatch),
      catch: (err) => new ConfigError(err.toString()),
    }),
    Effect.map((fn) => fn()),
  );
};
