import { UserMFAMgmt } from '@auth0/web-ui-components-react/spa';

const UserProfilePage = () => {
  return (
    <div className="space-y-6">
      <UserMFAMgmt
      // styling={{
      //   variables: {
      //     common: {
      //       '--font-size-heading': '50px',
      //       '--font-size-description': '1.25rem',
      //       '--font-size-title': '30px',
      //       '--font-size-paragraph': '0.875rem',
      //       '--font-size-label': '0.875rem',
      //     },
      //     light: {
      //       '--color-primary': 'blue',
      //       '--color-primary-foreground': 'white',
      //       '--color-foreground': 'orange',
      //       '--color-muted-foreground': 'orange',
      //       '--color-accent-foreground': '#a1a1ee',
      //     },
      //     dark: {
      //       '--color-primary': 'red',
      //       '--color-primary-foreground': 'white',
      //       '--color-foreground': 'red',
      //       '--color-muted-foreground': 'green',
      //       '--color-accent-foreground': '#a1a1ee',
      //     },
      //   },
      //   classes: {
      //     'DeleteFactorConfirmation-dialogContent': '',
      //     'UserMFAMgmt-card': '',
      //     'UserMFASetupForm-dialogContent': ''
      //   }
      // }}
      // factorConfig={{
      //   sms: {
      //     visible: false,
      //   },
      //   email: {
      //     visible: false,
      //   },
      //   "push-notification": {
      //     visible: false,
      //   },
      //   'otp': {
      //     visible: false,
      //   },
      // }}
      />
    </div>
  );
};

export default UserProfilePage;
