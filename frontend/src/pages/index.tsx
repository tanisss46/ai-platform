import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Image from 'next/image';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Layout>
      <Head>
        <title>AI Platform - Your Ultimate AI Ecosystem</title>
        <meta
          name="description"
          content="Access over 100 AI tools with integrated cloud storage, all in one platform."
        />
      </Head>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-700 to-primary-900 text-white">
          <div className="container mx-auto px-4 py-20 flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                The Ultimate AI Platform for Creators
              </h1>
              <p className="text-xl mb-8 text-primary-50">
                Access over 100 AI tools with integrated storage, all in one place.
                No local installation needed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Link 
                    href="/dashboard" 
                    className="btn btn-lg bg-white text-primary-900 hover:bg-primary-50"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/signup" 
                      className="btn btn-lg bg-white text-primary-900 hover:bg-primary-50"
                    >
                      Get Started
                    </Link>
                    <Link 
                      href="/login" 
                      className="btn btn-lg btn-outline border-2 border-white hover:bg-white/10"
                    >
                      Log In
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="w-full h-80 md:h-96 relative">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/30">
                  {/* Placeholder for hero image */}
                  <div className="w-full h-full bg-gradient-to-br from-primary-400/50 to-primary-800/50 flex items-center justify-center">
                    <span className="text-white text-lg font-medium">Platform Preview</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16 text-slate-900 dark:text-white">
              Everything You Need in One Place
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                  100+ AI Tools
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Access Midjourney, Stable Diffusion, MMAudio, and 100+ more AI tools without any installation.
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                  Integrated Cloud Storage
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  All your AI-generated content stored in one place with a Finder-like interface for easy management.
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                  LLM Command Center
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Control everything with natural language commands. Let the AI do the heavy lifting.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-slate-100 dark:bg-slate-800">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
              Ready to Revolutionize Your Creative Workflow?
            </h2>
            <p className="text-xl mb-10 max-w-3xl mx-auto text-slate-600 dark:text-slate-300">
              Join thousands of creators who are already using our platform to streamline their AI-powered creativity.
            </p>
            <Link
              href={isAuthenticated ? "/dashboard" : "/signup"}
              className="btn btn-lg btn-primary px-10"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started for Free'}
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Server-side logic can go here
  return {
    props: {},
  };
};
