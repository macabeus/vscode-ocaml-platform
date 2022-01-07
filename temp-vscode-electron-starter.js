#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const os = require("os");
const { runTests } = require("@vscode/test-electron");

const insertMonkeyPatchAllowMocks = (extensionDevelopmentPath) => {
  const packageJsonPath = path.resolve(
    extensionDevelopmentPath,
    "package.json"
  );
  const { main } = require(packageJsonPath);

  const mainPath = path.resolve(extensionDevelopmentPath, main);

  const mainContent = fs.readFileSync(mainPath);
  if (mainContent.toString().includes("global.extensionVscode")) {
    return;
  }

  fs.appendFileSync(
    mainPath,
    "\n\nglobal.extensionVscode = require('vscode');\n"
  );
};

const dropMonkeyPatchAllowMocks = (extensionDevelopmentPath) => {
  const packageJsonPath = path.resolve(
    extensionDevelopmentPath,
    "package.json"
  );
  const { main } = require(packageJsonPath);

  const mainPath = path.resolve(extensionDevelopmentPath, main);

  const mainContent = fs.readFileSync(mainPath);
  const textContent = mainContent.toString();
  if (textContent.includes("global.extensionVscode") === false) {
    return;
  }

  fs.writeFileSync(
    mainPath,
    textContent.replace("\n\nglobal.extensionVscode = require('vscode');\n", "")
  );
};

const getRandomTempDiretory = () => {
  const timestamp = Date.now();
  const folderName = `test-extension-${timestamp}`;
  const tempPath = path.resolve(os.tmpdir(), folderName);

  return tempPath;
};

const runNoWorkspace = async ({
  extensionDevelopmentPath,
  extensionTestsPath,
  version,
  testsPath,
}) => {
  await runTests({
    version,
    extensionDevelopmentPath,
    extensionTestsPath,
    launchArgs: [`--user-data-dir=${getRandomTempDiretory()}`],
    extensionTestsEnv: {
      VSCODE_TESTS_PATH: path.resolve(extensionDevelopmentPath, testsPath),
    },
  });
};

const runWithWorkspace = async ({
  extensionDevelopmentPath,
  extensionTestsPath,
  version,
  testsPath,
}) => {
  const testWorkspace = path.resolve(
    extensionDevelopmentPath,
    "test-workspace"
  );

  await runTests({
    version,
    extensionDevelopmentPath,
    extensionTestsPath,
    launchArgs: [testWorkspace, `--user-data-dir=${getRandomTempDiretory()}`],
    extensionTestsEnv: {
      VSCODE_TESTS_PATH: path.resolve(extensionDevelopmentPath, testsPath),
    },
  });
};

const recreateTestWorkspaceFolder = (extensionDevelopmentPath) => {
  const testWorkspacePath = path.resolve(
    extensionDevelopmentPath,
    "test-workspace"
  );

  fs.rmSync(testWorkspacePath, { force: true, recursive: true });
  fs.mkdirSync(testWorkspacePath, { recursive: true });
};

const start = async () => {
  const [testScenery, version, testsPath] = [
    process.argv[2],
    process.argv[3],
    process.argv[4],
  ];
  const extensionDevelopmentPath = process.cwd();

  const extensionTestsPath = path.resolve(
    extensionDevelopmentPath,
    "node_modules/jest-environment-vscode-extension/cli/vscode-tests-runner.js"
  );

  recreateTestWorkspaceFolder(extensionDevelopmentPath);
  insertMonkeyPatchAllowMocks(extensionDevelopmentPath);

  try {
    if (testScenery === "with-workspace") {
      await runWithWorkspace({
        extensionDevelopmentPath,
        extensionTestsPath,
        version,
        testsPath,
      });
    } else if (testScenery === "no-workspace") {
      await runNoWorkspace({
        extensionDevelopmentPath,
        extensionTestsPath,
        version,
        testsPath,
      });
    } else {
      throw new Error(`Unknown test scenery: ${testScenery}`);
    }
  } catch (err) {
    console.error("Failed to run tests");
    console.log(err);
    process.exit(1);
  } finally {
    dropMonkeyPatchAllowMocks(extensionDevelopmentPath);
  }
};

start();
