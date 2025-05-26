import { PactV3 } from '@pact-foundation/pact';

export class TestMixin {
  private testIndex: string = '';

  updateTestIndex(index: string) {
    this.testIndex = index;
  }

  async setupPact(consumer: PactV3, provider: PactV3) {
    // Pact V3 handles setup automatically
  }

  async teardownPact() {
    // Pact V3 handles cleanup automatically
  }
} 