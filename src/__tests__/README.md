# Log Sheet Endpoint Tests

This directory contains comprehensive tests for the log sheet endpoint functionality.

## Test Structure

### Unit Tests

#### Controller Tests (`api/v1/log-sheets/logSheets.controller.test.ts`)
- Tests the `createLogSheet` controller function
- Validates request handling and response formatting
- Tests error scenarios (project not found, validation errors)
- Mocks all dependencies for isolated testing

#### Service Tests (`api/v1/log-sheets/logSheets.service.test.ts`)
- Tests the `createLogSheetService` function
- Validates date handling (string dates, Date objects, invalid dates)
- Tests parameter processing for different value types (NUMBER, BOOLEAN, TEXT)
- Tests machine-specific vs general parameter handling
- Tests error scenarios and edge cases

#### Route Tests (`api/v1/log-sheets/route.test.ts`)
- Tests the Next.js API route handler
- Validates parameter extraction and controller delegation
- Tests error propagation

### Schema Tests

#### Dynamic Schema Tests (`schemas/dynamicLogSheetSchema.test.ts`)
- Tests the dynamic schema generation
- Validates date format validation
- Tests parameter type validation (NUMBER, BOOLEAN, TEXT)
- Tests chemical usage data validation
- Tests edge cases and error scenarios

### Integration Tests

#### Full Flow Tests (`integration/logSheets.integration.test.ts`)
- Tests the complete log sheet creation flow
- Validates end-to-end functionality
- Tests complex scenarios with multiple parameter types
- Tests backdating functionality
- Tests error handling across the entire flow

## Test Utilities

### Setup (`setup.ts`)
- Configures test environment
- Mocks Next.js and Prisma dependencies
- Sets up global test utilities

### Helpers (`utils/testHelpers.ts`)
- Provides reusable test data creators
- Mock object factories
- Assertion helpers
- Common test utilities

## Running Tests

### All Tests
`bash
npm test
`

### Run Tests Once
`bash
npm run test:run
`

### Watch Mode
`bash
npm run test:watch
`

### Coverage Report
`bash
npm run test:coverage
`

### UI Mode
`bash
npm run test:ui
`

## Test Coverage

The tests cover:

### ✅ Happy Path Scenarios
- Valid log sheet creation with all parameter types
- Date handling (current date, backdating)
- Machine-specific parameter processing
- General parameter processing
- Chemical usage data handling

### ✅ Error Scenarios
- Project not found (404)
- Invalid date formats
- Validation errors
- Database transaction failures
- Missing required fields
- Invalid parameter values

### ✅ Edge Cases
- Empty parameter groups
- No machines for machine-specific groups
- Null/undefined parameter values
- Unknown parameter value types
- Malformed request data

### ✅ Date Feature Testing
- String date validation
- Date object handling
- Invalid date rejection
- Backdating functionality
- Default to current date when not provided

## Key Test Features

### Comprehensive Mocking
- All external dependencies are properly mocked
- Database operations are isolated
- Next.js framework components are mocked

### Type Safety
- All tests use proper TypeScript types
- Mock objects match expected interfaces
- Type assertions validate data structures

### Realistic Test Data
- Test data reflects real-world usage patterns
- Multiple parameter types and machine configurations
- Valid and invalid data scenarios

### Error Handling
- Tests validate proper error responses
- Error messages and status codes are verified
- Error propagation is tested across layers

## Adding New Tests

When adding new functionality:

1. **Unit Tests**: Add tests for individual functions
2. **Integration Tests**: Add end-to-end flow tests
3. **Schema Tests**: Add validation tests for new schemas
4. **Update Helpers**: Add new mock data creators as needed

### Test Naming Convention
- Use descriptive test names that explain the scenario
- Group related tests using `describe` blocks
- Use `it` for individual test cases
- Follow the pattern: "should [expected behavior] when [condition]"

### Mock Data
- Use the helper functions in `testHelpers.ts`
- Create realistic test data that matches production scenarios
- Include both valid and invalid data for comprehensive testing

## Debugging Tests

### Common Issues
1. **Mock not working**: Ensure mocks are properly configured in `setup.ts`
2. **Type errors**: Check that mock objects match expected interfaces
3. **Async issues**: Ensure all async operations are properly awaited
4. **Date issues**: Use consistent date formats in test data

### Debug Tips
- Use `console.log` in tests for debugging (remove before committing)
- Check mock call counts with `expect(mockFn).toHaveBeenCalledTimes(n)`
- Verify mock call arguments with `expect(mockFn).toHaveBeenCalledWith(...)`
- Use `vi.clearAllMocks()` in `beforeEach` to reset mock state

## Continuous Integration

These tests are designed to run in CI/CD pipelines:
- No external dependencies required
- All database operations are mocked
- Tests run in Node.js environment
- Fast execution with comprehensive coverage
"
