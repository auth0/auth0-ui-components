## MFA Challenge Integration Guide

This guide shows how to integrate MFA challenges into your application when users need to authenticate with existing factors before enrolling new ones.

### Architecture Overview

The solution is designed with maximum reusability in mind:

**Core Package (`@auth0-web-ui-components/core`)**

- `MFAController.enrollFactorWithChallenge()` - Enhanced enrollment that detects challenges
- `MFAController.resolveChallenge()` - Resolves MFA challenges
- `mfa-challenge-service.ts` - Challenge detection and resolution logic
- New types: `MfaChallenge`, `ResolveChallengeOptions`, etc.

**React Package (`@auth0-web-ui-components/react`)**

- `useMFA()` hook enhanced with challenge methods
- `MfaChallengeModal` - UI component for challenge resolution
- `EnrollmentWithChallenge` - Complete enrollment flow with challenge handling

### Integration Examples

#### 1. Basic Challenge-Aware Enrollment

```tsx
import { useMFA } from '@auth0-web-ui-components/react';

function MyEnrollmentComponent() {
  const { enrollMfaWithChallenge, resolveChallenge } = useMFA();
  const [challenge, setChallenge] = useState(null);

  const handleEnroll = async () => {
    try {
      const result = await enrollMfaWithChallenge('sms', { phone_number: '+1234567890' });

      if (result.challenge) {
        // Challenge required - show challenge UI
        setChallenge(result.challenge);
      } else {
        // Regular enrollment succeeded
        console.log('Enrollment successful:', result);
      }
    } catch (error) {
      console.error('Enrollment failed:', error);
    }
  };

  const handleChallengeResolve = async (code) => {
    const result = await resolveChallenge({
      challengeToken: challenge.challengeToken,
      authenticatorId: challenge.availableMethods[0].authenticatorId,
      code,
    });

    if (result.success) {
      // Challenge resolved - retry enrollment with elevated permissions
      setChallenge(null);
      handleEnroll(); // Retry with elevated token
    }
  };
}
```

#### 2. Using the Pre-built Components

```tsx
import { EnrollmentWithChallenge } from '@auth0-web-ui-components/react';

function MyMfaManagement() {
  const [enrolling, setEnrolling] = useState(false);
  const [factorType, setFactorType] = useState(null);

  return (
    <>
      <button onClick={() => { setFactorType('sms'); setEnrolling(true); }}>
        Enroll SMS
      </button>

      <EnrollmentWithChallenge
        open={enrolling}
        factorType={factorType}
        onClose={() => setEnrolling(false)}
        onSuccess={() => {
          setEnrolling(false);
          // Refresh factors list
        }}
        onError={(error, stage) => {
          console.error(\`Error in \${stage}:\`, error);
        }}
      />
    </>
  );
}
```

### Error Scenarios

The system handles these challenge scenarios:

1. **mfa_required** - User needs to authenticate with any existing factor
2. **step_up_authentication** - User needs elevated authentication level

### Framework Extensibility

Since most logic is in the core package, adding support for other frameworks is straightforward:

**Angular Example:**

```typescript
// angular-components/mfa-challenge.service.ts
@Injectable()
export class MfaChallengeService {
  constructor(private coreClient: CoreClient) {}

  async enrollWithChallenge(factor: string, options: any) {
    return this.coreClient.authentication.mfa.enrollFactorWithChallenge(factor, options);
  }

  async resolveChallenge(options: ResolveChallengeOptions) {
    return this.coreClient.authentication.mfa.resolveChallenge(options);
  }
}
```

**Vue Example:**

```javascript
// vue-components/useMfaChallenge.js
export function useMfaChallenge(coreClient) {
  const enrollWithChallenge = async (factor, options) => {
    return coreClient.authentication.mfa.enrollFactorWithChallenge(factor, options);
  };

  const resolveChallenge = async (options) => {
    return coreClient.authentication.mfa.resolveChallenge(options);
  };

  return { enrollWithChallenge, resolveChallenge };
}
```

### API Reference

#### Core Methods

- `enrollFactorWithChallenge(factorName, options)` - Returns enrollment response or challenge
- `resolveChallenge(options)` - Authenticates user and returns elevated access token

#### React Components

- `<MfaChallengeModal>` - Modal for challenge resolution
- `<EnrollmentWithChallenge>` - Complete enrollment flow with challenge handling

#### Challenge Flow

1. User attempts to enroll new MFA factor
2. API returns 401/403 with challenge information
3. System extracts challenge and shows appropriate UI
4. User authenticates with existing factor
5. System receives elevated access token
6. Enrollment proceeds with elevated permissions

This approach ensures that:

- ✅ Maximum code reuse across frameworks
- ✅ Clean separation of concerns
- ✅ Extensible architecture
- ✅ Type-safe implementation
- ✅ Consistent user experience
