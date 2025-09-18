import { UserMFAMgmt } from '@auth0-web-ui-components/react';

const MFAPage = () => {
  return (
    <div className="space-y-6">
      <UserMFAMgmt
        styling={{
          variables: {
            common: {
              '--font-size-heading': '50px',
              '--font-size-description': '1.25rem',
              '--font-size-title': '30px',
              '--font-size-paragraph': '0.875rem',
              '--font-size-label': '0.875rem',
            },
          },
          classes: {
            'DeleteFactorConfirmation-dialogContent': 'custom-dialog-class',
            'UserMFAMgmt-card': 'custom-card-class',
            'UserMFASetupForm-dialogContent': 'custom-setup-dialog-class',
          },
        }}
      />
    </div>
  );
};

export default MFAPage;
