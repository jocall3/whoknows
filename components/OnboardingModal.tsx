import React from 'react';

interface OnboardingModalProps {
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Welcome to DevCore AI Toolkit!</h2>
        <p className="mb-6">Get started by exploring the features and connecting your workspace. You can always access onboarding tips from the Help menu.</p>
        <button
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};
