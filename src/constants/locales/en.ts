import type { vi } from './vi';

type DeepRecord<T> = {
  [K in keyof T]: T[K] extends object ? DeepRecord<T[K]> : string;
};

export const en: DeepRecord<typeof vi> = {
  mood: {
    terrible: 'TERRIBLE',
    bad: 'ANGRY',
    neutral: 'NEUTRAL',
    good: 'HAPPY',
    excellent: 'EXCELLENT',
  },

  entry: {
    screenTitle: 'How are you feeling today?',
    editTitle: 'Edit journal',
    titleLabel: 'Title',
    titlePlaceholder: 'Feeling down again',
    moodLabel: 'Choose your mood',
    contentLabel: 'What are you thinking? Write it down...',
    contentPlaceholder:
      "I'm feeling sad but I don't want to make a big deal out of it. I don't know where to start.",
    addPhoto: 'Add Photo',
    submitButton: 'Save emotion',
    counter: '{{count}}/300',
    selectionLimitTitle: 'Selection limit',
    selectionLimitMessage: 'You can attach up to 5 images.',
    selectionLimitTruncatedMessage: 'Only the first 5 images were added.',
    validationTitle: 'Validation',
    validationContentRequired: 'Please enter your diary content.',
    successTitle: 'Success!',
    successDiaryId: 'Diary entry ID: {{id}}',
    errorTitle: 'Error',
    errorCreateDiary: 'Failed to create diary entry.',
  },

  dashboard: {
    loading: 'Loading journal entries...',
    headerTitle: 'My Stories',
    headerSubtitle: 'Emotion journal',
    chartPlaceholder: 'Chart',
    sectionAll: 'All',
    sortNewest: 'Newest',
    emptyState: 'No journal entries yet. Create your first one.',
    entryFallbackTitle: 'Emotion journal',
    statsTitle: 'Emotion statistics',
    completedCount: '{{count}}/365',
    statsCompleted: 'Completed',
    statsNeutral: 'Neutral',
  },

  overview: {
    loading: 'Loading mood data...',
    headerTitle: 'Mind Corner',
    subtitleLine1: 'This year journal.',
    subtitleLine2: 'Keep up the momentum!',
    yearCount: '{{count}}/365',
    sectionTitle: 'Mood stream',
    monthTitle: 'Month {{month}}/{{year}}',
    weekdayMon: 'Mon',
    weekdayTue: 'Tue',
    weekdayWed: 'Wed',
    weekdayThu: 'Thu',
    weekdayFri: 'Fri',
    weekdaySat: 'Sat',
    weekdaySun: 'Sun',
    legendNegative: 'Negative',
    legendNeutral: 'Neutral',
    legendPositive: 'Positive',
  },

  sleep: {
    entry: {
      headerTitle: 'Sleep Quality',
      mainQuestion: 'Did you sleep well last night?',
      bedTimeLabel: 'Bedtime',
      wakeTimeLabel: 'Wake time',
      noteLabel: 'Add a note',
      notePlaceholder: 'Describe how you felt when you woke up...',
      successTitle: 'Success',
      successMessage: 'Your sleep entry has been updated.',
      errorTitle: 'Failed',
      errorMessage: 'Unable to update sleep entry. Please try again.',
    },
    overview: {
      headerTitle: 'Dream Quality',
      subtitle: 'average this week',
      chartTitle: 'Sleep Statistics',
      loading: 'Loading week data...',
    },
  },

  food: {
    meal: {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack: 'Snack',
    },
    satiety: {
      energized: 'Energized',
      normal: 'Normal',
      indulgent: 'Indulgent',
      overate: 'Overate',
      skipped: 'Skipped',
    },
    entry: {
      screenTitle: 'Nutrition Journal',
      mainQuestion: 'Did you eat well today?',
      descriptionLabel: 'You can describe more here...',
      descriptionPlaceholder: 'Describe your meal in detail...',
      submitButton: 'Update nutrition',
      counter: '{{count}}/300',
      successTitle: 'Success',
      successMessage: 'Your nutrition entry has been updated.',
      errorTitle: 'Failed',
      errorMessage: 'Unable to update nutrition. Please try again.',
    },
    overview: {
      headerTitle: 'Nutrition Journal',
      subtitle: 'Your eating quality today',
      noData: 'No data yet',
      chartTitle: 'Nutrition Statistics',
      loading: 'Loading week data...',
    },
  },

  auth: {
    login: {
      title: 'Login',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      submitButton: 'Sign in',
      noAccountText: "Don't have an account?",
      registerLink: 'Sign up',
      forgotPassword: 'Forgot password',
      validationError: 'Please enter all information',
      failureTitle: 'Login failed',
      failureMessage: 'Please check your email or password',
    },
    register: {
      title: 'Sign up',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      confirmPasswordLabel: 'Confirm password',
      agreeTerms: 'I agree to the terms of service',
      submitButton: 'Create account',
      validationError: 'Please fill in all information',
      successTitle: 'Success',
      successMessage: 'Account created successfully!',
    },
  },

  booking: {
    therapistFilter: {
      changeTherapist: 'I want to change therapist',
      customizationTitle: 'Customize your therapist preferences',
      question: 'connect with a therapist?',
      chatButton: 'Chat with therapist',
    },
  },
} as const;
