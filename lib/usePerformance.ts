import { useEffect, useState, useCallback } from 'react';

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
}

interface PerformanceObserver {
  observe: (entry: any) => void;
  disconnect: () => void;
}

export const usePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });

  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if Performance Observer is supported
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      setIsSupported(true);
    }
  }, []);

  const measureTTFB = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        setMetrics(prev => ({ ...prev, ttfb }));
      }
    }
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    // First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }));
      }
    });

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
      }
    });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'first-input') {
          const fidEntry = entry as PerformanceEventTiming;
          setMetrics(prev => ({ ...prev, fid: fidEntry.processingStart - fidEntry.startTime }));
        }
      });
    });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      setMetrics(prev => ({ ...prev, cls: clsValue }));
    });

    try {
      // Observe different performance metrics
      fcpObserver.observe({ entryTypes: ['paint'] });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      fidObserver.observe({ entryTypes: ['first-input'] });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Measure TTFB after a short delay
      setTimeout(measureTTFB, 100);
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, [isSupported, measureTTFB]);

  const getPerformanceScore = useCallback(() => {
    if (!metrics.fcp || !metrics.lcp || !metrics.fid || !metrics.cls) {
      return null;
    }

    // Calculate performance score based on Core Web Vitals
    let score = 100;

    // FCP scoring (0-100)
    if (metrics.fcp <= 1800) score -= 0;
    else if (metrics.fcp <= 3000) score -= 10;
    else score -= 25;

    // LCP scoring (0-100)
    if (metrics.lcp <= 2500) score -= 0;
    else if (metrics.lcp <= 4000) score -= 10;
    else score -= 25;

    // FID scoring (0-100)
    if (metrics.fid <= 100) score -= 0;
    else if (metrics.fid <= 300) score -= 10;
    else score -= 25;

    // CLS scoring (0-100)
    if (metrics.cls <= 0.1) score -= 0;
    else if (metrics.cls <= 0.25) score -= 10;
    else score -= 25;

    return Math.max(0, score);
  }, [metrics]);

  const logPerformanceMetrics = useCallback(() => {
    if (typeof window !== 'undefined' && 'console' in window) {
      console.group('🚀 Performance Metrics');
      console.log('FCP:', metrics.fcp ? `${metrics.fcp.toFixed(2)}ms` : 'N/A');
      console.log('LCP:', metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : 'N/A');
      console.log('FID:', metrics.fid ? `${metrics.fid.toFixed(2)}ms` : 'N/A');
      console.log('CLS:', metrics.cls ? metrics.cls.toFixed(3) : 'N/A');
      console.log('TTFB:', metrics.ttfb ? `${metrics.ttfb.toFixed(2)}ms` : 'N/A');
      console.log('Score:', getPerformanceScore() || 'N/A');
      console.groupEnd();
    }
  }, [metrics, getPerformanceScore]);

  return {
    metrics,
    isSupported,
    getPerformanceScore,
    logPerformanceMetrics,
  };
};
