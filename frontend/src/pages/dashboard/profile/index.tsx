import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { RootState } from '@/store/store';
import { updateUser } from '@/store/slices/authSlice';

interface ProfileTab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface UserProfile {
  name: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordFormErrors, setPasswordFormErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Tabs configuration
  const tabs: ProfileTab[] = [
    {
      id: 'general',
      name: 'General',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'security',
      name: 'Security',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      id: 'subscription',
      name: 'Subscription',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      id: 'api-keys',
      name: 'API Keys',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
    },
  ];

  // Load user profile data
  useEffect(() => {
    if (!user) {
      return;
    }

    // In a real app, you would fetch this from an API
    // For this demo, we'll initialize with mock data
    setProfile({
      name: user.name || 'User',
      email: user.email || 'user@example.com',
      profilePicture: user.profilePicture,
      bio: 'AI enthusiast and creative technologist passionate about building innovative solutions with artificial intelligence.',
      jobTitle: 'Product Manager',
      company: 'Tech Innovations Inc.',
      location: 'San Francisco, CA',
      website: 'https://example.com',
      socialLinks: {
        twitter: 'twitter_handle',
        linkedin: 'linkedin_profile',
        github: 'github_username',
      },
    });

    setIsLoading(false);
  }, [user]);

  // Handle form input changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields like socialLinks.twitter
      const [parent, child] = name.split('.');
      setProfile({
        ...profile,
        [parent]: {
          ...profile[parent as keyof UserProfile],
          [child]: value,
        },
      });
    } else {
      setProfile({
        ...profile,
        [name]: value,
      });
    }
  };

  // Handle password form input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value,
    });
    
    // Clear error for this field
    if (passwordFormErrors[name as keyof typeof passwordFormErrors]) {
      setPasswordFormErrors({
        ...passwordFormErrors,
        [name]: '',
      });
    }
  };

  // Handle profile update
  const handleProfileUpdate = () => {
    // In a real app, you would submit this to an API
    // For this demo, we'll simulate a successful update
    setIsLoading(true);
    
    setTimeout(() => {
      // Update redux store with new user name
      dispatch(updateUser({ name: profile.name }));
      
      setIsEditing(false);
      setIsLoading(false);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Profile updated successfully!',
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }, 1000);
  };

  // Handle password change
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setPasswordFormErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    
    // Validate form
    let hasErrors = false;
    const errors = { ...passwordFormErrors };
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
      hasErrors = true;
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
      hasErrors = true;
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
      hasErrors = true;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      hasErrors = true;
    }
    
    if (hasErrors) {
      setPasswordFormErrors(errors);
      return;
    }
    
    // In a real app, you would submit this to an API
    // For this demo, we'll simulate a successful update
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Password updated successfully!',
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }, 1000);
  };

  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Render General Tab content
  const renderGeneralTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Profile Image */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 text-2xl font-bold">
            {profile.profilePicture ? (
              <img 
                src={profile.profilePicture} 
                alt={profile.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              getInitials(profile.name)
            )}
          </div>
          {isEditing && (
            <button className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-full p-1.5 border border-slate-200 dark:border-slate-700 shadow-sm">
              <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Profile Details */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {profile.name}
            </h1>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="mt-2 md:mt-0 inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
            {profile.bio}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {profile.jobTitle && (
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                <svg className="w-4 h-4 mr-1 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {profile.jobTitle}
                {profile.company && ` at ${profile.company}`}
              </div>
            )}
            {profile.location && (
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                <svg className="w-4 h-4 mr-1 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {profile.location}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isEditing ? (
        /* Edit Form */
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
            Edit Profile
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="form-control"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="form-control"
                  placeholder="your.email@example.com"
                  disabled
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Email cannot be changed. Contact support for assistance.
                </p>
              </div>
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio || ''}
                onChange={handleProfileChange}
                rows={3}
                className="form-control"
                placeholder="Tell us about yourself"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={profile.jobTitle || ''}
                  onChange={handleProfileChange}
                  className="form-control"
                  placeholder="Your job title"
                />
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={profile.company || ''}
                  onChange={handleProfileChange}
                  className="form-control"
                  placeholder="Your company"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={profile.location || ''}
                  onChange={handleProfileChange}
                  className="form-control"
                  placeholder="City, Country"
                />
              </div>
              
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={profile.website || ''}
                  onChange={handleProfileChange}
                  className="form-control"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Social Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="socialLinks.twitter" className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Twitter
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 dark:text-slate-400">@</span>
                    </div>
                    <input
                      type="text"
                      id="socialLinks.twitter"
                      name="socialLinks.twitter"
                      value={profile.socialLinks?.twitter || ''}
                      onChange={handleProfileChange}
                      className="form-control pl-7"
                      placeholder="username"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="socialLinks.linkedin" className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    id="socialLinks.linkedin"
                    name="socialLinks.linkedin"
                    value={profile.socialLinks?.linkedin || ''}
                    onChange={handleProfileChange}
                    className="form-control"
                    placeholder="LinkedIn profile"
                  />
                </div>
                
                <div>
                  <label htmlFor="socialLinks.github" className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    GitHub
                  </label>
                  <input
                    type="text"
                    id="socialLinks.github"
                    name="socialLinks.github"
                    value={profile.socialLinks?.github || ''}
                    onChange={handleProfileChange}
                    className="form-control"
                    placeholder="GitHub username"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-outline"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProfileUpdate}
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Profile Information */
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
              Basic Information
            </h2>
            
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              <div className="col-span-1">
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Full Name
                </dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                  {profile.name}
                </dd>
              </div>
              
              <div className="col-span-1">
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Email
                </dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                  {profile.email}
                </dd>
              </div>
              
              <div className="col-span-1">
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Job Title
                </dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                  {profile.jobTitle || '—'}
                </dd>
              </div>
              
              <div className="col-span-1">
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Company
                </dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                  {profile.company || '—'}
                </dd>
              </div>
              
              <div className="col-span-1">
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Location
                </dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                  {profile.location || '—'}
                </dd>
              </div>
              
              <div className="col-span-1">
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Website
                </dt>
                <dd className="mt-1 text-sm">
                  {profile.website ? (
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    <span className="text-slate-900 dark:text-white">—</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
          
          {/* Bio */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
              Bio
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">
              {profile.bio || 'No bio provided yet.'}
            </p>
          </div>
          
          {/* Social Links */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
              Social Media
            </h2>
            
            <ul className="space-y-3">
              {profile.socialLinks?.twitter && (
                <li className="flex items-center">
                  <div className="w-10 h-10 flex-shrink-0 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">Twitter</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      <a 
                        href={`https://twitter.com/${profile.socialLinks.twitter}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        @{profile.socialLinks.twitter}
                      </a>
                    </p>
                  </div>
                </li>
              )}
              
              {profile.socialLinks?.linkedin && (
                <li className="flex items-center">
                  <div className="w-10 h-10 flex-shrink-0 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">LinkedIn</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      <a 
                        href={`https://linkedin.com/in/${profile.socialLinks.linkedin}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        linkedin.com/in/{profile.socialLinks.linkedin}
                      </a>
                    </p>
                  </div>
                </li>
              )}
              
              {profile.socialLinks?.github && (
                <li className="flex items-center">
                  <div className="w-10 h-10 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">GitHub</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      <a 
                        href={`https://github.com/${profile.socialLinks.github}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        github.com/{profile.socialLinks.github}
                      </a>
                    </p>
                  </div>
                </li>
              )}
              
              {!profile.socialLinks?.twitter && !profile.socialLinks?.linkedin && !profile.socialLinks?.github && (
                <li className="text-sm text-slate-500 dark:text-slate-400">
                  No social media links provided.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  // Render Security Tab content
  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          Change Password
        </h2>
        
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              className={`form-control ${
                passwordFormErrors.currentPassword ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              placeholder="Enter your current password"
            />
            {passwordFormErrors.currentPassword && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {passwordFormErrors.currentPassword}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              className={`form-control ${
                passwordFormErrors.newPassword ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              placeholder="Enter new password"
            />
            {passwordFormErrors.newPassword ? (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {passwordFormErrors.newPassword}
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              className={`form-control ${
                passwordFormErrors.confirmPassword ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              placeholder="Confirm new password"
            />
            {passwordFormErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {passwordFormErrors.confirmPassword}
              </p>
            )}
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Two-Factor Authentication */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">
            Two-Factor Authentication
          </h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            Not Enabled
          </span>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Two-factor authentication adds an extra layer of security to your account. In addition to your password, you'll need to enter a code from your phone when you log in.
        </p>
        
        <button className="btn btn-outline">
          Set up two-factor authentication
        </button>
      </div>
      
      {/* Login History */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          Login History
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  IP Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Device / Browser
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                  Mar 16, 2025, 9:23 AM
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  192.168.1.1
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  Chrome / macOS
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  San Francisco, CA
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                  Mar 15, 2025, 3:12 PM
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  192.168.1.1
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  Chrome / macOS
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  San Francisco, CA
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                  Mar 14, 2025, 11:05 AM
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  192.168.1.1
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  Safari / iOS
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  San Francisco, CA
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Sessions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">
            Active Sessions
          </h2>
          <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
            Sign out all devices
          </button>
        </div>
        
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          <li className="py-3 flex items-start justify-between">
            <div className="flex items-center">
              <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-md mr-3">
                <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  MacBook Pro
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Chrome • San Francisco, CA • Current Session
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <span className="inline-flex mr-2 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Active Now
              </span>
            </div>
          </li>
          <li className="py-3 flex items-start justify-between">
            <div className="flex items-center">
              <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-md mr-3">
                <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  iPhone 13
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Safari • San Francisco, CA • Last active 2 days ago
                </div>
              </div>
            </div>
            <button className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
              Sign out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );

  // Render Subscription Tab content
  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">
            Current Plan
          </h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            Active
          </span>
        </div>
        
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 flex items-center justify-center bg-primary-100 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400 flex-shrink-0">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Pro Plan
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              $19.99 / month • Renews on April 15, 2025
            </p>
            <div className="flex items-center space-x-2">
              <button className="btn btn-sm btn-outline">
                Upgrade
              </button>
              <button className="btn btn-sm btn-outline text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">
                Cancel Plan
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Credits */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          AI Credits
        </h2>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-900 dark:text-white">
              Available Credits
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {user?.credits || 0} credits
            </div>
          </div>
          
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full" 
              style={{ width: `${Math.min(100, ((user?.credits || 0) / 100) * 100)}%` }}
            ></div>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Your Pro Plan includes 100 credits per month. Credits reset on the 15th of each month.
          </p>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
            Purchase Additional Credits
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm cursor-pointer">
              <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                100 Credits
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                $9.99
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                $0.10 per credit
              </div>
            </div>
            
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm cursor-pointer">
              <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                500 Credits
              </div>
              <div className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-2">
                $39.99 <span className="text-xs text-slate-500 dark:text-slate-400 line-through ml-1">$49.99</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                $0.08 per credit
              </div>
            </div>
            
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm cursor-pointer">
              <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                1000 Credits
              </div>
              <div className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-2">
                $69.99 <span className="text-xs text-slate-500 dark:text-slate-400 line-through ml-1">$99.99</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                $0.07 per credit
              </div>
            </div>
          </div>
          
          <button className="btn btn-primary w-full sm:w-auto">
            Purchase Credits
          </button>
        </div>
      </div>
      
      {/* Billing History */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          Billing History
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Invoice</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                  Mar 15, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  Pro Plan Subscription
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                  $19.99
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Paid
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300">
                    Download
                  </a>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                  Feb 15, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  Pro Plan Subscription
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                  $19.99
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Paid
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300">
                    Download
                  </a>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                  Feb 10, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  Additional Credits (100)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                  $9.99
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Paid
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300">
                    Download
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render API Keys Tab content
  const renderApiKeysTab = () => (
    <div className="space-y-6">
      {/* API Keys Info */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">
            API Keys
          </h2>
          <button className="btn btn-primary btn-sm">
            Create New API Key
          </button>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          API keys allow you to authenticate requests to the AI Platform API. Keep your API keys secure – do not share them in publicly accessible areas such as GitHub or client-side code.
        </p>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Last Used
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    Default Key
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    ai_pk_***********************
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  Mar 10, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  Mar 15, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 mr-3">
                    View
                  </button>
                  <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                    Revoke
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    Development Key
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    ai_sk_***********************
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  Feb 28, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  Mar 14, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 mr-3">
                    View
                  </button>
                  <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                    Revoke
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Usage Limits */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          API Usage and Limits
        </h2>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-900 dark:text-white">
              Monthly API Requests
            </div>
            <div className="text-sm font-medium text-slate-900 dark:text-white">
              15,240 / 50,000
            </div>
          </div>
          
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full"
              style={{ width: '30%' }}
            ></div>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Your Pro Plan includes 50,000 API requests per month.
          </p>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-900 dark:text-white">
              Rate Limit
            </div>
            <div className="text-sm font-medium text-slate-900 dark:text-white">
              10 requests / second
            </div>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This is your current rate limit per API key. Contact us if you need higher limits.
          </p>
        </div>
        
        <a href="#" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 font-medium">
          View API Documentation →
        </a>
      </div>
    </div>
  );

  // Render current tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralTab();
      case 'security':
        return renderSecurityTab();
      case 'subscription':
        return renderSubscriptionTab();
      case 'api-keys':
        return renderApiKeysTab();
      default:
        return renderGeneralTab();
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-md ${
            notification.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm ${
                  notification.type === 'success'
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <div className="flex flex-col md:flex-row md:space-x-6">
          <div className="w-full md:w-64 mb-6 md:mb-0">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-1">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === tab.id
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/25'
                    }`}
                  >
                    <span className="truncate flex items-center">
                      <span className="mr-3">{tab.icon}</span>
                      {tab.name}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="loading loading-lg"></div>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
