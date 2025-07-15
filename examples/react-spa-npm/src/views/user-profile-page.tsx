import { UserMFAMgmt } from '@auth0-web-ui-components/react';
import { useTranslation } from 'react-i18next';

const UserProfilePage = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <UserMFAMgmt
        localization={{ title: t('user-profile.mfa.title') }}
        factorConfig={{
          duo: {
            enabled: false,
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
