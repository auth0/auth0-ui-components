/**
 * Interface for Org Details messages that can be used in the UI.
 */

export interface OrgDetailsCustomMessages {
  sections: {
    settings: {
      title: string;
      fields: {
        name: {
          label: string;
          placeholder: string;
          helper_text: string;
          error: string;
        };
        display_name: {
          label: string;
          placeholder: string;
          helper_text: string;
          error: string;
        };
      };
    };
    branding: {
      title: string;
      fields: {
        logo: {
          label: string;
          helper_text: string;
          error: string;
        };
        primary_color: {
          label: string;
          helper_text: string;
          error: string;
        };
        page_background_color: {
          label: string;
          helper_text: string;
          error: string;
        };
      };
    };
  };
  unsaved_changes_text: string;
  submit_button_label: string;
  cancel_button_label: string;
}
