import { createGeneratorByType, createValueConfig } from "struct-fakerator";
import { faker } from "@faker-js/faker";

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
