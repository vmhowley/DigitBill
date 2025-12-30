import React, { useEffect } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { loaderService } from '../utils/loaderService';

// Configure NProgress
NProgress.configure({ showSpinner: false, minimum: 0.1 });

export const GlobalLoader: React.FC = () => {
  useEffect(() => {
    // Initial check
    if (loaderService.isLoading) {
      NProgress.start();
    }

    return loaderService.subscribe((loading) => {
      if (loading) {
        NProgress.start();
      } else {
        NProgress.done();
      }
    });
  }, []);

  return null;
};
