module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/", "<rootDir>/test/"],
  testRegex: "\.(test|spec)\.ts$",
  moduleFileExtensions: ["ts", "js", "json", "node"]
};
