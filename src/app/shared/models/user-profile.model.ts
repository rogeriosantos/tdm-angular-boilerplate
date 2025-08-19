export interface UserProfile {
  username: string;
  department?: string;
  email?: string;
  picture?: string;
  locale?: string;
  data_language?: string;
  // Add other properties as needed
}

export interface UserProfileViewModel {
  username: string;
  department: string;
  uiLanguage: string;
  dataLanguage: string;
  picture?: string;
}
