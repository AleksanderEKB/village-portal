// front/src/features/posts/pages/PostDetailPage.tsx
import React from 'react';

function useIsDesktop(breakpoint = 799) {
  const [isDesktop, setIsDesktop] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth > breakpoint : true
  );
  React.useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth > breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isDesktop;
}

const Desktop = React.lazy(() => import('./PostDetailPage.desktop'));
const Mobile = React.lazy(() => import('./PostDetailPage.mobile'));

const PostDetailPage: React.FC = () => {
  const isDesktop = useIsDesktop(799);
  return (
    <React.Suspense fallback={null}>
      {isDesktop ? <Desktop /> : <Mobile />}
    </React.Suspense>
  );
};

export default PostDetailPage;
