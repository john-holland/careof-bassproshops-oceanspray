import * as fs from 'fs';
import * as path from 'path';

interface TestConfig {
  type: 'pytest' | 'jest';
  framework: 'pact' | 'unit' | 'integration';
  service: string;
}

interface TestConfigFile {
  testFiles: {
    [key: string]: TestConfig;
  };
}

export class TestMixin {
  private config: TestConfigFile;
  private currentFile: string;
  private indexPath: string;

  constructor(currentFilePath: string) {
    this.currentFile = currentFilePath;
    this.indexPath = path.resolve(process.cwd(), 'test-index.json');
    this.config = this.loadConfig();
  }

  private loadConfig(): TestConfigFile {
    const configContent = fs.readFileSync(this.indexPath, 'utf-8');
    return JSON.parse(configContent);
  }

  private saveConfig(): void {
    fs.writeFileSync(this.indexPath, JSON.stringify(this.config, null, 2));
  }

  public getTestConfig(): TestConfig | null {
    // Try exact match first
    if (this.config.testFiles[this.currentFile]) {
      return this.config.testFiles[this.currentFile];
    }

    // Try relative path match
    const relativePath = path.relative(process.cwd(), this.currentFile);
    if (this.config.testFiles[relativePath]) {
      return this.config.testFiles[relativePath];
    }

    return null;
  }

  public getServiceName(): string {
    const config = this.getTestConfig();
    return config?.service || 'unknown';
  }

  public getTestType(): string {
    const config = this.getTestConfig();
    return config?.type || 'unknown';
  }

  public getFramework(): string {
    const config = this.getTestConfig();
    return config?.framework || 'unknown';
  }

  public getTestMetadata(): string {
    const config = this.getTestConfig();
    if (!config) {
      return 'Unknown test configuration';
    }
    return `${config.type} test using ${config.framework} framework for ${config.service} service`;
  }

  public async indexTest(command: string): Promise<void> {
    const relativePath = path.relative(process.cwd(), this.currentFile);
    const testType = this.getTestType();
    const framework = this.getFramework();
    const service = this.getServiceName();

    // Update the test index
    this.config.testFiles[relativePath] = {
      type: testType as 'pytest' | 'jest',
      framework: framework as 'pact' | 'unit' | 'integration',
      service
    };

    // Save the updated index
    this.saveConfig();

    // Log the command for reference
    console.log(`Test command for ${relativePath}:`);
    console.log(command);
  }
}

// Example usage for Jest:
export const withTestMixin = (filePath: string) => {
  const mixin = new TestMixin(filePath);
  return {
    beforeAll: (callback: () => void) => {
      console.log(`Running ${mixin.getTestMetadata()}`);
      callback();
    },
    afterAll: (callback: () => void) => {
      console.log(`Completed ${mixin.getTestMetadata()}`);
      callback();
    }
  };
};

// Example usage for Pytest:
export const pytestMixin = (filePath: string) => {
  const mixin = new TestMixin(filePath);
  return {
    setup_module: () => {
      console.log(`Running ${mixin.getTestMetadata()}`);
    },
    teardown_module: () => {
      console.log(`Completed ${mixin.getTestMetadata()}`);
    }
  };
}; 