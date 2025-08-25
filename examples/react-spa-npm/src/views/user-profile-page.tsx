import { UserMFAMgmt } from '@auth0-web-ui-components/react';

const UserProfilePage = () => {
  return (
    <div className="space-y-6">
      <UserMFAMgmt
        // styling={{
        //   common: {
        //     '--font-size-heading': '50px',
        //     '--font-size-description': '1.25rem',
        //     '--font-size-title': '30px',
        //     '--font-size-paragraph': '0.875rem',
        //     '--font-size-label': '0.875rem',
        //   },
        //   light: {
        //     '--color-primary': 'blue',
        //     '--color-primary-foreground': 'white',
        //     '--color-foreground': 'orange',
        //     '--color-muted-foreground': 'orange',
        //     '--color-accent-foreground': '#a1a1ee',
        //   },
        //   dark: {
        //     '--color-primary': 'red',
        //     '--color-primary-foreground': 'white',
        //     '--color-foreground': 'red',
        //     '--color-muted-foreground': 'green',
        //     '--color-accent-foreground': '#a1a1ee',
        //   },
        // }}
        factorConfig={{
          duo: {
            visible: false,
          },
          'webauthn-platform': {
            visible: false,
          },
          'recovery-code': {
            visible: false,
          },
          'webauthn-roaming': {
            visible: false,
          },
        }}
      />
    </div>
  );
};

export default UserProfilePage;
